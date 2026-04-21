"use client";

import { useState, useRef, ComponentPropsWithoutRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type AuthMode = "login" | "signup";
type AuthStep = "email" | "verify";

// ── Skeleton ─────────────────────────────────────────────────

function AuthPageSkeleton() {
    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#080808] relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-orange-600/10 blur-[130px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-amber-600/5 blur-[130px] rounded-full" />
            </div>

            <div className="relative z-10 w-full max-w-[420px]">
                {/* Logo + Title */}
                <div className="text-center mb-10 flex flex-col items-center gap-4">
                    <div className="w-20 h-20 rounded-3xl bg-white/[0.06] animate-pulse" />
                    <div className="h-10 w-52 rounded-2xl bg-white/[0.06] animate-pulse" />
                    <div className="h-2.5 w-32 rounded-full bg-white/[0.04] animate-pulse" />
                </div>

                {/* Card */}
                <div className="bg-[#111111]/80 border border-white/10 rounded-[40px] p-8 sm:p-10">
                    {/* Tabs */}
                    <div className="p-1.5 bg-black/40 rounded-2xl mb-8 border border-white/5">
                        <div className="flex gap-2">
                            <div className="flex-1 h-11 rounded-xl bg-white/[0.07] animate-pulse" />
                            <div className="flex-1 h-11 rounded-xl bg-white/[0.03] animate-pulse" />
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Email */}
                        <div className="space-y-2">
                            <div className="h-2.5 w-20 rounded-full bg-white/[0.05] animate-pulse ml-1.5" />
                            <div className="h-14 w-full rounded-2xl bg-white/[0.05] animate-pulse" />
                        </div>

                        {/* PIN */}
                        <div className="space-y-2">
                            <div className="h-2.5 w-16 rounded-full bg-white/[0.05] animate-pulse ml-1.5" />
                            <div className="grid grid-cols-4 gap-3">
                                {[0, 1, 2, 3].map((i) => (
                                    <div
                                        key={i}
                                        className="h-14 rounded-2xl bg-white/[0.05] animate-pulse"
                                        style={{ animationDelay: `${i * 80}ms` }}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Button */}
                        <div className="h-14 w-full rounded-2xl bg-white/[0.05] animate-pulse" />
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────

export default function AuthPage() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [mode, setMode] = useState<AuthMode>("login");
    const [step, setStep] = useState<AuthStep>("email");
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [pin, setPin] = useState("");
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <AuthPageSkeleton />;

    const handleAction = async (type: "send" | "signup" | "login") => {
        setLoading(true);
        try {
            const endpoint =
                type === "login"
                    ? "/api/login"
                    : type === "send"
                        ? "/api/otp/send"
                        : "/api/otp/verify";

            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, name, pin, code: otp }),
            });

            const data = await res.json() as {
                success: boolean;
                message?: string;
                name?: string;
                email?: string;
            };

            if (data.success) {
                if (type === "send") {
                    setStep("verify");
                    toast.success("Код илгээгдлээ.");
                } else {
                    toast.success("Амжилттай!");
                    const userData = {
                        email: data.email || email,
                        name: data.name || name,
                    };
                    localStorage.setItem("canteen_user", JSON.stringify(userData));
                    router.push("/smart-canteen");
                    router.refresh();
                }
            } else {
                toast.error(data.message || "Алдаа гарлаа.");
            }
        } catch {
            toast.error("Сервертэй холбогдоход алдаа гарлаа.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = () => {
        if (mode === "login") handleAction("login");
        else if (step === "email") handleAction("send");
        else handleAction("signup");
    };

    const isDisabled = !email || pin.length !== 4;

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#080808] relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-orange-600/10 blur-[130px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-amber-600/5 blur-[130px] rounded-full" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="relative z-10 w-full max-w-[420px]"
            >
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-orange-500 to-amber-600 mb-5 shadow-2xl shadow-orange-500/20 text-4xl">
                        🍱
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tighter italic">
                        Smart Canteen
                    </h1>
                    <p className="text-[10px] mt-2 tracking-[0.4em] uppercase font-bold text-gray-500">
                        Premium Ordering
                    </p>
                </div>

                {/* Card */}
                <div className="bg-[#111111]/80 backdrop-blur-3xl border border-white/10 rounded-[40px] p-8 sm:p-10 shadow-2xl">
                    {/* Mode tabs */}
                    <div className="flex p-1.5 bg-black/40 rounded-2xl mb-8 border border-white/5">
                        {(["login", "signup"] as AuthMode[]).map((m) => (
                            <button
                                key={m}
                                onClick={() => {
                                    setMode(m);
                                    setStep("email");
                                    setPin("");
                                    setOtp("");
                                    setName("");
                                }}
                                className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all cursor-pointer ${mode === m
                                        ? "bg-orange-600 text-white shadow-lg"
                                        : "text-gray-500 hover:text-gray-300"
                                    }`}
                            >
                                {m === "login" ? "Нэвтрэх" : "Бүртгүүлэх"}
                            </button>
                        ))}
                    </div>

                    <div className="space-y-6">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={mode + step}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-5"
                            >
                                {/* Name — signup only */}
                                {mode === "signup" && step === "email" && (
                                    <Field label="Таны нэр">
                                        <Input
                                            icon="👤"
                                            placeholder="Нэрээ оруулна уу"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                        />
                                    </Field>
                                )}

                                {/* Email */}
                                <Field label="Имэйл хаяг">
                                    <Input
                                        icon="📧"
                                        type="email"
                                        placeholder="email@address.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </Field>

                                {/* PIN */}
                                <Field label={mode === "login" ? "ПИН код" : "ПИН үүсгэх"}>
                                    <PinInput value={pin} onChange={setPin} />
                                </Field>

                                {/* OTP — signup verify step */}
                                {step === "verify" && (
                                    <Field label="Баталгаажуулах код">
                                        <Input
                                            icon="🔑"
                                            placeholder="000000"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            maxLength={6}
                                            className="text-center tracking-widest font-mono"
                                        />
                                    </Field>
                                )}
                            </motion.div>
                        </AnimatePresence>

                        <PrimaryBtn
                            onClick={handleSubmit}
                            loading={loading}
                            disabled={isDisabled}
                        >
                            {mode === "login"
                                ? "Нэвтрэх"
                                : step === "email"
                                    ? "Үргэлжлүүлэх"
                                    : "Бүртгэл дуусгах"}
                        </PrimaryBtn>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

// ── Sub-components ────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-600 ml-1.5">
                {label}
            </label>
            {children}
        </div>
    );
}

function Input({
    icon,
    className,
    ...props
}: ComponentPropsWithoutRef<"input"> & { icon: string }) {
    return (
        <div className="relative group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm opacity-40 group-focus-within:opacity-100 transition-opacity">
                {icon}
            </span>
            <input
                {...props}
                className={`w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-11 pr-4 text-sm outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all placeholder:text-gray-700 text-white ${className || ""}`}
            />
        </div>
    );
}

function PinInput({
    value,
    onChange,
}: {
    value: string;
    onChange: (v: string) => void;
}) {
    const inputs = useRef<(HTMLInputElement | null)[]>([]);

    const handleChange = (val: string, i: number) => {
        const newVal = val.replace(/\D/g, "").slice(-1);
        const pinArray = value.split("");
        while (pinArray.length < 4) pinArray.push("");
        pinArray[i] = newVal;
        onChange(pinArray.join("").slice(0, 4));
        if (newVal && i < 3) inputs.current[i + 1]?.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent, i: number) => {
        if (e.key === "Backspace" && !value[i] && i > 0)
            inputs.current[i - 1]?.focus();
    };

    return (
        <div className="grid grid-cols-4 gap-3 w-full">
            {[0, 1, 2, 3].map((i) => (
                <input
                    key={i}
                    ref={(el) => { inputs.current[i] = el; }}
                    type="password"
                    inputMode="numeric"
                    maxLength={1}
                    value={value[i] || ""}
                    onChange={(e) => handleChange(e.target.value, i)}
                    onKeyDown={(e) => handleKeyDown(e, i)}
                    className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl text-center text-xl font-bold outline-none focus:border-orange-500 focus:bg-white/10 transition-all text-white cursor-pointer"
                />
            ))}
        </div>
    );
}

function PrimaryBtn({
    children,
    loading,
    disabled,
    onClick,
}: {
    children: React.ReactNode;
    loading: boolean;
    disabled: boolean;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            disabled={disabled || loading}
            className={`w-full py-4 rounded-2xl font-black text-sm transition-all duration-300 flex items-center justify-center gap-3 shadow-xl cursor-pointer ${disabled || loading
                    ? "bg-gray-800/50 text-gray-600 cursor-not-allowed"
                    : "bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:scale-[1.02] active:scale-[0.98] shadow-orange-500/20"
                }`}
        >
            {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
                children
            )}
        </button>
    );
}