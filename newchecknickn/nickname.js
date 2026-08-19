"use client";

import { useState } from "react";

export default function CekNickname() {
  const [userId, setUserId] = useState("");
  const [zoneId, setZoneId] = useState("");
  const [gameCode, setGameCode] = useState("mobile-legends");
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleCheckId = async () => {
    if (!userId) return alert("Isi User ID dulu!");

    setLoading(true);
    setNickname("");
    setErrorMsg("");

    try {
      // Nembak ke Python FastAPI yang lagi jalan di port 8000
      const res = await fetch(
        `http://localhost:8000/api/check?game=${gameCode}&user_id=${userId}&zone_id=${zoneId}`
      );
      const data = await res.json();

      if (data.success) {
        setNickname(data.nickname);
      } else {
        setErrorMsg(data.message || "ID tidak ditemukan!");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Gagal konek ke server backend Python!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md p-6 bg-slate-900 border border-slate-800 rounded-2xl text-white space-y-4 shadow-xl">
      <h3 className="text-lg font-bold text-yellow-400">🔍 Cek Nickname Game</h3>

      {/* Select Game */}
      <div>
        <label className="text-xs text-gray-400 block mb-1">Pilih Game</label>
        <select
          value={gameCode}
          onChange={(e) => setGameCode(e.target.value)}
          className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:border-yellow-400"
        >
          <option value="mobile-legends">Mobile Legends</option>
          <option value="free-fire">Free Fire</option>
        </select>
      </div>

      {/* Input IDs */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="w-2/3 p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:border-yellow-400"
        />
        {gameCode === "mobile-legends" && (
          <input
            type="text"
            placeholder="Zone ID"
            value={zoneId}
            onChange={(e) => setZoneId(e.target.value)}
            className="w-1/3 p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:border-yellow-400"
          />
        )}
      </div>

      {/* Tombol Check */}
      <button
        onClick={handleCheckId}
        disabled={loading}
        className="w-full py-2.5 bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded-xl transition duration-200"
      >
        {loading ? "Mengecek..." : "Cek Nickname"}
      </button>

      {/* Output Nickname */}
      {nickname && (
        <div className="p-3 bg-green-500/10 border border-green-500/40 rounded-xl text-green-400 text-sm flex justify-between items-center">
          <span>Nickname Player:</span>
          <span className="font-bold text-white text-base">{nickname}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-red-500/10 border border-red-500/40 rounded-xl text-red-400 text-sm text-center">
          {errorMsg}
        </div>
      )}
    </div>
  );
}