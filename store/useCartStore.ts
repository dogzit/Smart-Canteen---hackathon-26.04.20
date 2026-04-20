import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// Сагсанд байх барааны төрөл
interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string; // Зураг нэмж болно
}

// Store-ийн бүтэц
interface CartStore {
  items: CartItem[];
  addItem: (newItem: CartItem) => void;
  clearCart: () => void;
  removeItem: (id: number) => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],

      // Шинэ бараа нэмэх (Implicit any алдааг newItem: CartItem гэж зассан)
      addItem: (newItem: CartItem) => {
        set((state) => {
          // Хэрэв сагсанд аль хэдийн байгаа бол тоог нь нэмэх логик (сонголттой)
          const existingItem = state.items.find(
            (item) => item.id === newItem.id,
          );
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.id === newItem.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item,
              ),
            };
          }
          return { items: [...state.items, newItem] };
        });
      },

      // Сагс хоослох
      clearCart: () => set({ items: [] }),

      // Бараа устгах
      removeItem: (id: number) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),
    }),
    {
      name: "shopping-cart", // localStorage дахь нэр
      storage: createJSONStorage(() => localStorage), // Хаана хадгалахыг зааж өгнө
    },
  ),
);
