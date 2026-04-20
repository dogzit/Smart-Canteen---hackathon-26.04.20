"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";

export default function AddMenuPage() {
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [focused, setFocused] = useState<string | null>(null);
    const [image, setImage] = useState<string | null>(null);

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                alert("Зургийн хэмжээ хэт том байна (Max 2MB)");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(event.currentTarget);
        const name = formData.get("name") as string;
        const price = formData.get("price") as string;
        const description = formData.get("description") as string;

        try {
            const res = await fetch("/api/menu", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    price: Number(price),
                    description,
                    image,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Алдаа гарлаа");
            }

            setImage(null);
            (event.target as HTMLFormElement).reset();
            router.refresh();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Тодорхойгүй алдаа");
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500&display=swap');
                
                * { box-sizing: border-box; margin: 0; padding: 0; }
                .page { 
                    min-height: 100vh; 
                    background: #0a0a0a; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    padding: 2rem 1rem; 
                    font-family: 'DM Sans', sans-serif;
                }

                .card { 
                    width: 100%; 
                    max-width: 420px; 
                    background: #111; 
                    border: 1px solid rgba(212,163,101,0.1); 
                    border-radius: 12px; 
                    padding: 3rem 2rem; 
                    box-shadow: 0 20px 40px rgba(0,0,0,0.4);
                }

                .title-group { text-align: center; margin-bottom: 2.5rem; }
                .badge { 
                    font-size: 10px; 
                    text-transform: uppercase; 
                    letter-spacing: 3px; 
                    color: #d4a365; 
                    margin-bottom: 0.5rem; 
                    display: block;
                }
                .title { 
                    font-family: 'Playfair Display', serif; 
                    font-size: 2rem; 
                    color: #fff; 
                }

                /* Image Upload Area */
                .image-section { margin-bottom: 2rem; }
                .image-preview {
                    width: 100%;
                    height: 140px;
                    background: #181818;
                    border: 1px dashed rgba(212,163,101,0.2);
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                .image-preview:hover { border-color: #d4a365; background: #1c1c1c; }
                .image-preview img { width: 100%; height: 100%; object-fit: cover; }
                .image-placeholder { color: #555; font-size: 13px; text-align: center; }

                /* Stylish Input Groups */
                .field { position: relative; margin-bottom: 2rem; }
                .field label {
                    position: absolute;
                    left: 0;
                    top: 10px;
                    color: #555;
                    font-size: 14px;
                    transition: all 0.3s ease;
                    pointer-events: none;
                }
                .field.focused label, .field.has-value label {
                    top: -12px;
                    font-size: 11px;
                    color: #d4a365;
                    letter-spacing: 1px;
                }

                input, textarea {
                    width: 100%;
                    background: transparent;
                    border: none;
                    border-bottom: 1px solid #222;
                    color: #fff;
                    padding: 10px 0;
                    font-size: 15px;
                    outline: none;
                    transition: all 0.3s ease;
                }
                input:focus, textarea:focus { border-bottom-color: #d4a365; }

                /* Input bottom line animation */
                .line {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 0;
                    height: 1px;
                    background: #d4a365;
                    transition: width 0.4s ease;
                }
                .field.focused .line { width: 100%; }

                .btn { 
                    width: 100%; 
                    padding: 1rem; 
                    background: #d4a365; 
                    color: #000; 
                    font-weight: 600; 
                    text-transform: uppercase; 
                    letter-spacing: 2px; 
                    font-size: 12px;
                    border: none; 
                    border-radius: 4px; 
                    cursor: pointer; 
                    transition: all 0.3s ease;
                    margin-top: 1rem;
                }
                .btn:hover { background: #e5b375; transform: translateY(-2px); }
                .btn:active { transform: translateY(0); }
                .btn:disabled { background: #333; color: #666; cursor: not-allowed; }

                .hidden-input { display: none; }
                .error-box { color: #ff4d4d; font-size: 12px; text-align: center; margin-top: 1rem; }
            `}</style>

            <div className="page">
                <div className="card">
                    <div className="title-group">
                        <span className="badge">New Collection</span>
                        <h1 className="title">Цэс нэмэх</h1>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="image-section">
                            <label className="image-preview">
                                {image ? (
                                    <img src={image} alt="Preview" />
                                ) : (
                                    <div className="image-placeholder">
                                        <p>+ Зураг оруулах</p>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden-input"
                                    onChange={handleImageChange}
                                />
                            </label>
                        </div>

                        <div className={`field ${focused === "name" ? "focused" : ""} ${image ? "has-value" : ""}`}>
                            <label>Хоолны нэр</label>
                            <input
                                name="name"
                                type="text"
                                required
                                autoComplete="off"
                                onFocus={() => setFocused("name")}
                                onBlur={(e) => {
                                    setFocused(null);
                                    if (e.target.value) e.target.parentElement?.classList.add('has-value');
                                    else e.target.parentElement?.classList.remove('has-value');
                                }}
                            />
                            <div className="line" />
                        </div>

                        <div className={`field ${focused === "price" ? "focused" : ""}`}>
                            <label>Үнэ (₮)</label>
                            <input
                                name="price"
                                type="number"
                                required
                                onFocus={() => setFocused("price")}
                                onBlur={(e) => {
                                    setFocused(null);
                                    if (e.target.value) e.target.parentElement?.classList.add('has-value');
                                    else e.target.parentElement?.classList.remove('has-value');
                                }}
                            />
                            <div className="line" />
                        </div>

                        <div className={`field ${focused === "desc" ? "focused" : ""}`}>
                            <label>Тайлбар</label>
                            <textarea
                                name="description"
                                rows={2}
                                onFocus={() => setFocused("desc")}
                                onBlur={(e) => {
                                    setFocused(null);
                                    if (e.target.value) e.target.parentElement?.classList.add('has-value');
                                    else e.target.parentElement?.classList.remove('has-value');
                                }}
                            />
                            <div className="line" />
                        </div>

                        {error && <div className="error-box">⚠ {error}</div>}

                        <button type="submit" className="btn" disabled={loading}>
                            {loading ? "Түр хүлээнэ үү..." : "Хадгалах"}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}