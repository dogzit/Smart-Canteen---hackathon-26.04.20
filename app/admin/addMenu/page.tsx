"use client";
import { useState, useRef } from "react";
import { toast } from "sonner"; // Sonner ашиглахыг зөвлөж байна

const CATEGORIES = ["Main Course", "Noodles", "Appetizer", "Dessert", "Drinks"];

export default function AddMenuPage() {
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [category, setCategory] = useState("Main Course");
    const formRef = useRef<HTMLFormElement>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);

        const data = {
            name: formData.get("name"),
            price: formData.get("price"),
            description: formData.get("description"),
            category,
            image
        };

        const res = await fetch("/api/menu", {
            method: "POST",
            body: JSON.stringify(data)
        });

        if (res.ok) {
            toast.success("Амжилттай нэмэгдлээ");
            formRef.current?.reset();
            setImage(null);
        } else {
            toast.error("Алдаа гарлаа");
        }
        setLoading(false);
    };

    return (
        <div className="page bg-[#0a0a0a] min-h-screen p-10 flex justify-center items-center font-sans">
            <div className="card bg-[#111] p-8 rounded-3xl border border-white/5 w-full max-w-md shadow-2xl">
                <h1 className="text-white text-2xl font-bold mb-6 text-center">Шинэ хоол нэмэх</h1>
                <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
                    {/* Image Upload */}
                    <label className="block w-full h-40 bg-[#181818] border-2 border-dashed border-white/10 rounded-2xl cursor-pointer overflow-hidden hover:border-[#d4a365]/50 transition-all">
                        {image ? <img src={image} className="w-full h-full object-cover" /> : <div className="h-full flex items-center justify-center text-gray-500">📸 Зураг нэмэх</div>}
                        <input type="file" className="hidden" onChange={(e) => {
                            const reader = new FileReader();
                            reader.onload = () => setImage(reader.result as string);
                            if (e.target.files?.[0]) reader.readAsDataURL(e.target.files[0]);
                        }} />
                    </label>

                    <input name="name" placeholder="Хоолны нэр" required className="w-full bg-[#181818] border border-white/5 p-4 rounded-xl text-white outline-none focus:border-[#d4a365]" />
                    <input name="price" type="number" placeholder="Үнэ" required className="w-full bg-[#181818] border border-white/5 p-4 rounded-xl text-white outline-none focus:border-[#d4a365]" />

                    {/* Category Selector */}
                    <div className="flex gap-2 overflow-x-auto py-2 no-scrollbar">
                        {CATEGORIES.map(cat => (
                            <button key={cat} type="button" onClick={() => setCategory(cat)}
                                className={`px-4 py-2 rounded-full text-[10px] uppercase font-bold whitespace-nowrap transition-all ${category === cat ? 'bg-[#d4a365] text-black' : 'bg-white/5 text-gray-400'}`}>
                                {cat}
                            </button>
                        ))}
                    </div>

                    <textarea name="description" placeholder="Тайлбар" className="w-full bg-[#181818] border border-white/5 p-4 rounded-xl text-white outline-none focus:border-[#d4a365]" />
                    <button type="submit" disabled={loading} className="w-full bg-[#d4a365] py-4 rounded-xl font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all">
                        {loading ? "Хадгалж байна..." : "Цэс нэмэх"}
                    </button>
                </form>
            </div>
        </div>
    );
}