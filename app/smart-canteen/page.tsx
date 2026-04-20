"use client";
import { useEffect, useState } from "react";
import { Search, ShoppingCart, Plus, Minus } from "lucide-react";

export default function MenuListPage() {
    const [menus, setMenus] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("All");
    const [search, setSearch] = useState("");
    const [quantities, setQuantities] = useState({});

    const fetchMenus = async (cat: string) => {
        setLoading(true);
        const res = await fetch(`/api/menu?category=${cat}`);
        const data = await res.json();
        setMenus(data);
        setLoading(false);
    };

    useEffect(() => { fetchMenus(activeTab); }, [activeTab]);

    // Хайлтаар шүүх
    const filteredMenus = menus.filter((m: any) => m.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="min-h-screen bg-[#0a0a0a] p-8 text-gray-200">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-10">
                    <h1 className="text-3xl font-serif font-bold text-white">Smart Canteen</h1>
                    <div className="bg-[#111] p-3 rounded-2xl border border-white/5 cursor-pointer hover:border-[#d4a365] transition-all">
                        <ShoppingCart className="text-[#d4a365]" />
                    </div>
                </div>

                {/* Search & Tabs */}
                <div className="space-y-6 mb-12">
                    <div className="relative max-w-xl">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
                        <input onChange={(e) => setSearch(e.target.value)} placeholder="Хоолоо хайх..." className="w-full bg-[#111] p-4 pl-12 rounded-2xl border border-white/5 outline-none focus:border-[#d4a365]/50" />
                    </div>

                    <div className="flex gap-3 overflow-x-auto no-scrollbar">
                        {["All", "Main Course", "Noodles", "Appetizer", "Dessert", "Drinks"].map(cat => (
                            <button key={cat} onClick={() => setActiveTab(cat)}
                                className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === cat ? 'bg-[#d4a365] text-black' : 'bg-[#111] border border-white/5 text-gray-500 hover:border-[#d4a365]'}`}>
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid Area */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {loading ? Array(6).fill(0).map((_, i) => <div key={i} className="h-80 bg-[#111] rounded-[2rem] animate-pulse" />) :
                        filteredMenus.map((item: any) => (
                            <div key={item.id} className="group bg-[#111] rounded-[2rem] overflow-hidden border border-white/5 hover:border-[#d4a365]/30 transition-all duration-500">
                                <div className="h-56 relative overflow-hidden">
                                    <img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" />
                                    <div className="absolute top-4 right-4 bg-orange-600 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase">{item.category}</div>
                                </div>
                                <div className="p-7">
                                    <h3 className="text-white font-bold text-xl mb-2">{item.name}</h3>
                                    <p className="text-gray-500 text-xs mb-6 italic">{item.description}</p>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[#d4a365] font-bold text-xl">₮{item.price.toLocaleString()}</span>
                                        <div className="flex gap-4 bg-white/5 p-2 rounded-xl border border-white/5">
                                            <Minus className="w-4 cursor-pointer hover:text-white" onClick={() => {/* ... */ }} />
                                            <span className="font-bold">0</span>
                                            <Plus className="w-4 cursor-pointer hover:text-white" onClick={() => {/* ... */ }} />
                                        </div>
                                    </div>
                                    <button className="w-full mt-6 bg-[#d4a365] text-black font-bold py-3 rounded-xl hover:bg-[#f0c080] transition-all uppercase text-[10px] tracking-widest">Add to Cart</button>
                                </div>
                            </div>
                        ))
                    }
                </div>
            </div>
        </div>
    );
}