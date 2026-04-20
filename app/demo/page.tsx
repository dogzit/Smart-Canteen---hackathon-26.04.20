"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronRight,
    ChevronLeft,
    Star,
    TrendingUp,
    Users,
    ShoppingBag,
    Layout,
    ShieldCheck,
    Smartphone,
    Cpu
} from 'lucide-react';

const Presentation = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        {
            title: "School Hub",
            subtitle: "The Future of Campus Dining",
            content: "AI-д суурилсан, ухаалаг захиалгын систем",
            icon: <Cpu className="w-16 h-16 text-[#d4a365]" />,
            type: "hero"
        },
        {
            title: "Асуудал ба Шийдэл",
            subtitle: "Яагаад биднийг сонгох вэ?",
            items: [
                { label: "Урт дараалал", desc: "Захиалга өгөх гэж цаг алдах, хүлээгдэл үүсэх" },
                { label: "Тодорхойгүй үнэлгээ", desc: "Хоол ямар байхыг, бусад оюутнууд юу гэж бодож байгааг мэдэхгүй байх" },
                { label: "Дата дутагдал", desc: "Цайны газар эрэлтээ зөв тооцоолж чадахгүй байх" }
            ],
            icon: <Layout className="w-12 h-12 text-[#d4a365]" />,
            type: "split"
        },
        {
            title: "Ухаалаг Сэтгэгдэл",
            subtitle: "Review & Sentiment Analysis",
            content: "Оюутнууд өөрсдийн бодит сэтгэгдлийг үлдээж, датабэйстэй шууд холбогдоно. Хоол бүр өөрийн гэсэн ID-тайгаар үнэлэгдэж, дата анализ хийгдэнэ.",
            stat: "4.8/5.0",
            statLabel: "Оюутнуудын сэтгэл ханамж",
            icon: <Star className="w-12 h-12 text-[#d4a365]" />,
            type: "stat"
        },
        {
            title: "Технологийн Давуу Тал",
            subtitle: "Modern Tech Stack",
            content: "Next.js 14, Prisma, PostgreSQL, Framer Motion. Хамгийн сүүлийн үеийн технологиор бүтээгдсэн хамгийн хурдан систем.",
            features: ["Real-time Analytics", "Secure Authentication", "Responsive UI"],
            icon: <ShieldCheck className="w-12 h-12 text-[#d4a365]" />,
            type: "features"
        },
        {
            title: "Демо эхлүүлэх",
            subtitle: "Live System Performance",
            content: "Захиалгын түүх харах, үнэлгээ өгөх, цэс удирдах бодит туршлага.",
            icon: <Smartphone className="w-12 h-12 text-[#d4a365]" />,
            type: "final"
        }
    ];

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowRight') nextSlide();
            if (e.key === 'ArrowLeft') prevSlide();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleLaunchDemo = () => {
        if (typeof window !== 'undefined') {
            localStorage.clear();
            window.location.href = '/auth';
        }
    };

    const slide = slides[currentSlide];

    return (
        <div className="min-h-screen bg-[#080808] text-white overflow-hidden font-sans flex flex-col">
            {/* Progress Bar */}
            <div className="h-1 bg-white/5 w-full fixed top-0 z-50">
                <motion.div
                    className="h-full bg-[#d4a365]"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
                />
            </div>

            <main className="flex-1 flex items-center justify-center p-8 relative">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.5 }}
                        className="max-w-5xl w-full"
                    >
                        {slide.type === "hero" && (
                            <div className="text-center">
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="mb-8 flex justify-center"
                                >
                                    {slide.icon}
                                </motion.div>
                                <h1 className="text-8xl font-serif font-bold italic mb-6 tracking-tight">
                                    {slide.title}
                                </h1>
                                <p className="text-[#d4a365] text-xl uppercase tracking-[0.6em] font-black">
                                    {slide.subtitle}
                                </p>
                                <p className="mt-12 text-gray-500 text-lg max-w-lg mx-auto">
                                    {slide.content}
                                </p>
                            </div>
                        )}

                        {slide.type === "split" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                                <div>
                                    <p className="text-[#d4a365] text-sm uppercase tracking-widest font-black mb-4">{slide.subtitle}</p>
                                    <h2 className="text-6xl font-bold font-serif mb-8">{slide.title}</h2>
                                    {slide.icon}
                                </div>
                                <div className="space-y-8">
                                    {slide.items.map((item, idx) => (
                                        <div key={idx} className="bg-white/5 p-6 rounded-[2rem] border border-white/10 shadow-xl">
                                            <h4 className="text-[#d4a365] font-bold text-lg mb-1">{item.label}</h4>
                                            <p className="text-gray-400">{item.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {slide.type === "stat" && (
                            <div className="text-center">
                                <h2 className="text-5xl font-bold mb-4 italic font-serif">{slide.title}</h2>
                                <p className="text-gray-400 mb-12 max-w-2xl mx-auto">{slide.content}</p>
                                <div className="bg-[#111] p-16 rounded-[4rem] border border-[#d4a365]/20 inline-block">
                                    <div className="text-8xl font-black text-[#d4a365] mb-2">{slide.stat}</div>
                                    <div className="text-xs uppercase tracking-widest font-black text-gray-500">{slide.statLabel}</div>
                                </div>
                            </div>
                        )}

                        {slide.type === "features" && (
                            <div className="flex flex-col items-center">
                                <h2 className="text-5xl font-bold mb-12 italic font-serif">{slide.title}</h2>
                                <div className="flex gap-6 flex-wrap justify-center">
                                    {slide.features.map((f, i) => (
                                        <div key={i} className="px-8 py-4 bg-white/5 border border-white/10 rounded-full text-[#d4a365] font-bold">
                                            {f}
                                        </div>
                                    ))}
                                </div>
                                <p className="mt-12 text-gray-400 text-center max-w-lg">{slide.content}</p>
                            </div>
                        )}

                        {slide.type === "final" && (
                            <div className="text-center">
                                <div className="inline-block p-1 bg-[#d4a365] rounded-full mb-8 animate-bounce">
                                    <div className="bg-[#080808] rounded-full p-6">
                                        {slide.icon}
                                    </div>
                                </div>
                                <h2 className="text-7xl font-bold mb-6 italic font-serif tracking-tighter">Бэлэн үү?</h2>
                                <button
                                    onClick={handleLaunchDemo}
                                    className="bg-[#d4a365] text-black font-black py-6 px-16 rounded-full uppercase text-sm tracking-widest hover:bg-[#f0c080] transition-all shadow-[0_0_20px_rgba(212,163,101,0.3)] hover:scale-105 active:scale-95"
                                >
                                    Демо эхлүүлэх
                                </button>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Navigation */}
            <footer className="p-12 flex justify-between items-center">
                <div className="text-[10px] uppercase tracking-widest font-black text-gray-600">
                    Слайд {currentSlide + 1} / {slides.length}
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={prevSlide}
                        className="p-4 bg-white/5 rounded-full hover:bg-[#d4a365] hover:text-black transition-all border border-white/5"
                    >
                        <ChevronLeft />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="p-4 bg-white/5 rounded-full hover:bg-[#d4a365] hover:text-black transition-all border border-white/5"
                    >
                        <ChevronRight />
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default Presentation;