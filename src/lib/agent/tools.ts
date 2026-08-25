import { prisma } from "@/lib/prisma";

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
];

// Tool Execution Handlers against Database
export async function executeAgentTool(name: string, args: Record<string, any>, context: { sessionId?: string; merchantId?: string }) {
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
      }));

      const totalAmount = items.reduce((acc, it) => acc + it.subtotal, 0);

      return {
        success: true,
        cartId: cart.id,
        itemCount: items.reduce((acc, it) => acc + it.quantity, 0),
        items,
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

      // Log Cart Audit
      await prisma.auditLog.create({
        data: {
          actor: "AGENT",
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
      };
    }

    default:
      return { success: false, error: `Unknown tool "${name}".` };
  }
}
