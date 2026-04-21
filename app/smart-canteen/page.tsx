"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    Search, ShoppingCart, Plus, Minus, Loader2, X,
    CheckCircle2, Smartphone, LogOut
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast, Toaster } from "sonner";
import { useCartStore } from "@/store/useCartStore";

// --- Ангиллын тогтмол дараалал (Таны хүссэнээр) ---
const CATEGORY_ORDER = ["Main Course", "Noodles", "Appetizer", "Dessert", "Drinks"];

// --- Mock QPay Modal Component ---
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
                        <h2 className="text-xl font-bold text-white mb-2 font-serif">QPay-ээр төлөх</h2>
                        <p className="text-[#d4a365] font-mono text-lg mb-8 font-bold italic">₮{amount.toLocaleString()}</p>
                        <div onClick={handleMockPay} className="relative cursor-pointer group mx-auto w-44 h-44 bg-white p-3 rounded-3xl mb-8 overflow-hidden transition-transform hover:scale-105 shadow-[0_0_30px_rgba(212,163,101,0.2)]">
                            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=pay-canteen-${amount}`} alt="QR" className="w-full h-full" />
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <p className="text-white text-[10px] font-black uppercase">Төлөвлөх (Mock)</p>
                            </div>
                        </div>
                        <p className="text-gray-500 text-[10px] uppercase font-black tracking-[0.2em] leading-relaxed">Банкны апп-аар уншуулна уу</p>
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

export default function MenuListPage() {
    const [menus, setMenus] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("All");
    const [search, setSearch] = useState("");
    const [user, setUser] = useState<{ email: string; name: string } | null>(null);
    const [quantities, setQuantities] = useState<Record<number, number>>({});
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const cartItems = useCartStore((state) => state.items);
    const addItem = useCartStore((state) => state.addItem);
    const clearCart = useCartStore((state) => state.clearCart);
    const removeItem = useCartStore((state) => state.removeItem);

    const [mounted, setMounted] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isPaying, setIsPaying] = useState(false);
    const [isOrdering, setIsOrdering] = useState(false);

    useEffect(() => {
        setMounted(true);
        const storedUser = localStorage.getItem("canteen_user");
        if (storedUser) setUser(JSON.parse(storedUser));
        fetchMenus();
    }, []);

    const fetchMenus = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/menu`);
            const data = await res.json();
            setMenus(data);
        } catch (error) {
            toast.error("Дата татахад алдаа гарлаа");
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentSuccess = async () => {
        setIsPaying(false);
        setIsOrdering(true);
        try {
            const promises = cartItems.map(item =>
                fetch("/api/order", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        studentName: user?.name || "Зочин",
                        itemName: item.name,
                        quantity: item.quantity
                    }),
                })
            );
            await Promise.all(promises);
            toast.success("Захиалга баталгаажлаа!");
            clearCart();
            setIsCartOpen(false);
        } catch (error) {
            toast.error("Захиалга бүртгэхэд алдаа гарлаа");
        } finally {
            setIsOrdering(false);
        }
    };

    const updateItemQty = (id: number, delta: number) => {
        setQuantities(prev => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) + delta) }));
    };

    // --- ЭРЭМБЭЛЭХ ЛОГИКИЙГ САЙЖРУУЛСАН ХЭСЭГ ---
    const filteredMenus = [...menus] // Оригинал датаг өөрчлөхгүйн тулд хуулбар авна
        .filter(m =>
            (activeTab === "All" || m.category === activeTab) &&
            m.name.toLowerCase().includes(search.toLowerCase())
        )
        .sort((a, b) => {
            const indexA = CATEGORY_ORDER.indexOf(a.category);
            const indexB = CATEGORY_ORDER.indexOf(b.category);

            // 1. Ангиллын дарааллаар эрэмбэлэх (Main Course -> Noodles ...)
            if (indexA !== indexB) {
                return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
            }

            // 2. Хэрэв ангилал нь ижил бол ID-аар нь эрэмбэлэх (Хуучин хоол нь дээрээ)
            return a.id - b.id;
        });

    const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
        <div className="min-h-screen bg-[#0a0a0a] p-6 md:p-10 text-gray-200 font-sans">
            <Toaster position="top-center" richColors />
            <AnimatePresence>
                {isPaying && <MockQPayModal amount={totalPrice} onClose={() => setIsPaying(false)} onSuccess={handlePaymentSuccess} />}
            </AnimatePresence>

            <div className="max-w-6xl mx-auto">
                <header className="flex justify-between items-start mb-12">
                    <div className="flex flex-col">
                        <h1 className="text-3xl md:text-4xl font-serif font-bold text-white italic tracking-tight">Smart Canteen</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="w-1.5 h-1.5 bg-[#d4a365] rounded-full animate-pulse" />
                            <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-black">Ulaanbaatar, MN</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/orders">
                            <button className="bg-[#111] p-3.5 rounded-2xl border border-white/5 text-gray-400 hover:text-[#d4a365] transition-all group">
                                <CheckCircle2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            </button>
                        </Link>
                        <button onClick={() => setIsCartOpen(true)} className="relative bg-[#111] p-3.5 rounded-2xl border border-white/5 text-gray-400 hover:text-[#d4a365] transition-all">
                            <ShoppingCart className="w-5 h-5" />
                            {mounted && cartItems.length > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 bg-[#d4a365] text-black text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#0a0a0a] animate-bounce">
                                    {cartItems.length}
                                </span>
                            )}
                        </button>
                        <div className="relative">
                            <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="bg-[#111] p-1.5 rounded-2xl border border-white/5 hover:border-[#d4a365]/30 transition-all">
                                <div className="w-10 h-10 bg-gradient-to-br from-[#d4a365] to-[#f0c080] rounded-xl flex items-center justify-center text-black font-black text-xs shadow-lg uppercase">
                                    {user?.name ? user.name.substring(0, 2) : "U"}
                                </div>
                            </button>
                            <AnimatePresence>
                                {isProfileOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                                        <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute right-0 top-full mt-4 w-60 bg-[#0f0f0f] border border-white/10 rounded-[2rem] p-3 z-50 shadow-2xl backdrop-blur-xl">
                                            <div className="px-4 py-4 border-b border-white/5 mb-2">
                                                <p className="text-[9px] text-[#d4a365] font-black uppercase tracking-widest mb-1">Бүртгэлтэй</p>
                                                <p className="text-sm font-bold text-white truncate">{user?.name || "Зочин"}</p>
                                                <p className="text-[10px] text-gray-500 truncate mt-0.5">{user?.email || "Мэдээлэл байхгүй"}</p>
                                            </div>
                                            <button onClick={() => { localStorage.removeItem("canteen_user"); window.location.href = "/login"; }} className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10 rounded-xl flex items-center gap-3">
                                                <LogOut className="w-4 h-4" /> Гарах
                                            </button>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </header>

                <div className="flex flex-col md:flex-row md:items-center gap-6 mb-12">
                    <div className="flex-grow flex gap-2 overflow-x-auto no-scrollbar pb-2">
                        {["All", ...CATEGORY_ORDER].map(cat => (
                            <button key={cat} onClick={() => setActiveTab(cat)} className={`px-6 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all whitespace-nowrap ${activeTab === cat ? 'bg-[#d4a365] text-black border-[#d4a365]' : 'bg-[#111] text-gray-500 border-white/5 hover:text-white'}`}>
                                {cat}
                            </button>
                        ))}
                    </div>
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#d4a365] transition-colors" />
                        <input type="text" placeholder="Зоог хайх..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-[#111] border border-white/5 rounded-2xl py-3 pl-12 pr-6 text-sm focus:outline-none focus:border-[#d4a365]/50 focus:ring-1 focus:ring-[#d4a365]/50 w-full md:w-64 transition-all" />
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500 italic">
                        <Loader2 className="animate-spin mb-4 text-[#d4a365]" />
                        <p className="text-xs font-black uppercase tracking-widest">Ачаалж байна...</p>
                    </div>
                ) : filteredMenus.length === 0 ? (
                    <div className="text-center py-24 bg-[#111]/30 rounded-[3rem] border border-dashed border-white/5 italic text-gray-600">Хоол олдсонгүй</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredMenus.map(item => (
                            <motion.div layout key={item.id} className="bg-[#111] rounded-[2.5rem] border border-white/5 p-7 group shadow-xl relative overflow-hidden flex flex-col">
                                <Link href={`/menu/${item.id}`} className="cursor-pointer">
                                    <div className="h-52 rounded-2xl overflow-hidden mb-6 relative">
                                        <img src={item.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={item.name} />
                                        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[8px] font-black uppercase text-[#d4a365]">
                                            {item.category}
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold mb-1 text-white group-hover:text-[#d4a365] transition-colors">{item.name}</h3>
                                    <p className="text-gray-500 text-xs mb-6 italic line-clamp-2">{item.description}</p>
                                </Link>
                                <div className="mt-auto pt-4 border-t border-white/5">
                                    <div className="flex justify-between items-center mb-6">
                                        <span className="text-[#d4a365] font-bold text-xl font-mono">₮{item.price.toLocaleString()}</span>
                                        <div className="flex items-center gap-4 bg-white/5 p-2 px-4 rounded-xl border border-white/5">
                                            <button onClick={() => updateItemQty(item.id, -1)} className="hover:text-white text-gray-500"><Minus className="w-4" /></button>
                                            <span className="font-bold w-4 text-center">{quantities[item.id] || 0}</span>
                                            <button onClick={() => updateItemQty(item.id, 1)} className="hover:text-white text-gray-500"><Plus className="w-4" /></button>
                                        </div>
                                    </div>
                                    <button onClick={() => {
                                        const qty = quantities[item.id] || 0;
                                        if (qty <= 0) return toast.error("Тоо хэмжээ сонгоно уу");
                                        addItem({ ...item, quantity: qty });
                                        setQuantities(prev => ({ ...prev, [item.id]: 0 }));
                                        toast.success(`${item.name} нэмэгдлээ`);
                                    }} className="w-full bg-[#d4a365] text-black font-black py-4 rounded-2xl uppercase text-[10px] tracking-widest hover:bg-[#f0c080] active:scale-95 transition-all shadow-[0_10px_20px_-10px_rgba(212,163,101,0.4)]">
                                        Сагсанд нэмэх
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            <AnimatePresence>
                {isCartOpen && (
                    <div className="fixed inset-0 z-50 flex justify-end">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
                        <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25 }} className="relative w-full max-w-md bg-[#0f0f0f] h-full p-8 flex flex-col shadow-2xl border-l border-white/5">
                            <div className="flex justify-between items-center mb-10">
                                <h2 className="text-2xl font-serif font-bold text-white italic">Миний сагс</h2>
                                <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-white/5 rounded-full text-gray-500"><X /></button>
                            </div>
                            <div className="flex-grow overflow-y-auto space-y-5 no-scrollbar">
                                {mounted && cartItems.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-600 italic text-sm opacity-50">Сагс одоогоор хоосон...</div>
                                ) : mounted && cartItems.map(item => (
                                    <div key={item.id} className="flex gap-4 items-center bg-[#151515] p-4 rounded-[2rem] border border-white/5 group">
                                        <img src={item.image} className="w-16 h-16 rounded-2xl object-cover" alt={item.name} />
                                        <div className="flex-grow">
                                            <h4 className="font-bold text-sm text-white">{item.name}</h4>
                                            <p className="text-[#d4a365] text-xs font-mono font-bold">₮{item.price.toLocaleString()} <span className="text-gray-600 ml-1">x {item.quantity}</span></p>
                                        </div>
                                        <button onClick={() => removeItem(item.id)} className="p-2 text-gray-700 hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-8 pt-8 border-t border-white/5 space-y-6">
                                <div className="flex justify-between items-end">
                                    <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Төлөх дүн</span>
                                    <span className="text-3xl font-bold text-[#d4a365] font-mono tracking-tighter">₮{totalPrice.toLocaleString()}</span>
                                </div>
                                <button onClick={() => setIsPaying(true)} disabled={cartItems.length === 0 || isOrdering} className="w-full bg-[#d4a365] text-black font-black py-5 rounded-[2.5rem] hover:bg-[#f0c080] transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-30 shadow-2xl">
                                    {isOrdering ? <Loader2 className="animate-spin w-5 h-5" /> : <><Smartphone className="w-5 h-5" /> Захиалга баталгаажуулах</>}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}