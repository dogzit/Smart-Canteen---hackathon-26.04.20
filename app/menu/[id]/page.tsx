"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ChevronLeft, Star, Clock, ShoppingCart, Plus, Minus,
    MessageSquare
} from "lucide-react";
import { motion } from "framer-motion";
import { toast, Toaster } from "sonner";
import { useCartStore } from "@/store/useCartStore";

interface Review {
    id: number;
    rating: number;
    review: string;
    studentName: string;
    createdAt: string;
}

interface MenuItem {
    id: number;
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
    reviews: Review[];
}

// --- Hero Skeleton ---
function SkeletonDetail() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] animate-pulse pb-20">
            <div className="h-[45vh] md:h-[60vh] w-full bg-white/5" />
            <div className="max-w-4xl mx-auto px-6 -mt-24 relative z-10">
                <div className="bg-[#111] border border-white/5 rounded-[3rem] p-8 md:p-12">
                    <div className="flex flex-col md:flex-row justify-between gap-6 mb-10">
                        <div className="flex-1">
                            <div className="h-3 bg-white/5 rounded-full w-24 mb-4" />
                            <div className="h-10 bg-white/5 rounded-2xl w-3/4 mb-3" />
                            <div className="h-10 bg-white/5 rounded-2xl w-1/2 mb-6" />
                            <div className="flex gap-4">
                                <div className="h-8 bg-white/5 rounded-full w-28" />
                                <div className="h-8 bg-white/5 rounded-full w-24" />
                            </div>
                        </div>
                        <div className="h-20 w-40 bg-white/5 rounded-3xl" />
                    </div>
                    <div className="space-y-3 mb-12">
                        <div className="h-3 bg-white/5 rounded-full w-full" />
                        <div className="h-3 bg-white/5 rounded-full w-5/6" />
                        <div className="h-3 bg-white/5 rounded-full w-4/6" />
                    </div>
                    <div className="flex gap-6 pt-10 border-t border-white/5">
                        <div className="h-14 bg-white/5 rounded-full w-40" />
                        <div className="h-14 bg-white/5 rounded-full flex-1" />
                    </div>
                </div>

                {/* Reviews skeleton */}
                <div className="mt-20 space-y-6">
                    <div className="flex justify-between items-center px-4 mb-10">
                        <div className="h-8 bg-white/5 rounded-2xl w-56" />
                        <div className="h-4 bg-white/5 rounded-full w-20" />
                    </div>
                    {[1, 2].map(i => (
                        <div key={i} className="bg-[#111] p-8 rounded-[2.5rem] border border-white/5">
                            <div className="flex justify-between mb-6">
                                <div className="flex gap-4 items-center">
                                    <div className="w-12 h-12 bg-white/5 rounded-2xl" />
                                    <div>
                                        <div className="h-4 bg-white/5 rounded-full w-28 mb-2" />
                                        <div className="h-3 bg-white/5 rounded-full w-20" />
                                    </div>
                                </div>
                                <div className="h-8 bg-white/5 rounded-2xl w-16" />
                            </div>
                            <div className="space-y-2 pl-2">
                                <div className="h-3 bg-white/5 rounded-full w-full" />
                                <div className="h-3 bg-white/5 rounded-full w-4/5" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function DishDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [item, setItem] = useState<MenuItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [qty, setQty] = useState(1);

    const addItem = useCartStore((state) => state.addItem);

    useEffect(() => {
        const fetchDetail = async () => {
            if (!params?.id) return;
            try {
                const res = await fetch(`/api/menu/${params.id}`);
                if (!res.ok) throw new Error();
                const data = await res.json();
                setItem(data);
            } catch (error) {
                toast.error("Мэдээлэл авахад алдаа гарлаа");
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [params?.id]);

    const reviews = item?.reviews || [];
    const averageRating = reviews.length
        ? (reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length).toFixed(1)
        : "0.0";

    const handleAddToCart = () => {
        if (!item) return;
        addItem({ id: item.id, name: item.name, price: item.price, quantity: qty, image: item.image });
        toast.success(`${item.name} сагсанд нэмэгдлээ!`);
    };

    if (loading) return <SkeletonDetail />;

    if (!item) return <div className="text-white text-center py-20 font-serif italic">Хоол олдсонгүй.</div>;

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white pb-20 selection:bg-[#d4a365]/30">


            <div className="relative h-[45vh] md:h-[60vh] w-full overflow-hidden">
                <motion.img
                    initial={{ scale: 1.1, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    src={item.image}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/20 to-transparent" />
                <button
                    onClick={() => router.back()}
                    className="absolute top-8 left-8 p-3 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-[#d4a365] hover:text-black transition-all z-20 group"
                >
                    <ChevronLeft className="w-6 h-6 group-active:scale-90" />
                </button>
            </div>

            <div className="max-w-4xl mx-auto px-6 -mt-24 relative z-10">
                <motion.div
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-[#111] border border-white/5 rounded-[3rem] p-8 md:p-12 shadow-[0_-20px_50px_-12px_rgba(0,0,0,0.5)]"
                >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10">
                        <div>
                            <span className="text-[#d4a365] text-[10px] font-black uppercase tracking-[0.4em] mb-3 block">
                                {item.category}
                            </span>
                            <h1 className="text-4xl md:text-6xl font-serif font-bold italic mb-6 leading-tight">
                                {item.name}
                            </h1>
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/5">
                                    <Star className={`w-4 h-4 ${Number(averageRating) > 0 ? "text-[#d4a365] fill-[#d4a365]" : "text-gray-600"}`} />
                                    <span className="text-sm font-bold">{averageRating}</span>
                                    <span className="text-[10px] text-gray-500 ml-1">({reviews.length})</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-400">
                                    <Clock className="w-4 h-4 text-[#d4a365]" />
                                    <span className="text-sm font-medium">15-20 мин</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-4xl md:text-5xl font-mono font-bold text-[#d4a365] bg-[#d4a365]/5 p-4 rounded-3xl border border-[#d4a365]/10">
                            ₮{item.price.toLocaleString()}
                        </div>
                    </div>

                    <p className="text-gray-400 text-lg leading-relaxed mb-12 font-light italic border-l-2 border-[#d4a365]/20 pl-6">
                        {item.description}
                    </p>

                    <div className="flex flex-col md:flex-row items-center gap-6 pt-10 border-t border-white/5">
                        <div className="flex items-center gap-8 bg-white/5 p-2 px-6 rounded-full border border-white/5">
                            <button onClick={() => setQty(q => Math.max(1, q - 1))} className="p-2 hover:text-[#d4a365] transition-colors">
                                <Minus className="w-5" />
                            </button>
                            <span className="text-2xl font-mono font-bold min-w-[20px] text-center">{qty}</span>
                            <button onClick={() => setQty(q => q + 1)} className="p-2 hover:text-[#d4a365] transition-colors">
                                <Plus className="w-5" />
                            </button>
                        </div>
                        <button
                            onClick={handleAddToCart}
                            className="w-full bg-[#d4a365] text-black font-black py-6 rounded-full uppercase text-xs tracking-[0.2em] hover:bg-[#f0c080] transition-all flex items-center justify-center gap-4 active:scale-[0.98] shadow-lg shadow-[#d4a365]/10"
                        >
                            <ShoppingCart className="w-5 h-5" />
                            Сагсанд нэмэх • ₮{(item.price * qty).toLocaleString()}
                        </button>
                    </div>
                </motion.div>

                <div className="mt-20">
                    <div className="flex items-center justify-between mb-10 px-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-[#d4a365]/10 rounded-2xl">
                                <MessageSquare className="text-[#d4a365] w-6 h-6" />
                            </div>
                            <h2 className="text-3xl font-serif font-bold italic">Оюутнуудын сэтгэгдэл</h2>
                        </div>
                        <span className="text-sm text-gray-500 font-mono">{reviews.length} Сэтгэгдэл</span>
                    </div>

                    {reviews.length === 0 ? (
                        <div className="bg-[#111] p-16 rounded-[3rem] border border-dashed border-white/5 text-center">
                            <p className="text-gray-500 italic text-lg font-light">Одоогоор сэтгэгдэл бичигдээгүй байна.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6">
                            {reviews.map((rev, idx) => (
                                <motion.div
                                    key={rev.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="bg-[#111] p-8 rounded-[2.5rem] border border-white/5 hover:border-[#d4a365]/20 transition-all duration-500 group"
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gradient-to-br from-[#d4a365]/20 to-transparent rounded-2xl flex items-center justify-center border border-[#d4a365]/10 text-[#d4a365] font-bold text-xl">
                                                {rev.studentName.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-bold text-white group-hover:text-[#d4a365] transition-colors">
                                                    {rev.studentName}
                                                </h4>
                                                <p className="text-[10px] text-gray-600 uppercase tracking-widest mt-1">
                                                    {new Date(rev.createdAt).toLocaleDateString('mn-MN', {
                                                        year: 'numeric', month: 'long', day: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-black/40 px-4 py-2 rounded-2xl border border-white/5 shadow-inner">
                                            <Star className="w-3.5 h-3.5 text-[#d4a365] fill-[#d4a365]" />
                                            <span className="text-sm font-bold text-[#d4a365]">{rev.rating}</span>
                                        </div>
                                    </div>
                                    <p className="text-gray-300 text-base italic font-light leading-relaxed pl-2 border-l border-white/5">
                                        "{rev.review}"
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}