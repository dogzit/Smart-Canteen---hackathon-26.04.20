"use client";

import { useEffect, useState } from "react";
import { Star, Loader2, X, Package, ChevronDown, ChevronUp, Calendar, Clock, ChevronLeft, Utensils } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast, Toaster } from "sonner";
import Link from "next/link";

// --- Types ---
interface Order {
    id: number;
    itemName: string;
    quantity: number;
    status: string;
    createdAt: string;
    menuItemId?: number; // Нэмэлтээр оруулж өгөв
}

interface GroupedOrder {
    itemName: string;
    menuItemId: number | null; // ID-г хадгалах талбар
    totalQuantity: number;
    rating: number | null;
    review: string | null;
    history: Order[];
}

export default function OrderHistoryPage() {
    const [groupedOrders, setGroupedOrders] = useState<GroupedOrder[]>([]);
    const [expandedItem, setExpandedItem] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<{ name: string } | null>(null);

    // Modal States
    const [selectedGroup, setSelectedGroup] = useState<GroupedOrder | null>(null);
    const [rating, setRating] = useState(0);
    const [reviewText, setReviewText] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem("canteen_user");
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            fetchOrders(parsedUser.name);
        } else {
            setLoading(false);
        }
    }, []);

    const fetchOrders = async (name: string) => {
        setLoading(true);
        try {
            const [ordersRes, reviewsRes] = await Promise.all([
                fetch(`/api/order/history?studentName=${encodeURIComponent(name)}`),
                fetch(`/api/order/review/list?studentName=${encodeURIComponent(name)}`)
            ]);

            const orders: Order[] = await ordersRes.json();
            const reviews: any[] = await reviewsRes.json();

            if (!Array.isArray(orders)) {
                setGroupedOrders([]);
                return;
            }

            const groups = orders.reduce((acc: Record<string, GroupedOrder>, order) => {
                if (!acc[order.itemName]) {
                    const itemReview = Array.isArray(reviews) ? reviews.find(r => r.itemName === order.itemName) : null;

                    acc[order.itemName] = {
                        itemName: order.itemName,
                        menuItemId: order.menuItemId || null, // Захиалга дотор ирж буй ID-г авна
                        totalQuantity: 0,
                        history: [],
                        rating: itemReview?.rating || null,
                        review: itemReview?.review || null
                    };
                }
                acc[order.itemName].totalQuantity += order.quantity;
                acc[order.itemName].history.push(order);
                return acc;
            }, {});

            setGroupedOrders(Object.values(groups));
        } catch (error) {
            console.error("Fetch error:", error);
            toast.error("Мэдээлэл татахад алдаа гарлаа");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateReview = async () => {
        if (!user || rating === 0) return toast.error("Үнэлгээгээ сонгоно уу!");

        // ШАЛГАЛТ: menuItemId байхгүй байсан ч itemName байвал Backend рүү явуулна
        if (!selectedGroup?.menuItemId && !selectedGroup?.itemName) {
            return toast.error("Хоолны мэдээлэл олдсонгүй.");
        }

        setIsSubmitting(true);
        try {
            const res = await fetch("/api/order/review", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    studentName: user.name,
                    menuItemId: selectedGroup?.menuItemId, // Байвал ID
                    itemName: selectedGroup?.itemName,     // Байхгүй бол Нэр (Backend-д хэрэгтэй)
                    rating: rating,
                    review: reviewText
                }),
            });

            if (res.ok) {
                toast.success("Үнэлгээ амжилттай хадгалагдлаа");
                setSelectedGroup(null);
                setRating(0);
                setReviewText("");
                await fetchOrders(user.name);
            } else {
                const errorData = await res.json();
                toast.error(errorData.error || "Хадгалахад алдаа гарлаа");
            }
        } catch (error) {
            toast.error("Сервертэй холбогдоход алдаа гарлаа");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-gray-200 p-8 md:p-12 font-sans">


            <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-[#d4a365] transition-all mb-12 group">
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span>Буцах</span>
            </Link>

            <div className="max-w-3xl mx-auto">
                <header className="mb-12">
                    <h1 className="text-4xl font-serif font-bold text-white italic">Миний зоогууд</h1>
                    <p className="text-[#d4a365] text-[9px] uppercase tracking-[0.4em] mt-3 font-black">History & Reviews</p>
                </header>

                <div className="space-y-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-32">
                            <Loader2 className="animate-spin text-[#d4a365]" />
                        </div>
                    ) : groupedOrders.length === 0 ? (
                        <div className="text-center py-32 bg-[#111]/30 rounded-[3rem] border border-dashed border-white/5">
                            <Utensils className="w-12 h-12 mx-auto text-gray-800 mb-6" />
                            <p className="text-gray-500 text-sm">Одоогоор захиалга алга байна.</p>
                        </div>
                    ) : (
                        groupedOrders.map((group) => {
                            const isExpanded = expandedItem === group.itemName;

                            return (
                                <div key={group.itemName} className="bg-[#111] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl transition-all">
                                    <div onClick={() => setExpandedItem(isExpanded ? null : group.itemName)} className="p-8 flex items-center justify-between cursor-pointer hover:bg-white/[0.01]">
                                        <div className="flex items-center gap-6">
                                            <div className="bg-[#181818] p-4 rounded-3xl border border-white/5">
                                                <Package className="text-[#d4a365] w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-white">{group.itemName}</h3>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <p className="text-[10px] text-gray-500 uppercase font-black">Нийт: {group.totalQuantity}</p>
                                                    {group.rating && (
                                                        <div className="flex gap-0.5 ml-2 border-l border-white/10 pl-3">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star key={i} className={`w-3 h-3 ${i < (group.rating || 0) ? "fill-[#d4a365] text-[#d4a365]" : "text-gray-800"}`} />
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setRating(group.rating || 0);
                                                    setReviewText(group.review || "");
                                                    setSelectedGroup(group);
                                                }}
                                                className="bg-white/5 hover:bg-[#d4a365] hover:text-black px-5 py-2.5 rounded-2xl border border-white/5 text-[9px] font-black uppercase tracking-widest transition-all"
                                            >
                                                {group.rating ? "Засах" : "Үнэлэх"}
                                            </button>
                                            {isExpanded ? <ChevronUp className="w-5 h-5 text-[#d4a365]" /> : <ChevronDown className="w-5 h-5 text-gray-700" />}
                                        </div>
                                    </div>

                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-white/5 bg-black/20">
                                                <div className="p-8 space-y-6">
                                                    {group.history.map((order) => (
                                                        <div key={order.id} className="flex justify-between items-center pl-6 border-l border-white/5">
                                                            <div>
                                                                <div className="flex items-center gap-2 text-[10px] text-gray-600 font-bold uppercase mb-1">
                                                                    <Calendar className="w-3 h-3" /> {new Date(order.createdAt).toLocaleDateString()}
                                                                    <Clock className="w-3 h-3 ml-2" /> {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </div>
                                                                <p className="text-sm font-semibold text-gray-400">{order.quantity} порц</p>
                                                            </div>
                                                            <span className="text-[10px] font-black text-gray-800">#{order.id}</span>
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

            {/* Modal */}
            <AnimatePresence>
                {selectedGroup && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full max-w-md bg-[#111] rounded-[3rem] p-10 border border-white/10 shadow-2xl text-center">
                            <button onClick={() => setSelectedGroup(null)} className="absolute top-8 right-8 text-gray-600 hover:text-white"><X /></button>
                            <h2 className="text-2xl font-serif font-bold text-white mb-2">Зоог ямар байв?</h2>
                            <p className="text-[#d4a365] text-xs mb-10 font-bold uppercase tracking-widest">{selectedGroup.itemName}</p>
                            <div className="flex justify-center gap-3 mb-10">
                                {[...Array(5)].map((_, i) => (
                                    <button key={i} onClick={() => setRating(i + 1)}>
                                        <Star className={`w-10 h-10 ${i < rating ? "fill-[#d4a365] text-[#d4a365] drop-shadow-[0_0_10px_rgba(212,163,101,0.5)]" : "text-gray-800"}`} />
                                    </button>
                                ))}
                            </div>
                            <textarea
                                value={reviewText}
                                onChange={(e) => setReviewText(e.target.value)}
                                placeholder="Сэтгэгдэлээ энд бичээрэй..."
                                className="w-full bg-[#181818] border border-white/5 rounded-3xl p-6 text-sm outline-none mb-8 text-gray-300 resize-none min-h-[120px]"
                            />
                            <button onClick={handleUpdateReview} disabled={isSubmitting || rating === 0} className="w-full bg-[#d4a365] text-black font-black py-5 rounded-[2rem] uppercase text-[10px] hover:bg-[#f0c080] disabled:opacity-20 transition-all flex items-center justify-center gap-3">
                                {isSubmitting ? <Loader2 className="animate-spin w-4 h-4" /> : "Үнэлгээ хадгалах"}
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}