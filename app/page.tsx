import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-[#0a0a0a]">
      <h1 className="text-5xl font-serif font-bold text-white italic">
        School Hub
      </h1>
      <p className="text-[#d4a365] text-[10px] uppercase tracking-[0.4em] mt-4 font-black">
        Premium Ordering System
      </p>

      <Link href="/auth">
        <button className="mt-12 bg-[#d4a365] text-black font-black py-4 px-10 rounded-[2rem] uppercase text-[10px] tracking-widest hover:bg-[#f0c080] transition-all shadow-[0_0_20px_rgba(212,163,101,0.2)]">
          Нэвтрэх
        </button>
      </Link>
    </main>
  );
}