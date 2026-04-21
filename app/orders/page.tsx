"use client";

import { useEffect, useState, useCallback } from "react";
import { Star, Loader2, X, Package, ChevronLeft, ArrowRight, CheckCircle2, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast, Toaster } from "sonner";
import Link from "next/link";

interface Order {
    id: number;
    itemName: string;
    quantity: number;
    menuItemId: number;
    createdAt: string;
}

interface Review {
    menuItemId: number;
    rating: number;
    review: string;
}

interface GroupedOrder {
    itemName: string;
    menuItemId: number;
    totalQuantity: number;
    rating: number | null;
    review: string | null;
    history: Order[];
}

const LABEL: Record<number, string> = { 1: "Муу", 2: "Дунд", 3: "Хэвийн", 4: "Сайн", 5: "Гайхалтай" };

export default function OrderHistoryPage() {
    const [groupedOrders, setGroupedOrders] = useState<GroupedOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<{ name: string } | null>(null);
    const [drawerGroup, setDrawerGroup] = useState<GroupedOrder | null>(null);
    const [drawerMode, setDrawerMode] = useState<"detail" | "review">("detail");
    const [rating, setRating] = useState(0);
    const [reviewText, setReviewText] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hoveredStar, setHoveredStar] = useState(0);

    const fetchOrders = useCallback(async (name: string) => {
        setLoading(true);
        try {
            const [ordersRes, reviewsRes] = await Promise.all([
                fetch(`/api/order/history?studentName=${encodeURIComponent(name)}`),
                fetch(`/api/order/review/list?studentName=${encodeURIComponent(name)}`)
            ]);
            const orders: Order[] = await ordersRes.json();
            const reviews: Review[] = await reviewsRes.json();

            const groups = orders.reduce((acc: Record<string, GroupedOrder>, order) => {
                if (!acc[order.itemName]) {
                    const itemReview = Array.isArray(reviews)
                        ? reviews.find((r) => r.menuItemId === order.menuItemId)
                        : null;
                    acc[order.itemName] = {
                        itemName: order.itemName,
                        menuItemId: order.menuItemId,
                        totalQuantity: 0,
                        history: [],
                        rating: itemReview ? itemReview.rating : null,
                        review: itemReview ? itemReview.review : null,
                    };
                }
                acc[order.itemName].totalQuantity += order.quantity;
                acc[order.itemName].history.push(order);
                return acc;
            }, {});

            setGroupedOrders(Object.values(groups));
        } catch {
            toast.error("Дата татахад алдаа гарлаа");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const stored = localStorage.getItem("canteen_user");
        if (stored) {
            const parsed = JSON.parse(stored);
            setUser(parsed);
            fetchOrders(parsed.name);
        }
    }, [fetchOrders]);

    const handleUpdateReview = async () => {
        if (!user || !drawerGroup) return;
        setIsSubmitting(true);
        try {
            const res = await fetch("/api/order/review", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    studentName: user.name,
                    menuItemId: drawerGroup.menuItemId,
                    rating: Number(rating),
                    review: reviewText,
                }),
            });
            if (res.ok) {
                toast.success("Амжилттай хадгалагдлаа");
                await fetchOrders(user.name);
                setDrawerMode("detail");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const openDrawer = (group: GroupedOrder) => {
        setDrawerGroup(group);
        setRating(group.rating || 0);
        setReviewText(group.review || "");
        setDrawerMode("detail");
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-gray-200 font-sans">


            <div className="max-w-2xl mx-auto px-6 py-10">
                {/* Back */}
                <Link
                    href="/smart-canteen"
                    className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#555] hover:text-[#d4a365] transition-colors mb-10"
                >
                    <ChevronLeft className="w-3 h-3" />
                    Буцах
                </Link>

                <h1 className="text-3xl font-bold italic font-serif text-white mb-10">
                    Миний зоогууд
                </h1>

                {/* Order list */}
                {loading ? (
                    <div className="py-20 flex justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-[#d4a365]" />
                    </div>
                ) : groupedOrders.length === 0 ? (
                    <div className="py-20 text-center text-[#444] italic text-sm">
                        Захиалгын түүх байхгүй байна
                    </div>
                ) : (
                    <div className="space-y-3">
                        {groupedOrders.map((group) => (
                            <motion.button
                                key={group.itemName}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                onClick={() => openDrawer(group)}
                                className="w-full bg-[#111] border border-white/5 p-5 rounded-[1.75rem] flex items-center justify-between hover:bg-[#161616] transition-all group"
                            >
                                {/* Left */}
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-[#1a1a1a] rounded-2xl border border-white/5 flex items-center justify-center flex-shrink-0">
                                        <Package className="w-5 h-5 text-[#d4a365]" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-white text-[15px] group-hover:text-[#d4a365] transition-colors">
                                            {group.itemName}
                                        </p>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-[#555]">
                                                {group.totalQuantity} порц
                                            </span>
                                            {group.rating && (
                                                <div className="flex gap-0.5">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`w-2.5 h-2.5 ${i < group.rating!
                                                                ? "fill-[#d4a365] text-[#d4a365]"
                                                                : "text-white/8 fill-none"
                                                                }`}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Right icon */}
                                {group.rating ? (
                                    <CheckCircle2 className="w-5 h-5 text-[#d4a365]/50 flex-shrink-0" />
                                ) : (
                                    <ArrowRight className="w-5 h-5 text-white/10 flex-shrink-0" />
                                )}
                            </motion.button>
                        ))}
                    </div>
                )}
            </div>

            {/* Drawer */}
            <AnimatePresence>
                {drawerGroup && (
                    <>
                        {/* Overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setDrawerGroup(null)}
                            className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm"
                        />

                        {/* Panel */}
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-[#0d0d0d] border-l border-white/5 flex flex-col"
                        >
                            {/* Header */}
                            <div className="p-8 border-b border-white/5 flex justify-between items-start">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[#d4a365]">
                                        {drawerMode === "detail" ? "Түүх" : "Үнэлгээ"}
                                    </p>
                                    <h2 className="text-xl font-bold font-serif italic text-white mt-0.5">
                                        {drawerGroup.itemName}
                                    </h2>
                                </div>
                                <button
                                    onClick={() => setDrawerGroup(null)}
                                    className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                                >
                                    <X className="w-5 h-5 text-[#aaa]" />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="flex-1 overflow-y-auto p-8">
                                {drawerMode === "detail" ? (
                                    <div className="space-y-4">
                                        {/* Stat */}
                                        <div className="bg-white/[0.04] border border-white/5 rounded-3xl p-6">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-[#555] mb-2">
                                                Нийт хэрэглээ
                                            </p>
                                            <p className="text-4xl font-bold text-white">
                                                {drawerGroup.totalQuantity}{" "}
                                                <span className="text-xs font-normal text-[#555]">порц</span>
                                            </p>
                                        </div>

                                        {/* Existing review */}
                                        {drawerGroup.rating && (
                                            <div className="bg-[#d4a365]/5 border border-[#d4a365]/20 rounded-3xl p-6">
                                                <div className="flex gap-1 mb-3">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`w-4 h-4 ${i < drawerGroup.rating!
                                                                ? "fill-[#d4a365] text-[#d4a365]"
                                                                : "text-white/10 fill-none"
                                                                }`}
                                                        />
                                                    ))}
                                                </div>
                                                <p className="text-[#ccc] italic text-sm">
                                                    &quot;{drawerGroup.review}&quot;
                                                </p>
                                            </div>
                                        )}

                                        {/* History */}
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-[#444] mb-3">
                                                Захиалгууд
                                            </p>
                                            <div className="space-y-2">
                                                {drawerGroup.history.map((h) => (
                                                    <div
                                                        key={h.id}
                                                        className="flex justify-between items-center p-4 bg-white/[0.04] border border-white/5 rounded-2xl"
                                                    >
                                                        <div className="flex items-center gap-2 text-[11px] text-[#555]">
                                                            <Calendar className="w-3 h-3" />
                                                            {new Date(h.createdAt).toLocaleDateString("mn-MN")}
                                                        </div>
                                                        <p className="text-sm font-bold text-white">{h.quantity} порц</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    /* Review form */
                                    <div className="space-y-8 py-6">
                                        <div className="text-center">
                                            <div className="flex justify-center gap-3 mb-4">
                                                {[1, 2, 3, 4, 5].map((i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => setRating(i)}
                                                        onMouseEnter={() => setHoveredStar(i)}
                                                        onMouseLeave={() => setHoveredStar(0)}
                                                        className="transition-transform hover:scale-110"
                                                    >
                                                        <Star
                                                            className={`w-10 h-10 transition-colors ${i <= (hoveredStar || rating)
                                                                ? "fill-[#d4a365] text-[#d4a365]"
                                                                : "text-white/10 fill-none"
                                                                }`}
                                                        />
                                                    </button>
                                                ))}
                                            </div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-[#d4a365]">
                                                {LABEL[hoveredStar || rating] || "Сонгоно уу"}
                                            </p>
                                        </div>
                                        <textarea
                                            value={reviewText}
                                            onChange={(e) => setReviewText(e.target.value)}
                                            placeholder="Сэтгэгдэл үлдээх..."
                                            className="w-full bg-white/[0.05] border border-white/10 rounded-3xl p-6 text-sm text-[#e5e5e5] placeholder-[#444] h-40 outline-none focus:border-[#d4a365]/30 transition-colors resize-none font-sans"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="p-8 border-t border-white/5">
                                {drawerMode === "detail" ? (
                                    <button
                                        onClick={() => setDrawerMode("review")}
                                        className="w-full py-5 bg-[#d4a365] hover:bg-[#f0c080] text-black font-black text-[11px] uppercase tracking-widest rounded-2xl transition-all active:scale-95"
                                    >
                                        {drawerGroup.rating ? "Үнэлгээ засах" : "Үнэлгээ өгөх"}
                                    </button>
                                ) : (
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setDrawerMode("detail")}
                                            className="flex-1 py-5 bg-white/[0.06] text-white font-black text-[11px] uppercase tracking-widest rounded-2xl hover:bg-white/10 transition-all"
                                        >
                                            Болих
                                        </button>
                                        <button
                                            onClick={handleUpdateReview}
                                            disabled={isSubmitting || rating === 0}
                                            className="flex-[2] py-5 bg-[#d4a365] hover:bg-[#f0c080] text-black font-black text-[11px] uppercase tracking-widest rounded-2xl flex justify-center items-center transition-all active:scale-95 disabled:opacity-30"
                                        >
                                            {isSubmitting ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                "Хадгалах"
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}