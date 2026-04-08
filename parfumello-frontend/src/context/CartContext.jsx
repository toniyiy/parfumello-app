import { createContext, useContext, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cart")) || [];
    } catch {
      return [];
    }
  });

  function save(updated) {
    setItems(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  }

  function addToCart(perfume) {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === perfume.id);
      const updated = existing
        ? prev.map((i) =>
            i.id === perfume.id ? { ...i, quantity: i.quantity + 1 } : i
          )
        : [...prev, { id: perfume.id, name: perfume.name, price: perfume.price, image_url: perfume.image_url, quantity: 1 }];
      localStorage.setItem("cart", JSON.stringify(updated));
      return updated;
    });
  }

  function removeFromCart(id) {
    const updated = items.filter((i) => i.id !== id);
    save(updated);
  }

  function updateQuantity(id, quantity) {
    if (quantity < 1) { removeFromCart(id); return; }
    const updated = items.map((i) => i.id === id ? { ...i, quantity } : i);
    save(updated);
  }

  function clearCart() {
    save([]);
  }

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
