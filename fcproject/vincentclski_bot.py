import logging
import hashlib
import asyncio
import httpx
import uvicorn
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from telegram import Update
from telegram.ext import Application, CommandHandler, ContextTypes

# ==========================================
# 1. KONFIGURASI CREDENTIALS
# ==========================================
TELEGRAM_BOT_TOKEN = "8933082946:AAHj4iAd1nY6d5oE9cQZA_MYV44LF1d7pNo"

VIP_API_ID = "JZOGWXL2"
VIP_API_KEY = "ofGH4yB2Fmc1BG9LFfx6lMyI28mjk3jrpD4NXVKM8YvgIQ2xFVl1xQ3BZwEehwYj"
ENDPOINT_VIPAYMENT = "https://vip-reseller.co.id/api/game-feature"

logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)

# ==========================================
# 2. CORE LOGIC (Fungsi Murni Cek Nickname)
# ==========================================
async def fetch_vip_nickname(game_code: str, user_id: str, zone_id: str = ""):
    """Fungsi murni buat nembak VIPayment. Dipakai bareng oleh Bot Tele & Next.js"""
    sign_raw = f"{VIP_API_ID}{VIP_API_KEY}"
    sign = hashlib.md5(sign_raw.encode('utf-8')).hexdigest()

    payload = {
        'key': VIP_API_KEY,
        'sign': sign,
        'type': 'get-nickname',
        'code': game_code,
        'target': user_id,
        'additional_target': zone_id
    }

    try:
        # Gunakan httpx (async HTTP) pengganti requests biasa
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(ENDPOINT_VIPAYMENT, data=payload)
            res_data = response.json()

        if res_data.get('result') is True or res_data.get('status') is True:
            data_val = res_data.get('data')
            if isinstance(data_val, dict):
                nickname = data_val.get('name') or data_val.get('nickname') or str(data_val)
            else:
                nickname = data_val or "Ditemukan"
            
            return {"success": True, "nickname": nickname, "message": "Success"}
        else:
            error_msg = res_data.get('message', 'ID atau Kode Game tidak valid.')
            return {"success": False, "nickname": None, "message": error_msg}

    except Exception as e:
        return {"success": False, "nickname": None, "message": f"Server Error: {str(e)}"}


# ==========================================
# 3. SETUP FASTAPI (Buat Website Next.js)
# ==========================================
api_app = FastAPI(title="LevinStore API Checker")

# Izinkan CORS biar Next.js bisa akses tanpa diblokir browser
api_app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_methods=["*"],
    allow_headers=["*"],
)

@api_app.get("/api/check")
async def web_check_nickname(
    game: str = Query(..., description="Kode Game, e.g. mobile-legends"),
    user_id: str = Query(..., description="User ID"),
    zone_id: str = Query("", description="Zone/Server ID")
):
    """Endpoint yang bakal dipanggil sama Next.js levinnstore.id"""
    result = await fetch_vip_nickname(game, user_id, zone_id)
    return result


# ==========================================
# 4. HANDLER TELEGRAM BOT
# ==========================================
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    welcome_text = (
        "👋 **Bot Cek Nickname Game VIPayment**\n\n"
        "Gunakan perintah berikut:\n"
        "`/check <kode_game> <user_id> <zone_id>`\n\n"
        "📌 **Contoh:**\n"
        "• MLBB: `/check mobile-legends 252177524 9327`\n"
        "• Free Fire: `/check free-fire 12345678`"
    )
    await update.message.reply_text(welcome_text, parse_mode="Markdown")

async def check_nickname(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not context.args or len(context.args) < 2:
        await update.message.reply_text(
            "❌ **Format Salah!**\nFormat: `/check <kode_game> <user_id> <zone_id>`",
            parse_mode="Markdown"
        )
        return

    game_code = context.args[0]
    user_id = context.args[1]
    zone_id = context.args[2] if len(context.args) > 2 else ""

    status_msg = await update.message.reply_text("⏳ *Sedang mengecek ke VIPayment...*", parse_mode="Markdown")

    # Manggil fungsi murni
    res = await fetch_vip_nickname(game_code, user_id, zone_id)

    if res["success"]:
        result_text = (
            "✅ **DATA PLAYER DITEMUKAN**\n\n"
            f"🎮 **Game:** `{game_code}`\n"
            f"🆔 **User ID:** `{user_id}` {f'({zone_id})' if zone_id else ''}\n"
            f"👤 **Nickname:** `{res['nickname']}`"
        )
    else:
        result_text = f"❌ **Gagal Mengecek ID:**\n{res['message']}"

    await status_msg.edit_text(result_text, parse_mode="Markdown")


# ==========================================
# 5. RUNNER PARALEL (Jalanin FastAPI & Bot)
# ==========================================
async def main():
    # Setup Telegram Bot
    tele_app = Application.builder().token(TELEGRAM_BOT_TOKEN).build()
    tele_app.add_handler(CommandHandler("start", start))
    tele_app.add_handler(CommandHandler("check", check_nickname))

    await tele_app.initialize()
    await tele_app.start()
    await tele_app.updater.start_polling()

    print("✅ Bot Telegram Aktif!")
    print("🚀 FastAPI Server Aktif di http://localhost:8000")

    # Setup Uvicorn FastAPI Server
    config = uvicorn.Config(api_app, host="0.0.0.0", port=8000, log_level="info")
    server = uvicorn.Server(config)
    
    await server.serve()

if __name__ == '__main__':
    asyncio.run(main())