"use client";

import { useEffect, useState } from "react";
import { Star, MessageSquare, Edit3, Loader2, X, Package, ChevronDown, ChevronUp, Calendar, Clock, ChevronLeft, Utensils } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast, Toaster } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";

// --- Types ---
interface Order {
    id: number;
    itemName: string;
    quantity: number;
    status: string;
    rating: number | null;
    review: string | null;
    createdAt: string;
}

interface GroupedOrder {
    itemName: string;
    totalQuantity: number;
    history: Order[];
}

export default function OrderHistoryPage() {
    const router = useRouter();
    const [groupedOrders, setGroupedOrders] = useState<GroupedOrder[]>([]);
    const [expandedItem, setExpandedItem] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<{ name: string } | null>(null);

    // Modal States
    const [selectedGroup, setSelectedGroup] = useState<GroupedOrder | null>(null);
    const [rating, setRating] = useState(0);
    const [reviewText, setReviewText] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 1. Хэрэглэгчийн мэдээллийг localStorage-аас авах
    useEffect(() => {
        const storedUser = localStorage.getItem("canteen_user");
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            fetchOrders(parsedUser.name); // Нэрийг аваад захиалгаа татах
        } else {
            setLoading(false);
        }
    }, []);

    const fetchOrders = async (name: string) => {
        setLoading(true);
        try {
            // API хүсэлтэд динамик нэр ашиглах
            const res = await fetch(`/api/order/history?studentName=${encodeURIComponent(name)}`);
            const data: Order[] = await res.json();

            if (!Array.isArray(data)) {
                setGroupedOrders([]);
                return;
            }

            const groups = data.reduce((acc: Record<string, GroupedOrder>, order) => {
                if (!acc[order.itemName]) {
                    acc[order.itemName] = { itemName: order.itemName, totalQuantity: 0, history: [] };
                }
                acc[order.itemName].totalQuantity += order.quantity;
                acc[order.itemName].history.push(order);
                return acc;
            }, {});
            setGroupedOrders(Object.values(groups));
        } catch (error) {
            toast.error("Захиалгын түүх татахад алдаа гарлаа");
        } finally {
            setLoading(false);
        }
    };

    const openReviewModal = (e: React.MouseEvent, group: GroupedOrder) => {
        e.stopPropagation();
        const lastReview = group.history.find(h => h.rating !== null);
        setRating(lastReview?.rating || 0);
        setReviewText(lastReview?.review || "");
        setSelectedGroup(group);
    };

    const handleUpdateReview = async () => {
        if (!user || rating === 0) return toast.error("Үнэлгээгээ сонгоно уу!");
        setIsSubmitting(true);
        try {
            const res = await fetch("/api/order/review", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    studentName: user.name,
                    itemName: selectedGroup?.itemName,
                    rating,
                    review: reviewText
                }),
            });

            if (res.ok) {
                toast.success("Үнэлгээ шинэчлэгдлээ");
                setSelectedGroup(null);
                fetchOrders(user.name);
            }
        } catch (error) { toast.error("Алдаа гарлаа"); }
        finally { setIsSubmitting(false); }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-gray-200 p-8 md:p-12 font-sans">
            <Toaster richColors theme="dark" position="top-center" />

            <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-[#d4a365] transition-all mb-12 group">
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span>Буцах</span>
            </Link>

            <div className="max-w-3xl mx-auto">
                <header className="mb-12">
                    <h1 className="text-4xl font-serif font-bold text-white tracking-tight">Миний зоогууд</h1>
                    <p className="text-[#d4a365] text-[9px] uppercase tracking-[0.4em] mt-3 font-black italic">History & Personal Reviews</p>
                </header>

                <div className="space-y-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-32">
                            <Loader2 className="animate-spin text-[#d4a365] mb-4" />
                            <p className="text-[10px] uppercase font-black tracking-widest text-gray-600">Ачаалж байна...</p>
                        </div>
                    ) : groupedOrders.length === 0 ? (
                        /* --- EMPTY STATE --- */
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center justify-center py-32 bg-[#111]/30 rounded-[3rem] border border-dashed border-white/5 text-center"
                        >
                            <div className="bg-[#181818] p-8 rounded-full mb-6 text-gray-700">
                                <Utensils className="w-12 h-12" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Захиалга олдсонгүй</h3>
                            <p className="text-gray-500 text-sm mb-10 max-w-xs leading-relaxed">
                                Та одоогоор ямар нэгэн захиалга хийгээгүй байна.
                            </p>
                            <Link href="/">
                                <button className="bg-[#d4a365] text-black font-black py-4 px-10 rounded-2xl uppercase text-[10px] tracking-widest hover:bg-[#f0c080] transition-all active:scale-95">
                                    Хоол захиалах
                                </button>
                            </Link>
                        </motion.div>
                    ) : (
                        groupedOrders.map((group) => {
                            const latestReview = group.history.find(h => h.rating !== null);
                            const hasReview = !!latestReview;
                            const isExpanded = expandedItem === group.itemName;

                            return (
                                <div key={group.itemName} className="bg-[#111] rounded-[2.5rem] border border-white/5 overflow-hidden transition-all duration-500 hover:border-[#d4a365]/20 shadow-2xl">
                                    <div onClick={() => setExpandedItem(isExpanded ? null : group.itemName)} className="p-8 flex items-center justify-between cursor-pointer hover:bg-white/[0.01] transition-colors">
                                        <div className="flex items-center gap-6">
                                            <div className="bg-[#181818] p-4 rounded-3xl border border-white/5">
                                                <Package className="text-[#d4a365] w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-white">{group.itemName}</h3>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Нийт: <span className="text-[#d4a365]">{group.totalQuantity}</span></p>
                                                    {hasReview && (
                                                        <div className="flex gap-0.5 ml-2 border-l border-white/10 pl-3">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star key={i} className={`w-3 h-3 ${i < (latestReview?.rating || 0) ? "fill-[#d4a365] text-[#d4a365]" : "text-gray-800"}`} />
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <button onClick={(e) => openReviewModal(e, group)} className="bg-white/5 hover:bg-[#d4a365] hover:text-black px-5 py-2.5 rounded-2xl border border-white/5 text-[9px] font-black uppercase tracking-widest transition-all">
                                                {hasReview ? "Edit" : "Review"}
                                            </button>
                                            {isExpanded ? <ChevronUp className="w-5 h-5 text-[#d4a365]" /> : <ChevronDown className="w-5 h-5 text-gray-700" />}
                                        </div>
                                    </div>

                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-white/5 bg-black/20">
                                                <div className="p-8 space-y-8">
                                                    {group.history.map((order) => (
                                                        <div key={order.id} className="relative pl-8 border-l border-white/5 pb-2">
                                                            <div className="absolute left-[-4.5px] top-0 w-2 h-2 bg-[#d4a365] rounded-full shadow-[0_0_8px_rgba(212,163,101,0.5)]" />
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <div className="flex items-center gap-2 text-[10px] text-gray-600 font-bold uppercase mb-1.5">
                                                                        <Calendar className="w-3 h-3" /> {new Date(order.createdAt).toLocaleDateString()}
                                                                        <Clock className="w-3 h-3 ml-2" /> {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                    </div>
                                                                    <p className="text-sm font-semibold text-gray-400">{order.quantity} порц захиалсан</p>
                                                                </div>
                                                                <span className="text-[10px] font-black text-gray-800">#{order.id}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* --- REVIEW MODAL --- */}
            <AnimatePresence>
                {selectedGroup && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedGroup(null)} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative w-full max-w-md bg-[#111] rounded-[3rem] p-10 border border-white/10 shadow-2xl text-center">
                            <button onClick={() => setSelectedGroup(null)} className="absolute top-8 right-8 text-gray-600 hover:text-white transition-colors"><X /></button>
                            <h2 className="text-2xl font-serif font-bold text-white mb-2">Зоог ямар байв?</h2>
                            <p className="text-[#d4a365] text-xs mb-10 font-bold uppercase tracking-widest">{selectedGroup.itemName}</p>
                            <div className="flex justify-center gap-3 mb-10">
                                {[...Array(5)].map((_, i) => (
                                    <button key={i} onClick={() => setRating(i + 1)} className="transition-transform active:scale-125">
                                        <Star className={`w-10 h-10 transition-all ${i < rating ? "fill-[#d4a365] text-[#d4a365] drop-shadow-[0_0_10px_rgba(212,163,101,0.5)]" : "text-gray-800"}`} />
                                    </button>
                                ))}
                            </div>
                            <textarea
                                value={reviewText}
                                onChange={(e) => setReviewText(e.target.value)}
                                placeholder="Сэтгэгдэлээ энд бичээрэй..."
                                className="w-full bg-[#181818] border border-white/5 rounded-3xl p-6 text-sm outline-none focus:border-[#d4a365]/40 min-h-[120px] mb-8 text-gray-300 resize-none"
                            />
                            <button onClick={handleUpdateReview} disabled={isSubmitting || rating === 0} className="w-full bg-[#d4a365] text-black font-black py-5 rounded-[2rem] uppercase text-[10px] tracking-widest hover:bg-[#f0c080] transition-all disabled:opacity-20 flex items-center justify-center gap-3">
                                {isSubmitting ? <Loader2 className="animate-spin w-4 h-4" /> : "Үнэлгээ хадгалах"}
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}