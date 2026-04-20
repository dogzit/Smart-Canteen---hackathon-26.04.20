"use client";

import { useEffect, useState } from "react";
import { Search, Plus, Minus, ShoppingCart } from "lucide-react";

interface MenuItem {
    id: number;
    name: string;
    price: number;
    description: string | null;
    image: string | null;
}

interface QuantityState {
    [key: number]: number;
}

export default function MenuListPage() {
    const [menus, setMenus] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [quantities, setQuantities] = useState<QuantityState>({});

    useEffect(() => {
        const fetchMenus = async (): Promise<void> => {
            try {
                // Skeleton харахын тулд зориудаар 1сек хүлээлгэж болно:
                // await new Promise(resolve => setTimeout(resolve, 1000));

                const res = await fetch("/api/menu");
                if (!res.ok) throw new Error("Сүлжээний алдаа");

                const data: MenuItem[] = await res.json();
                setMenus(data);

                const initialQty: QuantityState = {};
                data.forEach((item) => { initialQty[item.id] = 0; });
                setQuantities(initialQty);
            } catch (error) {
                console.error("Алдаа:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMenus();
    }, []);

    const updateQty = (id: number, delta: number): void => {
        setQuantities((prev: QuantityState) => ({
            ...prev,
            [id]: Math.max(0, (prev[id] || 0) + delta)
        }));
    };

    // --- Skeleton Component ---
    const MenuSkeleton = () => (
        <div className="bg-[#121212] rounded-[2rem] overflow-hidden border border-white/5 flex flex-col animate-pulse">
            <div className="h-60 w-full bg-white/5" />
            <div className="p-7 flex flex-col flex-grow">
                <div className="h-7 w-3/4 bg-white/10 rounded-lg mb-4" />
                <div className="space-y-2 mb-8">
                    <div className="h-3 w-full bg-white/5 rounded" />
                    <div className="h-3 w-5/6 bg-white/5 rounded" />
                </div>
                <div className="mt-auto">
                    <div className="h-6 w-24 bg-[#d4a365]/20 rounded-lg mb-6" />
                    <div className="flex gap-3">
                        <div className="w-24 h-12 bg-white/5 rounded-2xl" />
                        <div className="flex-grow h-12 bg-white/5 rounded-2xl" />
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0a0a0a] p-4 md:p-8 font-sans text-gray-200">
            <div className="max-w-6xl mx-auto mb-10">
                <div className="flex flex-col gap-6">
                    <div className="flex justify-between items-end">
                        <div className={loading ? "animate-pulse" : ""}>
                            <h1 className="text-3xl font-bold text-white font-serif tracking-tight">Smart Canteen</h1>
                            <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest opacity-60">Selection of the day</p>
                        </div>
                        <div className="bg-[#1a1a1a] p-2.5 rounded-xl border border-white/5 cursor-pointer hover:bg-[#222] transition-colors relative">
                            <ShoppingCart className="text-[#d4a365] w-5 h-5" />
                        </div>
                    </div>

                    {/* Search Bar Skeleton-ish state */}
                    <div className={`relative max-w-2xl ${loading ? "opacity-50 pointer-events-none" : ""}`}>
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Дуртай хоолоо хайх..."
                            className="w-full bg-[#111] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-[#d4a365]/30 transition-all text-sm"
                        />
                    </div>

                    {/* Category Tabs */}
                    <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                        {["All", "Main Course", "Noodles", "Drinks"].map((cat, i) => (
                            <button
                                key={cat}
                                className={`px-7 py-2.5 rounded-full text-[10px] font-black tracking-widest uppercase transition-all whitespace-nowrap border ${i === 0 ? 'bg-[#d4a365] text-black border-[#d4a365]' : 'bg-[#121212] border-white/5 text-gray-500 hover:border-[#d4a365]/30'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Grid Area */}
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading ? (
                    // LOADING ҮЕД ХАРАГДАХ SKELETON-УУД
                    Array.from({ length: 6 }).map((_, i) => <MenuSkeleton key={i} />)
                ) : (
                    // ДАТА ИРСНИЙ ДАРАА ХАРАГДАХ КАРТУУД
                    menus.map((item: MenuItem) => (
                        <div key={item.id} className="group bg-[#121212] rounded-[2rem] overflow-hidden border border-white/5 flex flex-col hover:border-[#d4a365]/20 transition-all duration-500 shadow-2xl">
                            <div className="relative h-60 w-full overflow-hidden bg-[#1a1a1a]">
                                {item.image ? (
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-800 text-xs italic">Image not available</div>
                                )}
                                <div className="absolute top-5 right-5 bg-orange-600 text-white text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest">
                                    Chefs Pick
                                </div>
                            </div>

                            <div className="p-7 flex flex-col flex-grow">
                                <div className="mb-5">
                                    <h3 className="font-bold text-xl text-white font-serif tracking-tight group-hover:text-[#d4a365] transition-colors">{item.name}</h3>
                                    <p className="text-gray-500 text-xs mt-3 line-clamp-2 leading-relaxed font-light italic">
                                        {item.description || "Fresh ingredients prepared with traditional techniques for a modern canteen experience."}
                                    </p>
                                </div>

                                <div className="mt-auto">
                                    <div className="text-[#d4a365] font-bold text-xl mb-6">
                                        <span className="text-sm font-medium mr-1 opacity-60">₮</span>
                                        {item.price.toLocaleString()}
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center bg-[#181818] rounded-2xl h-12 px-4 gap-6 border border-white/5">
                                            <button onClick={() => updateQty(item.id, -1)} className="text-gray-500 hover:text-white transition-colors"><Minus className="w-3.5 h-3.5" /></button>
                                            <span className="w-3 text-center font-bold text-white text-sm">{quantities[item.id] || 0}</span>
                                            <button onClick={() => updateQty(item.id, 1)} className="text-gray-500 hover:text-white transition-colors"><Plus className="w-3.5 h-3.5" /></button>
                                        </div>
                                        <button className="flex-grow bg-[#d4a365] hover:bg-[#f0c080] text-black font-black py-3.5 rounded-2xl transition-all active:scale-95 text-[10px] uppercase tracking-[0.15em] h-12 shadow-lg shadow-[#d4a365]/5">
                                            Add to Cart
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}