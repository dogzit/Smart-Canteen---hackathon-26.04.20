"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle2, X } from "lucide-react";

export default function MockQPayModal({
    amount,
    onSuccess,
    onClose
}: {
    amount: number;
    onSuccess: () => void;
    onClose: () => void;
}) {
    const [step, setStep] = useState<"qr" | "loading" | "success">("qr");

    // QR уншуулсны дараах хуурамч хүлээлт
    const handleMockPay = () => {
        setStep("loading");
        setTimeout(() => {
            setStep("success");
            setTimeout(() => {
                onSuccess();
            }, 2000);
        }, 3000);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative w-full max-w-sm bg-[#111] rounded-[3rem] p-10 border border-white/10 text-center shadow-2xl"
            >
                <button onClick={onClose} className="absolute top-8 right-8 text-gray-500 hover:text-white"><X /></button>

                {step === "qr" && (
                    <>
                        <h2 className="text-xl font-bold text-white mb-2">QPay-ээр төлөх</h2>
                        <p className="text-[#d4a365] font-mono text-lg mb-8">₮{amount.toLocaleString()}</p>

                        {/* QR Code Placeholder */}
                        <div
                            onClick={handleMockPay}
                            className="relative cursor-pointer group mx-auto w-48 h-48 bg-white p-3 rounded-3xl mb-8 overflow-hidden"
                        >
                            <img
                                src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://smart-canteen.vercel.app"
                                alt="Mock QR"
                                className="w-full h-full"
                            />
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <p className="text-white text-[10px] font-black uppercase">Уншуулах (Mock)</p>
                            </div>
                        </div>
                        <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest leading-relaxed">
                            QR кодыг банкны апп-аар <br /> уншуулж төлбөрөө баталгаажуулна уу
                        </p>
                    </>
                )}

                {step === "loading" && (
                    <div className="py-20">
                        <Loader2 className="w-12 h-12 text-[#d4a365] animate-spin mx-auto mb-6" />
                        <p className="text-white font-bold">Төлбөрийг шалгаж байна...</p>
                    </div>
                )}

                {step === "success" && (
                    <div className="py-20 text-[#d4a365]">
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                            <CheckCircle2 className="w-16 h-16 mx-auto mb-6" />
                        </motion.div>
                        <p className="text-white font-bold text-xl">Төлбөр амжилттай!</p>
                    </div>
                )}
            </motion.div>
        </div>
    );
}