"use client";
import { useState } from "react";

export default function PingPage() {
    const [ip, setIp] = useState("");
    const [output, setOutput] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await fetch("/api/admin/ping", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ip })
        });
        const data = await res.json();
        setOutput(data.output || data.error);
    };

    return (
        <div className="p-8">
            <h1>Ping Tool</h1>
            <form onSubmit={handleSubmit}>
                <input value={ip} onChange={e => setIp(e.target.value)} />
                <button type="submit">Ping</button>
            </form>
            <pre>{output}</pre>
        </div>
    );
}