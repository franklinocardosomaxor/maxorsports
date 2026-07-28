import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type CartItem = {
  id: string; // productId::size
  productId: string;
  name: string;
  brand: string;
  img: string;
  color: string;
  size: number;
  price: number;
  qty: number;
};

type CartCtx = {
  items: CartItem[];
  count: number;
  subtotal: number;
  add: (item: Omit<CartItem, "id" | "qty">, qty?: number) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
};

const Ctx = createContext<CartCtx | null>(null);
const STORAGE_KEY = "maxor.cart.v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [flash, setFlash] = useState<{ name: string; img: string } | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items]);

  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(null), 900);
    return () => clearTimeout(t);
  }, [flash]);

  const value = useMemo<CartCtx>(() => {
    const count = items.reduce((s, i) => s + i.qty, 0);
    const subtotal = items.reduce((s, i) => s + i.qty * i.price, 0);
    return {
      items,
      count,
      subtotal,
      add: (item, qty = 1) => {
        const id = `${item.productId}::${item.size}::${item.color}`;
        setItems((prev) => {
          const found = prev.find((p) => p.id === id);
          if (found) return prev.map((p) => (p.id === id ? { ...p, qty: p.qty + qty } : p));
          return [...prev, { ...item, id, qty }];
        });
        setFlash({ name: item.name, img: item.img });
      },
      remove: (id) => setItems((prev) => prev.filter((p) => p.id !== id)),
      setQty: (id, qty) =>
        setItems((prev) =>
          qty <= 0 ? prev.filter((p) => p.id !== id) : prev.map((p) => (p.id === id ? { ...p, qty } : p)),
        ),
      clear: () => setItems([]),
    };
  }, [items]);

  return (
    <Ctx.Provider value={value}>
      {children}
      {flash && (
        <div
          aria-live="polite"
          className="pointer-events-none fixed inset-0 z-[120] grid place-items-center bg-black/70 backdrop-blur-[2px] animate-in fade-in duration-150"
        >
          <div className="flex items-center gap-3 rounded-2xl border border-[color:var(--cyan-brand)]/40 bg-navy/95 px-5 py-4 shadow-2xl">
            <img src={flash.img} alt="" className="h-14 w-14 rounded-lg bg-white/5 object-contain p-1" />
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest text-[color:var(--lime-brand)]">
                Adicionado à sacola
              </p>
              <p className="max-w-[16rem] truncate text-sm font-semibold text-offwhite">{flash.name}</p>
            </div>
          </div>
        </div>
      )}
    </Ctx.Provider>
  );
}


export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart deve ser usado dentro de <CartProvider>");
  return ctx;
}
