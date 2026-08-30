import { prisma } from "@/lib/prisma";
import { createOrderProposal } from "@/lib/orders";

// OpenAI Function / Tool Definitions for OpenRouter / Gemini
export const AGENT_TOOLS_DEFINITIONS = [
  {
    type: "function",
    function: {
      name: "searchProducts",
      description: "Search for available products in the catalog by keyword query, category, maximum price (INR), or specific tags.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Keyword to search product name, description, or features (e.g. 'laptop', 'mechanical keyboard', 'ergonomic').",
          },
          category: {
            type: "string",
            description: "Optional product category filter (e.g. 'Laptops', 'Keyboards & Mice', 'Audio', 'Accessories').",
          },
          maxPrice: {
            type: "number",
            description: "Optional maximum price filter in Indian Rupees (INR).",
          },
          tag: {
            type: "string",
            description: "Optional tag filter (e.g. 'coding', 'wireless', 'mechanical', 'portable').",
          },
          inStockOnly: {
            type: "boolean",
            description: "Whether to only return products with stock > 0 (defaults to true).",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getProductDetails",
      description: "Get full details, real-time stock count, and metadata of a specific product by product ID or exact name.",
      parameters: {
        type: "object",
        properties: {
          productId: {
            type: "string",
            description: "The unique ID of the product.",
          },
          productName: {
            type: "string",
            description: "The name of the product if ID is not known.",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "checkInventory",
      description: "Check the exact live stock and inventory count of one or multiple product IDs directly against the PostgreSQL database.",
      parameters: {
        type: "object",
        properties: {
          productIds: {
            type: "array",
            items: { type: "string" },
            description: "Array of product ID strings to check stock for.",
          },
        },
        required: ["productIds"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getCart",
      description: "Retrieve the current active cart items, verified unit prices, quantities, and calculated subtotal from the database.",
      parameters: {
        type: "object",
        properties: {
          sessionId: {
            type: "string",
            description: "The customer's session ID.",
          },
          cartId: {
            type: "string",
            description: "The cart ID if known.",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "addToCart",
      description: "Add a verified in-stock product to the customer's cart or increment its quantity. Server verifies price and stock before adding.",
      parameters: {
        type: "object",
        properties: {
          productId: {
            type: "string",
            description: "The ID of the product to add to cart.",
          },
          quantity: {
            type: "number",
            description: "Quantity to add (must be at least 1, defaults to 1).",
          },
          sessionId: {
            type: "string",
            description: "The customer's active session ID.",
          },
        },
        required: ["productId", "sessionId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "removeFromCart",
      description: "Remove a product completely or decrement its quantity from the customer's cart.",
      parameters: {
        type: "object",
        properties: {
          productId: {
            type: "string",
            description: "The product ID to remove.",
          },
          sessionId: {
            type: "string",
            description: "The customer's active session ID.",
          },
          removeAll: {
            type: "boolean",
            description: "Whether to remove all quantities of this item or just decrement by 1 (defaults to true).",
          },
        },
        required: ["productId", "sessionId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "updateCartQuantity",
      description: "Update the specific quantity of an item in the cart, verifying against live database inventory.",
      parameters: {
        type: "object",
        properties: {
          productId: {
            type: "string",
            description: "The product ID.",
          },
          quantity: {
            type: "number",
            description: "The new quantity (0 to remove, positive integer to set).",
          },
          sessionId: {
            type: "string",
            description: "The customer's active session ID.",
          },
        },
        required: ["productId", "quantity", "sessionId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "calculateTotal",
      description: "Compute deterministic server-calculated cart breakdown including subtotal, discounts, shipping, and total amount.",
      parameters: {
        type: "object",
        properties: {
          sessionId: {
            type: "string",
            description: "The customer's active session ID.",
          },
        },
        required: ["sessionId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getRecommendations",
      description: "Generate rule-based AI upsell and complementary cross-sell recommendations with explainable reasoning tailored to the customer's cart and browsing context.",
      parameters: {
        type: "object",
        properties: {
          sessionId: {
            type: "string",
            description: "The customer's active session ID.",
          },
          category: {
            type: "string",
            description: "Optional primary category to find pairings for.",
          },
          maxPrice: {
            type: "number",
            description: "Optional budget ceiling for upsell items.",
          },
        },
        required: ["sessionId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "createOrder",
      description: "Propose an order from the customer's cart, validate server-side inventory and prices against PostgreSQL guardrails, and generate an order summary proposal awaiting user confirmation.",
      parameters: {
        type: "object",
        properties: {
          sessionId: {
            type: "string",
            description: "The customer's active session ID.",
          },
          customerNote: {
            type: "string",
            description: "Optional delivery or special instructions note from the customer.",
          },
        },
        required: ["sessionId"],
      },
    },
  },
];

// Recommendation Engine Logic
export async function generateUpsellRecommendations(sessionId: string, preferredCategory?: string, budgetCeiling?: number) {
  // 1. Get or create conversation for this session
  let conversation = await prisma.conversation.findUnique({
    where: { sessionId },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: { sessionId },
    });
  }

  // 2. Fetch current active cart
  const cart = await prisma.cart.findUnique({
    where: { sessionId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  const cartProductIds = cart?.items.map((i) => i.productId) || [];
  const cartCategories = cart?.items.map((i) => i.product.category) || [];

  // If cart is empty and no preferred category was explicitly requested, do not force-generate upsells
  if (cartProductIds.length === 0 && !preferredCategory) {
    return [];
  }

  // Determine complementary category logic
  let targetCategory: string | undefined = preferredCategory;
  let defaultReason = "Popular verified developer essential with high ratings.";

  if (!targetCategory && cartCategories.length > 0) {
    if (cartCategories.some((c) => c.toLowerCase().includes("laptop"))) {
      targetCategory = "Keyboards & Mice";
      defaultReason = "Programmers and power users frequently pair high-performance laptops with tactile mechanical keyboards and ergonomic mice for multi-display productivity.";
    } else if (cartCategories.some((c) => c.toLowerCase().includes("keyboard") || c.toLowerCase().includes("mice"))) {
      targetCategory = "Audio";
      defaultReason = "Noise-canceling audio gear pairs perfectly with tactile keyboards to achieve deep focus during extended development workflows.";
    } else if (cartCategories.some((c) => c.toLowerCase().includes("audio"))) {
      targetCategory = "Accessories";
      defaultReason = "Desktop accessories and clean cable organizers keep your workspace pristine while enjoying studio-grade sound.";
    } else {
      targetCategory = "Accessories";
      defaultReason = "Complementary tech accessory designed to boost daily productivity.";
    }
  }

  // Query candidate recommendation products from PostgreSQL
  const whereClause: Record<string, any> = {
    isActive: true,
    stock: { gt: 0 },
    id: { notIn: cartProductIds },
  };

  if (targetCategory) {
    whereClause.category = { contains: targetCategory, mode: "insensitive" };
  }

  if (budgetCeiling && budgetCeiling > 0) {
    whereClause.price = { lte: budgetCeiling };
  }

  let candidates = await prisma.product.findMany({
    where: whereClause,
    take: 3,
    orderBy: [{ stock: "desc" }, { price: "asc" }],
  });

  // If none found in targeted category, fallback to any available in-stock item not in cart
  if (candidates.length === 0) {
    candidates = await prisma.product.findMany({
      where: {
        isActive: true,
        stock: { gt: 0 },
        id: { notIn: cartProductIds },
      },
      take: 2,
      orderBy: { price: "asc" },
    });
    defaultReason = "Top recommended developer gear in stock and ready to ship.";
  }

  const recommendations = [];

  for (const product of candidates) {
    // Check if an active unaccepted recommendation already exists for this conversation
    const existingRec = await prisma.recommendation.findFirst({
      where: {
        conversationId: conversation.id,
        productId: product.id,
        accepted: false,
      },
    });

    if (existingRec) {
      recommendations.push({
        id: existingRec.id,
        productId: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        stock: product.stock,
        imageUrl: product.imageUrl,
        type: "UPSELL" as const,
        reason: existingRec.reason,
        accepted: false,
      });
      continue;
    }

    // Determine tailored reason
    let reason = defaultReason;
    if (product.category.toLowerCase().includes("keyboard")) {
      reason = "Developers frequently pair this mechanical keyboard with developer setups for high-tactility typing precision.";
    } else if (product.category.toLowerCase().includes("mouse")) {
      reason = "Ergonomic precision mouse designed to reduce wrist strain during long coding sessions.";
    } else if (product.category.toLowerCase().includes("audio") || product.category.toLowerCase().includes("headphone")) {
      reason = "Active noise-cancellation audio helps maintain deep focus in open office or remote environments.";
    } else if (product.category.toLowerCase().includes("accessories") || product.category.toLowerCase().includes("dock")) {
      reason = "Multi-port connectivity hub allows single-cable workstation expansion.";
    }

    // Persist recommendation record in DB
    const recRecord = await prisma.recommendation.create({
      data: {
        productId: product.id,
        conversationId: conversation.id,
        cartId: cart?.id || null,
        type: "UPSELL",
        reason,
        accepted: false,
      },
    });

    // Log recommendation creation audit trail
    await prisma.auditLog.create({
      data: {
        actor: "AGENT",
        merchantId: product.merchantId,
        action: "RECOMMENDATION_CREATED",
        entityType: "RECOMMENDATION",
        entityId: recRecord.id,
        payload: JSON.stringify({
          productId: product.id,
          productName: product.name,
          price: product.price,
          reason,
          cartId: cart?.id,
        }),
        status: "SUCCESS",
        reason: `Generated explainable upsell: ${product.name}`,
      },
    });

    recommendations.push({
      id: recRecord.id,
      productId: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      stock: product.stock,
      imageUrl: product.imageUrl,
      type: "UPSELL" as const,
      reason,
      accepted: false,
    });
  }

  return recommendations;
}

// Tool Execution Handlers against Database
export async function executeAgentTool(
  name: string,
  args: Record<string, any>,
  context: { sessionId?: string; merchantId?: string }
): Promise<any> {
  const sessionId = args.sessionId || context.sessionId || "default_guest_session";

  switch (name) {
    case "searchProducts": {
      const { query, category, maxPrice, tag, inStockOnly = true } = args;
      const where: Record<string, any> = { isActive: true };

      if (inStockOnly) {
        where.stock = { gt: 0 };
      }

      if (query && typeof query === "string" && query.trim()) {
        const q = query.trim();
        where.OR = [
          { name: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          { category: { contains: q, mode: "insensitive" } },
        ];
      }

      if (category && typeof category === "string") {
        where.category = { equals: category.trim(), mode: "insensitive" };
      }

      if (tag && typeof tag === "string") {
        where.tags = { has: tag.trim().toLowerCase() };
      }

      if (maxPrice && !isNaN(Number(maxPrice))) {
        where.price = { lte: Number(maxPrice) };
      }

      const products = await prisma.product.findMany({
        where,
        take: 8,
        orderBy: [{ stock: "desc" }, { price: "asc" }],
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          category: true,
          tags: true,
          stock: true,
          imageUrl: true,
        },
      });

      return {
        success: true,
        count: products.length,
        products,
      };
    }

    case "getProductDetails": {
      const { productId, productName } = args;
      let product = null;

      if (productId) {
        product = await prisma.product.findUnique({
          where: { id: productId },
        });
      } else if (productName) {
        product = await prisma.product.findFirst({
          where: {
            name: { contains: productName, mode: "insensitive" },
            isActive: true,
          },
        });
      }

      if (!product) {
        return { success: false, error: "Product not found in current inventory." };
      }

      return {
        success: true,
        product: {
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          category: product.category,
          tags: product.tags,
          stock: product.stock,
          imageUrl: product.imageUrl,
          inStock: product.stock > 0,
        },
      };
    }

    case "checkInventory": {
      const { productIds = [] } = args;
      if (!Array.isArray(productIds) || productIds.length === 0) {
        return { success: false, error: "No productIds provided to check." };
      }

      const items = await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, name: true, stock: true, price: true },
      });

      return {
        success: true,
        inventory: items.map((i) => ({
          productId: i.id,
          name: i.name,
          stock: i.stock,
          isAvailable: i.stock > 0,
          price: i.price,
        })),
      };
    }

    case "getCart": {
      let cart = await prisma.cart.findUnique({
        where: { sessionId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!cart) {
        cart = await prisma.cart.create({
          data: {
            sessionId,
            status: "ACTIVE",
          },
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        });
      }

      const items = cart.items.map((it) => ({
        id: it.id,
        productId: it.productId,
        name: it.product.name,
        price: it.priceAtAdd,
        quantity: it.quantity,
        subtotal: it.priceAtAdd * it.quantity,
        stock: it.product.stock,
        category: it.product.category,
        imageUrl: it.product.imageUrl,
      }));

      const subtotal = items.reduce((acc, it) => acc + it.subtotal, 0);
      const discount = 0;
      const totalAmount = subtotal - discount;

      return {
        success: true,
        cartId: cart.id,
        itemCount: items.reduce((acc, it) => acc + it.quantity, 0),
        items,
        subtotal,
        discount,
        totalAmount,
      };
    }

    case "addToCart": {
      const { productId, quantity = 1 } = args;
      const parsedQty = Math.max(1, Math.round(Number(quantity) || 1));

      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product || !product.isActive) {
        return { success: false, error: "Product not found or inactive." };
      }

      if (product.stock < parsedQty) {
        return {
          success: false,
          error: `Insufficient stock. Only ${product.stock} units of ${product.name} are available.`,
        };
      }

      // Find or create cart
      let cart = await prisma.cart.findUnique({
        where: { sessionId },
      });

      if (!cart) {
        cart = await prisma.cart.create({
          data: {
            sessionId,
            status: "ACTIVE",
          },
        });
      }

      // Upsert cart item
      const existingItem = await prisma.cartItem.findUnique({
        where: {
          cartId_productId: {
            cartId: cart.id,
            productId: product.id,
          },
        },
      });

      let updatedItem;
      if (existingItem) {
        const newQty = existingItem.quantity + parsedQty;
        if (product.stock < newQty) {
          return {
            success: false,
            error: `Cannot add ${parsedQty} more. Stock limit is ${product.stock} (currently ${existingItem.quantity} in cart).`,
          };
        }

        updatedItem = await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: {
            quantity: newQty,
            priceAtAdd: product.price, // refresh verified unit price
          },
        });
      } else {
        updatedItem = await prisma.cartItem.create({
          data: {
            cartId: cart.id,
            productId: product.id,
            quantity: parsedQty,
            priceAtAdd: product.price,
          },
        });
      }

      // Check and mark any pending recommendation as accepted
      await prisma.recommendation.updateMany({
        where: {
          productId: product.id,
          cartId: cart.id,
          accepted: false,
        },
        data: {
          accepted: true,
        },
      });

      // Log Cart Audit
      await prisma.auditLog.create({
        data: {
          actor: "AGENT",
          merchantId: product.merchantId,
          action: "ADD_TO_CART",
          entityType: "CART",
          entityId: cart.id,
          payload: JSON.stringify({
            productId: product.id,
            productName: product.name,
            quantity: parsedQty,
            unitPrice: product.price,
          }),
          status: "SUCCESS",
          reason: `Added ${parsedQty}x ${product.name} to cart via agent recommendation`,
        },
      });

      return {
        success: true,
        message: `Added ${parsedQty}x ${product.name} to cart at ₹${product.price.toLocaleString("en-IN")} each.`,
        cartId: cart.id,
        productId: product.id,
        productName: product.name,
        quantity: parsedQty,
        unitPrice: product.price,
      };
    }

    case "removeFromCart": {
      const { productId, removeAll = true } = args;

      const cart = await prisma.cart.findUnique({
        where: { sessionId },
      });

      if (!cart) {
        return { success: false, error: "Cart not found." };
      }

      const existingItem = await prisma.cartItem.findUnique({
        where: {
          cartId_productId: {
            cartId: cart.id,
            productId,
          },
        },
        include: { product: true },
      });

      if (!existingItem) {
        return { success: false, error: "Item not in cart." };
      }

      if (removeAll || existingItem.quantity <= 1) {
        await prisma.cartItem.delete({
          where: { id: existingItem.id },
        });
      } else {
        await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity - 1 },
        });
      }

      // Audit Log
      await prisma.auditLog.create({
        data: {
          actor: "USER",
          action: "REMOVE_FROM_CART",
          entityType: "CART",
          entityId: cart.id,
          payload: JSON.stringify({
            productId,
            productName: existingItem.product.name,
            removeAll,
          }),
          status: "SUCCESS",
          reason: `Removed ${existingItem.product.name} from cart`,
        },
      });

      return {
        success: true,
        message: `Removed ${existingItem.product.name} from cart.`,
        cartId: cart.id,
      };
    }

    case "updateCartQuantity": {
      const { productId, quantity } = args;
      const targetQty = Math.max(0, Math.round(Number(quantity) || 0));

      const cart = await prisma.cart.findUnique({
        where: { sessionId },
      });

      if (!cart) {
        return { success: false, error: "Cart not found." };
      }

      if (targetQty === 0) {
        await prisma.cartItem.deleteMany({
          where: { cartId: cart.id, productId },
        });
        return { success: true, message: "Item removed from cart." };
      }

      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        return { success: false, error: "Product not found." };
      }

      if (product.stock < targetQty) {
        return {
          success: false,
          error: `Insufficient stock. Only ${product.stock} units available.`,
        };
      }

      await prisma.cartItem.upsert({
        where: {
          cartId_productId: {
            cartId: cart.id,
            productId,
          },
        },
        update: {
          quantity: targetQty,
          priceAtAdd: product.price,
        },
        create: {
          cartId: cart.id,
          productId,
          quantity: targetQty,
          priceAtAdd: product.price,
        },
      });

      return {
        success: true,
        message: `Updated ${product.name} quantity to ${targetQty}.`,
      };
    }

    case "calculateTotal": {
      const cart = await prisma.cart.findUnique({
        where: { sessionId },
        include: {
          items: {
            include: { product: true },
          },
        },
      });

      if (!cart || cart.items.length === 0) {
        return {
          success: true,
          itemCount: 0,
          subtotal: 0,
          discount: 0,
          shipping: 0,
          totalAmount: 0,
          items: [],
        };
      }

      const items = cart.items.map((it) => ({
        id: it.id,
        productId: it.productId,
        name: it.product.name,
        unitPrice: it.priceAtAdd,
        quantity: it.quantity,
        lineTotal: it.priceAtAdd * it.quantity,
      }));

      const subtotal = items.reduce((acc, it) => acc + it.lineTotal, 0);
      const discount = 0;
      const shipping = 0; // Free delivery
      const totalAmount = subtotal - discount + shipping;

      return {
        success: true,
        itemCount: items.reduce((acc, it) => acc + it.quantity, 0),
        subtotal,
        discount,
        shipping,
        totalAmount,
        items,
      };
    }

    case "getRecommendations": {
      const { category, maxPrice } = args;
      const recommendations = await generateUpsellRecommendations(sessionId, category, maxPrice);

      return {
        success: true,
        count: recommendations.length,
        recommendations,
      };
    }

    case "createOrder": {
      const { customerNote } = args;
      const result = await createOrderProposal({ sessionId, customerNote });
      return result;
    }

    default:
      return { success: false, error: `Unknown tool "${name}".` };
  }
}

