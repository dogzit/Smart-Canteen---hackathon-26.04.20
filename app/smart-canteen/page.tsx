"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    Search, ShoppingCart, Plus, Minus, Loader2, X,
    CheckCircle2, UtensilsCrossed, Smartphone, CreditCard
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast, Toaster } from "sonner";

// --- Types ---
interface MenuItem {
    id: number;
    name: string;
    price: number;
    category: string;
    description: string | null;
    image: string;
}

interface CartItem extends MenuItem {
    quantity: number;
}

// --- Mock QPay Component ---
function MockQPayModal({ amount, onSuccess, onClose }: { amount: number; onSuccess: () => void; onClose: () => void }) {
    const [step, setStep] = useState<"qr" | "loading" | "success">("qr");

    const handleMockPay = () => {
        setStep("loading");
        setTimeout(() => {
            setStep("success");
            setTimeout(onSuccess, 1500);
        }, 2000);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full max-w-sm bg-[#111] rounded-[3rem] p-10 border border-white/10 text-center shadow-2xl">
                <button onClick={onClose} className="absolute top-8 right-8 text-gray-500 hover:text-white"><X /></button>
                {step === "qr" && (
                    <>
                        <h2 className="text-xl font-bold text-white mb-2">QPay-ээр төлөх</h2>
                        <p className="text-[#d4a365] font-mono text-lg mb-8 font-bold">₮{amount.toLocaleString()}</p>
                        <div onClick={handleMockPay} className="relative cursor-pointer group mx-auto w-48 h-48 bg-white p-3 rounded-3xl mb-8 overflow-hidden transition-transform hover:scale-105">
                            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=pay-canteen-${amount}`} alt="QR" className="w-full h-full" />
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <p className="text-white text-[10px] font-black uppercase">Уншуулах (Mock)</p>
                            </div>
                        </div>
                        <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest leading-relaxed">Банкны апп-аар уншуулна уу</p>
                    </>
                )}
                {step === "loading" && (
                    <div className="py-20 text-center">
                        <Loader2 className="w-12 h-12 text-[#d4a365] animate-spin mx-auto mb-6" />
                        <p className="text-white font-bold tracking-tight">Төлбөрийг шалгаж байна...</p>
                    </div>
                )}
                {step === "success" && (
                    <div className="py-20 text-[#d4a365]">
                        <CheckCircle2 className="w-16 h-16 mx-auto mb-6 animate-bounce" />
                        <p className="text-white font-bold text-xl">Амжилттай төлөгдлөө!</p>
                    </div>
                )}
            </motion.div>
        </div>
    );
}

// --- Main Component ---
export default function MenuListPage() {
    const [menus, setMenus] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("All");
    const [search, setSearch] = useState("");
    const [user, setUser] = useState<{ email: string; name: string } | null>(null);
    const [quantities, setQuantities] = useState<Record<number, number>>({});
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isOrdering, setIsOrdering] = useState(false);
    const [isPaying, setIsPaying] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem("canteen_user");
        if (storedUser) setUser(JSON.parse(storedUser));
    }, []);

    const fetchMenus = async (cat: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/menu?category=${cat}`);
            const data = await res.json();
            setMenus(data);
        } catch (error) {
            toast.error("Дата татахад алдаа гарлаа");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchMenus(activeTab); }, [activeTab]);

    const updateItemQty = (id: number, delta: number) => {
        setQuantities(prev => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) + delta) }));
    };

    const handleAddToCart = (item: MenuItem) => {
        const qty = quantities[item.id] || 0;
        if (qty <= 0) return toast.error("Тоо хэмжээгээ сонгоно уу");

        setCart(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + qty } : i);
            return [...prev, { ...item, quantity: qty }];
        });
        setQuantities(prev => ({ ...prev, [item.id]: 0 }));
        toast.success(`${item.name} сагсанд нэмэгдлээ`);
    };

    const onPaymentSuccess = async () => {
        setIsPaying(false);
        setIsOrdering(true);
        try {
            const promises = cart.map(item =>
                fetch("/api/order", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        studentName: user?.name || "Zolo Student",
                        itemName: item.name,
                        quantity: item.quantity
                    }),
                })
            );
            await Promise.all(promises);
            toast.success("Захиалга баталгаажлаа!");
            setCart([]);
            setIsCartOpen(false);
        } catch (error) {
            toast.error("Захиалга бүртгэхэд алдаа гарлаа");
        } finally {
            setIsOrdering(false);
        }
    };

    const filteredMenus = menus.filter(m => m.name.toLowerCase().includes(search.toLowerCase()));
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
        <div className="min-h-screen bg-[#0a0a0a] p-8 text-gray-200 font-sans">
            <Toaster position="top-right" richColors theme="dark" />

            {/* Mock QPay Overlay */}
            {isPaying && <MockQPayModal amount={totalPrice} onClose={() => setIsPaying(false)} onSuccess={onPaymentSuccess} />}

            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <header className="flex justify-between items-center mb-12">
                    <div className="flex flex-col">
                        <h1 className="text-3xl font-serif font-bold text-white tracking-tight italic">Smart Canteen</h1>
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-[#d4a365] rounded-full animate-pulse" />
                            <p className="text-[9px] uppercase tracking-[0.3em] text-gray-500 font-black">Ulaanbaatar, Mongolia</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link href="/orders">
                            <button className="bg-[#111] p-4 rounded-2xl border border-white/5 hover:border-[#d4a365]/30 transition-all text-gray-400 hover:text-[#d4a365] flex items-center gap-2 group">
                                <CheckCircle2 className="w-5 h-5" />
                                <span className="text-[9px] font-black uppercase tracking-widest hidden md:inline ml-1">Захиалга</span>
                            </button>
                        </Link>

                        <button onClick={() => setIsCartOpen(true)} className="relative bg-[#111] p-4 rounded-2xl border border-white/5 hover:border-[#d4a365]/50 transition-all">
                            <ShoppingCart className="text-gray-400 group-hover:text-[#d4a365]" />
                            {cart.length > 0 && <span className="absolute -top-2 -right-2 bg-[#d4a365] text-black text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full border-4 border-[#0a0a0a]">{cart.length}</span>}
                        </button>

                        <div className="relative group/profile">
                            <button className="bg-[#111] p-1.5 rounded-2xl border border-white/5 hover:border-[#d4a365]/30 transition-all">
                                <div className="w-10 h-10 bg-gradient-to-br from-[#d4a365] to-[#f0c080] rounded-xl flex items-center justify-center text-black font-black text-xs shadow-lg uppercase">
                                    {user?.name ? user.name.substring(0, 2) : "U"}
                                </div>
                            </button>
                            <div className="absolute right-0 top-full mt-2 w-56 bg-[#0f0f0f] border border-white/10 rounded-[2rem] p-3 opacity-0 invisible group-hover/profile:opacity-100 group-hover/profile:visible transition-all duration-300 z-50 shadow-2xl">
                                <div className="px-4 py-4 border-b border-white/5 mb-2">
                                    <p className="text-[9px] text-[#d4a365] font-black uppercase tracking-widest mb-1">Оюутны бүртгэл</p>
                                    <p className="text-sm font-bold text-white truncate">{user?.name || "Зочин"}</p>
                                    <p className="text-[10px] text-gray-500 truncate mt-0.5">{user?.email || "Мэдээлэл байхгүй"}</p>
                                </div>
                                <button onClick={() => { localStorage.removeItem("canteen_user"); window.location.href = "/login"; }} className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10 rounded-xl transition-colors flex items-center gap-3">
                                    <X className="w-4 h-4" /> Гарах
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Categories */}
                <div className="flex gap-3 overflow-x-auto no-scrollbar mb-12 py-2">
                    {CATEGORIES.map(cat => (
                        <button key={cat} onClick={() => setActiveTab(cat)} className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border whitespace-nowrap ${activeTab === cat ? 'bg-[#d4a365] text-black border-[#d4a365]' : 'bg-[#111] border-white/5 text-gray-500'}`}>
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Menu Grid / Empty State */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                        <Loader2 className="animate-spin mb-4 text-[#d4a365]" />
                        <p className="text-xs uppercase tracking-widest font-bold">Зоогийн цэсийг ачаалж байна...</p>
                    </div>
                ) : filteredMenus.length === 0 ? (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-32 bg-[#111]/30 rounded-[3rem] border border-dashed border-white/5">
                        <div className="bg-[#181818] p-8 rounded-full mb-6">
                            <UtensilsCrossed className="w-12 h-12 text-gray-700" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Зоог олдсонгүй</h3>
                        <p className="text-gray-500 text-sm max-w-xs text-center">Уучлаарай, энэ ангилалд одоогоор бэлэн байгаа хоол алга байна.</p>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredMenus.map(item => (
                            <div key={item.id} className="bg-[#111] rounded-[2.5rem] border border-white/5 flex flex-col hover:border-[#d4a365]/20 transition-all p-7 group shadow-xl">
                                <div className="h-48 rounded-2xl overflow-hidden mb-6 relative">
                                    <img src={item.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={item.name} />
                                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[9px] font-black uppercase text-[#d4a365]">
                                        {item.category}
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold mb-1 text-white">{item.name}</h3>
                                <p className="text-gray-500 text-xs mb-6 italic line-clamp-2">{item.description}</p>
                                <div className="mt-auto">
                                    <div className="flex justify-between items-center mb-6">
                                        <span className="text-[#d4a365] font-bold text-xl font-mono tracking-tighter">₮{item.price.toLocaleString()}</span>
                                        <div className="flex items-center gap-4 bg-white/5 p-2 px-3 rounded-xl border border-white/5 shadow-inner">
                                            <button onClick={() => updateItemQty(item.id, -1)} className="hover:text-white transition-colors text-gray-500"><Minus className="w-4" /></button>
                                            <span className="font-bold w-4 text-center">{quantities[item.id] || 0}</span>
                                            <button onClick={() => updateItemQty(item.id, 1)} className="hover:text-white transition-colors text-gray-500"><Plus className="w-4" /></button>
                                        </div>
                                    </div>
                                    <button onClick={() => handleAddToCart(item)} className="w-full bg-[#d4a365] text-black font-black py-4 rounded-2xl uppercase text-[10px] tracking-widest hover:bg-[#f0c080] transition-all shadow-[0_10px_20px_-10px_rgba(212,163,101,0.5)] active:scale-95">Сагсанд нэмэх</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Cart Sidebar */}
            <AnimatePresence>
                {isCartOpen && (
                    <div className="fixed inset-0 z-50 flex justify-end">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
                        <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="relative w-full max-w-md bg-[#0f0f0f] h-full p-8 flex flex-col shadow-2xl border-l border-white/5">
                            <div className="flex justify-between items-center mb-10">
                                <h2 className="text-2xl font-serif font-bold text-white flex items-center gap-3">Сагс <span className="bg-[#d4a365] text-black text-[10px] px-2 py-0.5 rounded-full">{cart.length}</span></h2>
                                <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-white/5 rounded-full text-gray-500 transition-colors"><X /></button>
                            </div>
                            <div className="flex-grow overflow-y-auto space-y-4 no-scrollbar">
                                {cart.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-600 italic text-sm">Сагс хоосон байна</div>
                                ) : cart.map(item => (
                                    <div key={item.id} className="flex gap-4 items-center bg-[#151515] p-4 rounded-3xl border border-white/5 group">
                                        <img src={item.image} className="w-16 h-16 rounded-2xl object-cover shadow-lg" />
                                        <div className="flex-grow">
                                            <h4 className="font-bold text-sm text-white">{item.name}</h4>
                                            <p className="text-[#d4a365] text-xs font-mono font-bold">₮{item.price.toLocaleString()} <span className="text-gray-600 ml-1">x {item.quantity}</span></p>
                                        </div>
                                        <button onClick={() => setCart(prev => prev.filter(i => i.id !== item.id))} className="p-2 text-gray-700 hover:text-red-500 transition-colors">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-8 pt-8 border-t border-white/5 space-y-6">
                                <div className="flex justify-between items-end">
                                    <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Нийт дүн</span>
                                    <span className="text-3xl font-bold text-[#d4a365] font-mono tracking-tighter">₮{totalPrice.toLocaleString()}</span>
                                </div>
                                <button onClick={() => setIsPaying(true)} disabled={isOrdering || cart.length === 0} className="w-full bg-[#d4a365] text-black font-black py-5 rounded-[2rem] hover:bg-[#f0c080] transition-all flex items-center justify-center gap-3 shadow-2xl active:scale-95 disabled:opacity-30">
                                    {isOrdering ? <Loader2 className="animate-spin w-5 h-5" /> : <><Smartphone className="w-5 h-5" /> Захиалах</>}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

const CATEGORIES = ["All", "Main Course", "Noodles", "Appetizer", "Dessert", "Drinks"];