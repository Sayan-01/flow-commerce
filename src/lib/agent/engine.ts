import { AGENT_TOOLS_DEFINITIONS, executeAgentTool } from "./tools";

export interface AgentChatMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string | null;
  name?: string;
  tool_call_id?: string;
  tool_calls?: Array<{
    id: string;
    type: "function";
    function: {
      name: string;
      arguments: string;
    };
  }>;
}

export interface ToolExecutionRecord {
  id: string;
  name: string;
  args: Record<string, any>;
  result: any;
}

export interface AgentRunResult {
  reply: string;
  toolExecutions: ToolExecutionRecord[];
}

const FLOW_COMMERCE_SYSTEM_PROMPT = `You are the FlowCommerce AI Shopping Copilot — an expert sales agent for tech gadgets, developer gear, and electronics.

CRITICAL BOUNDED COMMERCE RULES (Enterprise Safety Guardrails):
1. **Zero-Money Hallucinations**: NEVER assume, guess, or invent prices or stock. ALWAYS invoke "searchProducts" or "getProductDetails" before discussing any product.
2. **Deterministic Pricing**: When citing prices, always format in Indian Rupees (e.g. ₹9,999 or ₹4,999).
3. **Reasoned Upsells**: When a customer is interested in a main product (e.g. a laptop, monitor, or mechanical keyboard), proactively suggest a compatible accessory or upgrade (e.g. ergonomic mouse, laptop stand, monitor light bar, USB-C dock). ALWAYS provide a clear 1-line reason explaining why it pairs well (e.g., "Programmers frequently pair this monitor with the LumiBar screen light for eye-care productivity").
4. **Cart Actions**: When the customer explicitly asks to add an item to their cart ("add to cart", "buy this", "put in my cart"), call the "addToCart" tool.
5. **Tool Execution Accuracy**: When calling "searchProducts", pass clean product keywords into 'query' (e.g. 'headphones', 'fhd ips monitor', 'mechanical keyboard') and numeric budgets into 'maxPrice' (e.g. 5000). Avoid conversational sentences in 'query'.
6. **No Search Loops & Budget Alternatives**: Do not call "searchProducts" more than twice in one turn. If no items match the user's exact budget, inform the user, present the closest available higher-tier model or budget alternatives provided in the tool output, and ask if they'd like to explore them.
7. **Tone & Style**: Friendly, professional, concise, and helpful. Use clear markdown formatting (bolding, lists, pricing highlights). Never output raw JSON in your final user-facing text.
`;

export async function runAgentLoop({
  messages,
  userId,
  sessionId,
  merchantId,
}: {
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>;
  userId?: string;
  sessionId?: string;
  merchantId?: string;
}): Promise<AgentRunResult> {
  const effectiveUserId = userId || sessionId || "";
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || "meta-llama/llama-3.3-70b-instruct";

  const toolExecutions: ToolExecutionRecord[] = [];

  // Require a valid API key — no silent fallback
  if (!apiKey || apiKey.includes("placeholder")) {
    return {
      reply: "OpenRouter API key is not configured",
      toolExecutions,
    };
  }

  try {
    // Build initial OpenAI-compatible message list
    const conversationHistory: AgentChatMessage[] = [
      { role: "system", content: FLOW_COMMERCE_SYSTEM_PROMPT },
      ...messages.map((m) => ({
        role: m.role as "user" | "assistant" | "system",
        content: m.content,
      })),
    ];

    let loopCount = 0;
    const maxLoops = 4;

    while (loopCount < maxLoops) {
      loopCount++;

      const payload = {
        model,
        messages: conversationHistory,
        tools: AGENT_TOOLS_DEFINITIONS,
        tool_choice: "auto",
        temperature: 0.3,
      };

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": "https://flow-commerce.ai",
          "X-Title": "FlowCommerce AI Shopping Agent",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`OpenRouter API error ${response.status}: ${errorText}`);
        return {
          reply: `❌ The AI service returned an error (status ${response.status}). Please try again in a moment. If this keeps happening, check that your API key is valid.`,
          toolExecutions,
        };
      }

      const data = await response.json();
      const choice = data.choices?.[0];

      if (!choice || !choice.message) {
        return {
          reply: "❌ Received an unexpected response from the AI service. Please try again.",
          toolExecutions,
        };
      }

      const message = choice.message;

      // Check if model called tools
      if (message.tool_calls && message.tool_calls.length > 0) {
        conversationHistory.push({
          role: "assistant",
          content: message.content || null,
          tool_calls: message.tool_calls,
        });

        // Execute all tool calls
        for (const toolCall of message.tool_calls) {
          const toolName = toolCall.function.name;
          let toolArgs: Record<string, any> = {};

          try {
            toolArgs = JSON.parse(toolCall.function.arguments || "{}");
          } catch (e) {
            console.error("Failed to parse tool arguments:", toolCall.function.arguments);
          }

          // Inject context
          toolArgs.userId = effectiveUserId;

          // Execute tool against PostgreSQL
          const result = await executeAgentTool(toolName, toolArgs, { userId: effectiveUserId, merchantId });

          toolExecutions.push({
            id: toolCall.id,
            name: toolName,
            args: toolArgs,
            result,
          });

          // Feed tool output back to conversation history
          conversationHistory.push({
            role: "tool",
            tool_call_id: toolCall.id,
            name: toolName,
            content: JSON.stringify(result),
          });
        }
      } else {
        // Final assistant response generated
        const content = message.content?.trim();
        if (content) {
          return {
            reply: content,
            toolExecutions,
          };
        }

        // If model executed tools but returned an empty text string:
        if (toolExecutions.length > 0) {
          const lastExec = toolExecutions[toolExecutions.length - 1];
          const result = lastExec.result;

          if (result?.products && result.products.length > 0) {
            const list = result.products
              .map((p: any) => `* **${p.name}** — ₹${Number(p.price).toLocaleString("en-IN")}`)
              .join("\n");
            return {
              reply: `Here are the matching products from our live catalog:\n\n${list}\n\nWould you like more details on any of these, or would you like to add one to your cart?`,
              toolExecutions,
            };
          }

          if (result?.closestAvailableMatches || result?.budgetAlternatives) {
            let msg = `I checked our inventory, but we don't have items matching that exact budget.\n\n`;
            if (result.closestAvailableMatches?.length > 0) {
              msg += `**Closest available in our store:**\n` +
                result.closestAvailableMatches
                  .map((p: any) => `* **${p.name}** — ₹${Number(p.price).toLocaleString("en-IN")} (${p.category})`)
                  .join("\n") + "\n\n";
            }
            if (result.budgetAlternatives?.length > 0) {
              msg += `**Alternatives within your budget:**\n` +
                result.budgetAlternatives
                  .map((p: any) => `* **${p.name}** — ₹${Number(p.price).toLocaleString("en-IN")} (${p.category})`)
                  .join("\n") + "\n\n";
            }
            msg += `Would you like to explore any of these options?`;
            return {
              reply: msg,
              toolExecutions,
            };
          }
        }

        return {
          reply: "I'm sorry, I couldn't find matching items in our catalog for that request. Could you try adjusting your budget or searching for categories like keyboards, monitors, or audio gear?",
          toolExecutions,
        };
      }
    }

    // Max tool-call loops exhausted: synthesize from executed tools rather than giving up
    if (toolExecutions.length > 0) {
      const lastExec = toolExecutions[toolExecutions.length - 1];
      const result = lastExec.result;

      if (result?.closestAvailableMatches || result?.budgetAlternatives) {
        let msg = `We don't currently have products matching that exact price in our inventory.\n\n`;
        if (result.closestAvailableMatches?.length > 0) {
          msg += `**Closest available models:**\n` +
            result.closestAvailableMatches
              .map((p: any) => `* **${p.name}** — ₹${Number(p.price).toLocaleString("en-IN")}`)
              .join("\n") + "\n\n";
        }
        if (result.budgetAlternatives?.length > 0) {
          msg += `**Available within your budget:**\n` +
            result.budgetAlternatives
              .map((p: any) => `* **${p.name}** — ₹${Number(p.price).toLocaleString("en-IN")}`)
              .join("\n") + "\n\n";
        }
        msg += `Let me know if any of these work for you!`;
        return {
          reply: msg,
          toolExecutions,
        };
      }
    }

    return {
      reply: "I checked our inventory for your query. Would you like to check out another category or adjust your budget?",
      toolExecutions,
    };
  } catch (error: any) {
    console.error("Agent loop error:", error);
    return {
      reply: `❌ Something went wrong while processing your request. Please try again. If this keeps happening, contact support.`,
      toolExecutions,
    };
  }
}

