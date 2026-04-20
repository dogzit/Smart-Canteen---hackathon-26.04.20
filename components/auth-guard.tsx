"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();

    // 1. Mounted төлөвийг шалгах
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // 2. Navigation логикийг тусдаа Effect-д салгах
    useEffect(() => {
        if (!isMounted) return;

        const user = localStorage.getItem("canteen_user");
        const isAuthPage = pathname === "/auth";

        if (!user && !isAuthPage) {
            router.replace("/auth");
        } else if (user && isAuthPage) {
            router.replace("/smart-canteen");
        }
    }, [isMounted, pathname, router]);

    // Server-side rendering үед юу ч харуулахгүй
    if (!isMounted) {
        return null;
    }

    // Client-side тооцоолол
    const user = typeof window !== "undefined" ? localStorage.getItem("canteen_user") : null;
    const isAuthPage = pathname === "/auth";

    // Зөвшөөрөгдөөгүй төлөвт Loading харуулна
    if ((!user && !isAuthPage) || (user && isAuthPage)) {
        return (
            <div className="min-h-screen bg-[#080808] flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
            </div>
        );
    }

    return <>{children}</>;
}