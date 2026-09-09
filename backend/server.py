from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import re
import json
import logging
import uuid
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Any
from datetime import datetime, timezone

from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')
LLM_MODEL = "gpt-5.4"

app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def _extract_json(text: str) -> Any:
    """Pull a JSON object/array out of an LLM response, tolerating code fences."""
    if not text:
        raise ValueError("empty response")
    cleaned = text.strip()
    # strip code fences
    fence = re.search(r"```(?:json)?\s*(.*?)```", cleaned, re.DOTALL)
    if fence:
        cleaned = fence.group(1).strip()
    # find first { or [
    start = min([i for i in [cleaned.find('{'), cleaned.find('[')] if i != -1], default=-1)
    if start == -1:
        raise ValueError(f"no json found in: {text[:200]}")
    # find matching last bracket
    end = max(cleaned.rfind('}'), cleaned.rfind(']'))
    snippet = cleaned[start:end + 1]
    return json.loads(snippet)


async def _ask_llm(system: str, user_text: str, image_b64: Optional[str] = None) -> str:
    if not EMERGENT_LLM_KEY:
        raise HTTPException(status_code=500, detail="EMERGENT_LLM_KEY tidak ditemukan")
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"bahanpas-{uuid.uuid4()}",
        system_message=system,
    ).with_model("openai", LLM_MODEL)
    if image_b64:
        msg = UserMessage(text=user_text, file_contents=[ImageContent(image_base64=image_b64)])
    else:
        msg = UserMessage(text=user_text)
    return await chat.send_message(msg)


# ---------- Models ----------
class VoiceReq(BaseModel):
    transcript: str

class ReceiptReq(BaseModel):
    image_base64: Optional[str] = None
    text: Optional[str] = None

class MarginReq(BaseModel):
    hike_percent: float
    recipes: List[dict] = Field(default_factory=list)

class ReorderReq(BaseModel):
    inventory: List[dict] = Field(default_factory=list)
    sales: List[dict] = Field(default_factory=list)


@api_router.get("/")
async def root():
    return {"message": "BahanPas AI API", "status": "ok"}


@api_router.post("/ai/parse-voice")
async def parse_voice(req: VoiceReq):
    system = (
        "Anda adalah asisten dapur F&B Indonesia yang mengubah ucapan pemilik warung menjadi data stok terstruktur. "
        "Kembalikan HANYA JSON valid tanpa penjelasan. Format: "
        '{"action":"masuk|keluar|waste","item":"nama bahan","quantity":angka,"unit":"kg|g|liter|ml|karton|botol|pcs",'
        '"expiry":"YYYY-MM-DD atau null","supplier":"nama supplier atau null","reason":"alasan bila waste/keluar atau null","confidence":0-1}. '
        "action 'masuk' untuk barang datang, 'keluar' untuk pemakaian, 'waste' untuk tumpah/rusak/kedaluwarsa. "
        "Perkirakan tanggal expiry dari kata seperti '20 Oktober' menggunakan tahun berjalan. Bahasa Indonesia."
    )
    try:
        raw = await _ask_llm(system, f"Kalimat dapur: \"{req.transcript}\"")
        data = _extract_json(raw)
        return data
    except Exception as e:
        logger.error(f"parse-voice error: {e}")
        raise HTTPException(status_code=500, detail=f"Gagal memproses suara: {e}")


@api_router.post("/ai/parse-receipt")
async def parse_receipt(req: ReceiptReq):
    system = (
        "Anda adalah AI OCR nota supplier F&B Indonesia. Ekstrak isi nota menjadi JSON valid saja. Format: "
        '{"supplier":"nama toko","date":"YYYY-MM-DD atau null","items":[{"name":"nama bahan","quantity":angka,'
        '"unit":"kg|g|liter|ml|karton|botol|pcs","price":harga_satuan_angka,"subtotal":angka}],"total":angka}. '
        "Harga dalam Rupiah tanpa titik/koma. Bahasa Indonesia."
    )
    try:
        if req.image_base64:
            raw = await _ask_llm(system, "Baca nota supplier ini dan ekstrak seluruh item.", image_b64=req.image_base64)
        elif req.text:
            raw = await _ask_llm(system, f"Teks nota:\n{req.text}")
        else:
            raise HTTPException(status_code=400, detail="image_base64 atau text wajib diisi")
        data = _extract_json(raw)
        return data
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"parse-receipt error: {e}")
        raise HTTPException(status_code=500, detail=f"Gagal membaca nota: {e}")


@api_router.post("/ai/margin-advice")
async def margin_advice(req: MarginReq):
    system = (
        "Anda konsultan HPP & margin untuk UMKM kuliner Indonesia. Beri saran singkat, konkret, actionable "
        "saat harga bahan baku naik. Kembalikan HANYA JSON: "
        '{"headline":"ringkasan 1 kalimat","recommendations":["saran 1","saran 2","saran 3"],'
        '"tone":"aman|waspada|bahaya"}. '
        "Saran harus spesifik seperti mengubah takaran gram bahan, menaikkan harga jual Rupiah tertentu, atau ganti supplier. Bahasa Indonesia."
    )
    user = (
        f"Kenaikan harga bahan baku: +{req.hike_percent}%. "
        f"Data menu & HPP: {json.dumps(req.recipes, ensure_ascii=False)}"
    )
    try:
        raw = await _ask_llm(system, user)
        return _extract_json(raw)
    except Exception as e:
        logger.error(f"margin-advice error: {e}")
        raise HTTPException(status_code=500, detail=f"Gagal membuat saran: {e}")


@api_router.post("/ai/reorder")
async def reorder(req: ReorderReq):
    system = (
        "Anda AI perencana pembelian bahan baku untuk warung F&B Indonesia. Analisis stok & penjualan lalu buat "
        "rekomendasi reorder. Kembalikan HANYA JSON: "
        '{"insights":["insight 1","insight 2"],"orders":[{"item":"nama","quantity":angka,"unit":"kg|liter|karton|botol|pcs",'
        '"reason":"alasan singkat","urgency":"tinggi|sedang|rendah"}]}. Bahasa Indonesia.'
    )
    user = (
        f"Inventaris saat ini: {json.dumps(req.inventory, ensure_ascii=False)}\n"
        f"Penjualan terakhir: {json.dumps(req.sales, ensure_ascii=False)}"
    )
    try:
        raw = await _ask_llm(system, user)
        return _extract_json(raw)
    except Exception as e:
        logger.error(f"reorder error: {e}")
        raise HTTPException(status_code=500, detail=f"Gagal analisis reorder: {e}")


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
