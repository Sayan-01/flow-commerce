import React from "react";
import { formatPrice } from "@/lib/utils";

export interface ReceiptItem {
  name: string;
  note?: string;
  price: number;
}

interface ReceiptProps {
  brand: string;
  subtitle: string;
  items: ReceiptItem[];
  subtotal: number;
  stamp?: React.ReactNode;
  rotate?: string;
}

export default function Receipt({
  brand,
  subtitle,
  items,
  subtotal,
  stamp,
  rotate = "rotate-1",
}: ReceiptProps) {
  return (
    <div className="flex justify-center scale-110">
      <div className={`receipt ${rotate}`}>
        <div className="mb-4 text-center">
          <div className="font-mono text-xs uppercase tracking-[0.16em]">{brand}</div>
          <div className="mt-1 font-mono text-[10px] text-receipt-soft">{subtitle}</div>
        </div>

        <div className="receipt-divider" />

        {items.map((item, i) => (
          <div key={i} className="mb-2.5 flex justify-between gap-2.5 font-mono text-xs">
            <span>
              {item.name}
              {item.note && (
                <span className="mt-0.5 block font-sans text-[10px] text-receipt-soft">
                  {item.note}
                </span>
              )}
            </span>
            <span className="whitespace-nowrap">{formatPrice(item.price)}</span>
          </div>
        ))}

        <div className="receipt-divider" />

        <div className="flex justify-between font-mono text-[13px] font-medium">
          <span>Order subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>

        {stamp && (
          <div className="mx-auto mt-4.5 flex h-26 w-26 -rotate-[8deg] items-center justify-center rounded-full border-[1.6px] border-emerald text-center font-mono text-[10.5px] uppercase leading-snug tracking-[0.08em] text-emerald opacity-90">
            {stamp}
          </div>
        )}

        <div className="receipt-barcode" />
      </div>
    </div>
  );
}
