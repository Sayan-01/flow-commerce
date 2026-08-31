"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {
  Bot,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  Store,
  Terminal,
  Loader2,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import { CartDrawer } from "./cart-drawer";
import { CheckoutModal, ProposedOrderData } from "./checkout-modal";
import { ChatMessageItem, CartState } from "./types";

interface ChatContainerProps {
  initialCart?: CartState | null;
}

const INITIAL_GREETING: ChatMessageItem = {
  id: "msg_welcome",
  role: "assistant",
  content: `👋 Welcome to FlowCommerce AI Sales Copilot!\n\nI can help you explore our verified catalog, check live inventory counts, and propose reasoned upsells tailored to your setup.\n\nWhat kind of developer gear, mechanical keyboards, monitors, audio, or workspace accessories are you looking for today?`,
  createdAt: new Date().toISOString(),
};

export function ChatContainer({ initialCart = null }: ChatContainerProps) {
  const searchParams = useSearchParams();
  const initialPrompt = searchParams.get("prompt");

  const [sessionId, setSessionId] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessageItem[]>([INITIAL_GREETING]);
  const [cart, setCart] = useState<CartState | null>(initialCart);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [proposedOrder, setProposedOrder] = useState<ProposedOrderData | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [isProposingOrder, setIsProposingOrder] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasProcessedInitialPrompt, setHasProcessedInitialPrompt] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const showToast = (text: string) => {
    setToastMessage(text);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Initialize Session ID and fetch initial cart state
  useEffect(() => {
    let sid = localStorage.getItem("flow_session_id");
    if (!sid) {
      sid = `session_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      localStorage.setItem("flow_session_id", sid);
    }
    setSessionId(sid);
    fetchCart(sid);
  }, []);

  const fetchCart = async (sid: string) => {
    try {
      const res = await fetch(`/api/cart?sessionId=${sid}`);
      const data = await res.json();
      if (data.success && data.cart) {
        setCart(data.cart);
      }
    } catch (e) {
      console.error("Failed to load initial cart:", e);
    }
  };

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Handle URL parameter prompt (e.g. ?prompt=...)
  useEffect(() => {
    if (initialPrompt && sessionId && !hasProcessedInitialPrompt) {
      setHasProcessedInitialPrompt(true);
      sendMessage(initialPrompt);
    }
  }, [initialPrompt, sessionId, hasProcessedInitialPrompt]);

  // Send Message Handler
  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: ChatMessageItem = {
      id: `usr_${Date.now()}`,
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newHistory.map((m) => ({ role: m.role, content: m.content })),
          sessionId,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to process chat message");
      }

      const assistantMessage: ChatMessageItem = {
        id: `asst_${Date.now()}`,
        role: "assistant",
        content: data.reply,
        toolExecutions: data.toolExecutions || [],
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (data.cart) {
        setCart(data.cart);
      }
    } catch (err: any) {
      const errorMessage: ChatMessageItem = {
        id: `err_${Date.now()}`,
        role: "assistant",
        content: `⚠️ Error: ${err.message || "An unexpected error occurred."}`,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Direct Add To Cart action trigger
  const handleAddToCart = async (productId: string) => {
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add",
          productId,
          quantity: 1,
          sessionId,
        }),
      });
      const data = await res.json();
      if (data.success && data.cart) {
        setCart(data.cart);
        showToast(data.message || "Item added to cart!");
      } else {
        showToast(data.error || "Could not add item to cart.");
      }
    } catch (e: any) {
      showToast(e.message || "Failed to update cart.");
    }
  };

  // Direct Update Quantity in Cart
  const handleUpdateQuantity = async (productId: string, quantity: number) => {
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          productId,
          quantity,
          sessionId,
        }),
      });
      const data = await res.json();
      if (data.success && data.cart) {
        setCart(data.cart);
        showToast(data.message || "Cart updated.");
      } else {
        showToast(data.error || "Failed to update quantity.");
      }
    } catch (e: any) {
      showToast(e.message || "Failed to update quantity.");
    }
  };

  // Direct Remove Item from Cart
  const handleRemoveItem = async (productId: string) => {
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "remove",
          productId,
          sessionId,
          removeAll: true,
        }),
      });
      const data = await res.json();
      if (data.success && data.cart) {
        setCart(data.cart);
        showToast(data.message || "Item removed from cart.");
      } else {
        showToast(data.error || "Failed to remove item.");
      }
    } catch (e: any) {
      showToast(e.message || "Failed to remove item.");
    }
  };

  // Initiate Checkout Proposal (Opens Confirmation Gate Modal)
  const handleInitiateCheckout = async () => {
    if (isProposingOrder) return;
    setIsProposingOrder(true);
    setIsCartOpen(false);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          cartId: cart?.id,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to create order proposal.");
      }

      setProposedOrder(data.order);
      setIsCheckoutOpen(true);
    } catch (err: any) {
      showToast(err.message || "Failed to prepare order.");
      const errorMsg: ChatMessageItem = {
        id: `err_${Date.now()}`,
        role: "assistant",
        content: `⚠️ Order proposal error: ${err.message || "Could not prepare checkout."}`,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsProposingOrder(false);
    }
  };

  // Payment Callback Handler
  const handlePaymentSuccess = async (paymentDetails: any) => {
    showToast("🎉 Payment authorized successfully!");

    const confirmationMsg: ChatMessageItem = {
      id: `confirm_${Date.now()}`,
      role: "assistant",
      content: `✅ **Payment Verified & Authorized!**\n\n* **Order ID**: \`#${paymentDetails.orderId?.slice(-8) || proposedOrder?.id?.slice(-8) || "SUCCESS"}\`\n* **Payment Reference**: \`${paymentDetails.razorpay_payment_id || "TEST_CAPTURED"}\`\n* **Status**: \`Awaiting Fulfillment (PAID)\`\n\nYour order has been recorded with full audit trail in our database. Thank you for shopping with **FlowCommerce**!`,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, confirmationMsg]);
    fetchCart(sessionId);
  };

  // Ask Details action trigger from Product Card
  const handleAskDetails = (productName: string) => {
    sendMessage(`Tell me full specifications, real-time inventory count, and matching accessories for "${productName}".`);
  };

  // Reset conversation
  const handleReset = () => {
    const newSid = `session_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    localStorage.setItem("flow_session_id", newSid);
    setSessionId(newSid);
    setMessages([INITIAL_GREETING]);
    fetchCart(newSid);
  };

  const cartItemCount = cart?.itemCount || 0;

  return (
    <div className="relative flex flex-col h-[calc(100vh-78.5px)] max-w-[1112px] mx-auto p-6 border-x">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 right-6 z-50 rounded-xl bg-emerald-950/90 border border-emerald-500/40 text-emerald-200 px-4 py-2.5 text-xs font-semibold shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-3">
          <div className="flex items-center gap-2">
            <Check className="h-3.5 w-3.5 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Top Controls Bar */}
      <div className="flex items-center justify-between  border-zinc-800/80 mb-6 shrink-0">
        <div className="flex items-center gap-3">
          
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-sm text-white">FlowCommerce Copilot</h2>
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-mono text-zinc-400">stealth/ox-alpha</span>
            </div>
            <p className="text-[11px] text-zinc-500">Bounded Execution • Server-Gated Payments • Live Inventory</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Reset Conversation */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="h-8 px-2.5 text-xs border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 cursor-pointer"
            title="Reset conversation"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1" />
            <span className="hidden sm:inline">Reset</span>
          </Button>

          {/* Cart Drawer Trigger */}
          <Button
            onClick={() => setIsCartOpen(true)}
            className="relative h-8 px-3 text-xs bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-600 hover:text-white transition-all font-semibold cursor-pointer"
          >
            <ShoppingBag className="h-3.5 w-3.5 mr-1.5" />
            <span>Cart</span>
            {cartItemCount > 0 && <span className="ml-1.5 rounded-full bg-indigo-500 px-1.5 py-0.2 text-[10px] font-bold text-white">{cartItemCount}</span>}
          </Button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto  box_1 space-y-4 pr-2 pb-4 scroll-smooth">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            onAddToCart={handleAddToCart}
            onAskDetails={handleAskDetails}
          />
        ))}

        {/* Typing / Reasoning Indicator */}
        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
              <Bot className="h-4 w-4" />
            </div>
            <div className="inline-flex items-center gap-2 rounded-2xl rounded-tl-sm border border-zinc-800 bg-zinc-900/70 px-4 py-2.5 text-xs text-zinc-400">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-400" />
              <span>Querying PostgreSQL inventory & reasoning recommendation...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Fixed Bottom Area */}
      <div className="pt-2 shrink-0">
        <ChatInput
          onSendMessage={sendMessage}
          isLoading={isLoading}
        />
      </div>

      {/* Cart Slide-Over Drawer */}
      <CartDrawer
        cart={cart}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onAddToCart={handleAddToCart}
        onCheckoutPrompt={handleInitiateCheckout}
      />

      {/* Checkout Summary & Confirmation Gate Modal */}
      <CheckoutModal
        order={proposedOrder}
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
}

