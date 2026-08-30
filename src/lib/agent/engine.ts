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
2. **Deterministic Pricing**: When citing prices, always format in Indian Rupees (e.g. ₹59,999 or ₹4,999).
3. **Reasoned Upsells**: When a customer is interested in a main product (e.g. a laptop or mechanical keyboard), proactively suggest a compatible accessory or upgrade (e.g. ergonomic mouse, laptop stand, USB-C dock). ALWAYS provide a clear 1-line reason explaining why it pairs well (e.g., "Programmers frequently pair this with the UltraBook for multi-display productivity").
4. **Cart Actions**: When the customer explicitly asks to add an item to their cart ("add to cart", "buy this", "put in my cart"), call the "addToCart" tool.
5. **Tone & Style**: Friendly, professional, concise, and helpful. Do not use any markdowen formatting. Never output raw JSON in your final user-facing text.
`;

export async function runAgentLoop({
  messages,
  sessionId,
  merchantId,
}: {
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>;
  sessionId: string;
  merchantId?: string;
}): Promise<AgentRunResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || "stealth/ox-alpha";

  const toolExecutions: ToolExecutionRecord[] = [];

  // If no API key configured, use intelligent rule engine fallback
  if (!apiKey || apiKey.includes("placeholder")) {
    return runFallbackAgentEngine(messages, sessionId, merchantId);
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
        console.warn(`OpenRouter API returned ${response.status}: ${errorText}. Falling back to resilient engine.`);
        return runFallbackAgentEngine(messages, sessionId, merchantId);
      }

      const data = await response.json();
      const choice = data.choices?.[0];

      if (!choice || !choice.message) {
        throw new Error("Invalid response structure from OpenRouter model.");
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
          if (!toolArgs.sessionId) toolArgs.sessionId = sessionId;

          // Execute tool against PostgreSQL
          const result = await executeAgentTool(toolName, toolArgs, { sessionId, merchantId });

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
        return {
          reply: message.content || "I have verified the inventory details for you.",
          toolExecutions,
        };
      }
    }

    return {
      reply: "Here are the verified catalog details matching your query.",
      toolExecutions,
    };
  } catch (error: any) {
    console.error("Error executing OpenRouter agent loop:", error);
    return runFallbackAgentEngine(messages, sessionId, merchantId);
  }
}

// Resilient Fallback Engine for instant local simulation or connection issues
async function runFallbackAgentEngine(
  messages: Array<{ role: string; content: string }>,
  sessionId: string,
  merchantId?: string
): Promise<AgentRunResult> {
  const toolExecutions: ToolExecutionRecord[] = [];
  const latestMessage = messages[messages.length - 1]?.content || "";
  const lower = latestMessage.toLowerCase();

  // 1. Detect Direct Add to Cart by ID or name
  if (lower.includes("add") || lower.includes("buy") || lower.includes("put in") || lower.includes("add to cart")) {
    // Check if product ID is explicitly passed like "Add product ID cm... to my shopping cart"
    const idMatch = latestMessage.match(/(?:product id|id)\s*([a-zA-Z0-9_-]+)/i);
    let productId = idMatch ? idMatch[1] : undefined;

    if (!productId) {
      // Try finding product by keywords in the message
      const searchResult = await executeAgentTool("searchProducts", { query: latestMessage.replace(/add|to|my|cart|shopping|please|buy/gi, "").trim(), inStockOnly: true }, { sessionId });
      if (searchResult.products && searchResult.products.length > 0) {
        productId = searchResult.products[0].id;
      }
    }

    if (productId) {
      const addResult = await executeAgentTool(
        "addToCart",
        { productId, quantity: 1, sessionId },
        { sessionId }
      );

      toolExecutions.push({
        id: `call_${Date.now()}_add`,
        name: "addToCart",
        args: { productId, quantity: 1, sessionId },
        result: addResult,
      });

      if (addResult.success) {
        // Generate an upsell recommendation for the user
        const recs = await executeAgentTool("getRecommendations", { sessionId }, { sessionId });
        toolExecutions.push({
          id: `call_${Date.now()}_recs`,
          name: "getRecommendations",
          args: { sessionId },
          result: recs,
        });

        let reply = `✅ Added to cart: ${addResult.message}\n\n`;

        if (recs.recommendations && recs.recommendations.length > 0) {
          const topRec = recs.recommendations[0];
          reply += `✨ AI Upsell Recommendation:\n` +
            `Would you like to pair this with the ${topRec.name} for ₹${topRec.price.toLocaleString("en-IN")}?\n` +
            `> Reason: ${topRec.reason}\n\n` +
            `You can click Add in the recommendation card or check your updated cart drawer on the right!`;
        } else {
          reply += `Your cart has been updated. Open the Cart Drawer to review your items and proceed to checkout!`;
        }

        return { reply, toolExecutions };
      } else {
        return {
          reply: `⚠️ Could not add to cart: ${addResult.error || "Item is currently unavailable or exceeds stock."}`,
          toolExecutions,
        };
      }
    }
  }

  // 2. Detect Remove from Cart
  if (lower.includes("remove") || lower.includes("delete from cart") || lower.includes("clear item")) {
    const idMatch = latestMessage.match(/(?:product id|id)\s*([a-zA-Z0-9_-]+)/i);
    if (idMatch) {
      const removeResult = await executeAgentTool("removeFromCart", { productId: idMatch[1], sessionId }, { sessionId });
      toolExecutions.push({
        id: `call_${Date.now()}_remove`,
        name: "removeFromCart",
        args: { productId: idMatch[1], sessionId },
        result: removeResult,
      });
      return {
        reply: `🗑️ ${removeResult.message || "Item has been removed from your shopping cart."}`,
        toolExecutions,
      };
    }
  }

  // 3. Detect Cart Total or Review Request
  if (lower.includes("cart") && (lower.includes("total") || lower.includes("what") || lower.includes("show") || lower.includes("review") || lower.includes("checkout"))) {
    const cartResult = await executeAgentTool("calculateTotal", { sessionId }, { sessionId });
    toolExecutions.push({
      id: `call_${Date.now()}_total`,
      name: "calculateTotal",
      args: { sessionId },
      result: cartResult,
    });

    if (!cartResult || cartResult.itemCount === 0 || !Array.isArray(cartResult.items)) {
      return {
        reply: `Your shopping cart is currently empty! Tell me what tech gadgets or developer gear you are looking for and I'll find the best in-stock matches.`,
        toolExecutions,
      };
    }

    const items = cartResult.items as Array<any>;
    const subtotal = Number(cartResult.subtotal || 0);
    const totalAmount = Number(cartResult.totalAmount || subtotal);

    let reply = `🛒 Cart Summary (${cartResult.itemCount} items):\n\n`;
    for (const it of items) {
      const lineTotal = Number(it.lineTotal || it.subtotal || (it.price || it.unitPrice || 0) * (it.quantity || 1));
      reply += `* ${it.name} × ${it.quantity} — ₹${lineTotal.toLocaleString("en-IN")}\n`;
    }
    reply += `\nSubtotal: ₹${subtotal.toLocaleString("en-IN")}\n` +
      `Shipping: Free Express Delivery\n` +
      `Total Amount: ₹${totalAmount.toLocaleString("en-IN")}\n\n` +
      `Ready to proceed? Open the cart drawer to complete checkout with deterministic server verification.`;

    return { reply, toolExecutions };
  }

  // 4. Detect Search / Discovery / Recommendations
  if (
    lower.includes("laptop") ||
    lower.includes("keyboard") ||
    lower.includes("mouse") ||
    lower.includes("audio") ||
    lower.includes("headphone") ||
    lower.includes("find") ||
    lower.includes("need") ||
    lower.includes("suggest") ||
    lower.includes("recommend") ||
    lower.includes("coding") ||
    lower.includes("price") ||
    lower.includes("under") ||
    lower.includes("accessories")
  ) {
    let category: string | undefined = undefined;
    if (lower.includes("laptop")) category = "Laptops";
    else if (lower.includes("keyboard") || lower.includes("mouse")) category = "Keyboards & Mice";
    else if (lower.includes("audio") || lower.includes("headphone") || lower.includes("earphone")) category = "Audio";
    else if (lower.includes("accessories") || lower.includes("dock") || lower.includes("hub")) category = "Accessories";

    // Extract price if mentioned (e.g. 60k, 80000)
    let maxPrice: number | undefined = undefined;
    const priceMatch = lower.match(/(?:under|below|budget)\s*(?:₹|rs\.?)?\s*(\d+)(?:k|000)?/i);
    if (priceMatch) {
      const rawNum = parseInt(priceMatch[1]);
      maxPrice = lower.includes("k") || rawNum < 1000 ? rawNum * 1000 : rawNum;
    }

    const searchResult = await executeAgentTool(
      "searchProducts",
      { query: category ? undefined : latestMessage, category, maxPrice, inStockOnly: true },
      { sessionId, merchantId }
    );

    toolExecutions.push({
      id: `call_${Date.now()}_search`,
      name: "searchProducts",
      args: { category, maxPrice, query: category ? undefined : latestMessage },
      result: searchResult,
    });

    const products = searchResult.products || [];

    if (products.length === 0) {
      return {
        reply: `I searched our live inventory but couldn't find any in-stock items directly matching that query. Would you like me to show our top-rated laptops or mechanical keyboards instead?`,
        toolExecutions,
      };
    }

    const topProduct = products[0];

    // Generate upsell recommendations with explainable reason
    const recsResult = await executeAgentTool("getRecommendations", { sessionId, category: topProduct.category }, { sessionId });
    toolExecutions.push({
      id: `call_${Date.now()}_recs`,
      name: "getRecommendations",
      args: { sessionId, category: topProduct.category },
      result: recsResult,
    });

    const topUpsell = recsResult.recommendations?.[0];

    let reply = `Here is our top verified match from the inventory:\n\n` +
      `### 💻 ${topProduct.name}\n` +
      `* Price: ₹${topProduct.price.toLocaleString("en-IN")}\n` +
      `* Stock: ${topProduct.stock} units available in database\n` +
      `* Category: \`${topProduct.category}\`\n` +
      `* Overview: ${topProduct.description}\n\n`;

    if (topUpsell) {
      reply += `✨ AI Upsell Pairing:\n` +
        `I recommend pairing this with the ${topUpsell.name} (₹${topUpsell.price.toLocaleString("en-IN")}).\n` +
        `> *Reason: ${topUpsell.reason}*\n\n`;
    }

    reply += `Would you like me to add ${topProduct.name} to your shopping cart?`;

    return { reply, toolExecutions };
  }

  // Default Greeting / General Query
  return {
    reply: `Hello! I am your FlowCommerce AI Shopping Copilot. I can help you search our verified tech inventory, recommend matching accessories with explainable reasoning, manage your cart, and check real-time stock.\n\nTry asking me:\n* "Find a developer laptop with 32GB RAM under ₹80,000"\n* "Recommend an ergonomic mechanical keyboard for fast typing"\n* "What accessories pair best with my setup?"`,
    toolExecutions,
  };
}

