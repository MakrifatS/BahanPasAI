"""BahanPas AI backend API tests - AI endpoints via Emergent LLM."""
import os
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://kitchen-hpp-tool.preview.emergentagent.com').rstrip('/')
API = f"{BASE_URL}/api"
TIMEOUT = 60


@pytest.fixture(scope="module")
def s():
    sess = requests.Session()
    sess.headers.update({"Content-Type": "application/json"})
    return sess


def test_root(s):
    r = s.get(f"{API}/", timeout=TIMEOUT)
    assert r.status_code == 200
    assert r.json().get("status") == "ok"


# ---- AI: parse-voice ----
def test_parse_voice(s):
    payload = {"transcript": "Masuk 5 kg ayam dari supplier Pak Budi expired 20 Oktober"}
    r = s.post(f"{API}/ai/parse-voice", json=payload, timeout=TIMEOUT)
    assert r.status_code == 200, r.text
    data = r.json()
    for k in ("action", "item", "quantity", "unit"):
        assert k in data, f"missing key {k} in {data}"
    assert data["action"] in ("masuk", "keluar", "waste")
    assert isinstance(data["quantity"], (int, float))


# ---- AI: parse-receipt ----
def test_parse_receipt_text(s):
    text = "Toko Sumber Rejeki\n2025-10-15\nAyam 5 kg 30000 150000\nMinyak 2 liter 18000 36000\nTotal 186000"
    r = s.post(f"{API}/ai/parse-receipt", json={"text": text}, timeout=TIMEOUT)
    assert r.status_code == 200, r.text
    data = r.json()
    assert "items" in data and isinstance(data["items"], list) and len(data["items"]) >= 1
    assert "total" in data


def test_parse_receipt_missing(s):
    r = s.post(f"{API}/ai/parse-receipt", json={}, timeout=TIMEOUT)
    assert r.status_code == 400


# ---- AI: margin-advice ----
def test_margin_advice(s):
    payload = {
        "hike_percent": 20,
        "recipes": [
            {"name": "Nasi Goreng", "hpp": 12000, "price": 20000},
            {"name": "Mie Ayam", "hpp": 9000, "price": 15000},
        ],
    }
    r = s.post(f"{API}/ai/margin-advice", json=payload, timeout=TIMEOUT)
    assert r.status_code == 200, r.text
    data = r.json()
    assert "headline" in data
    assert "recommendations" in data and isinstance(data["recommendations"], list) and len(data["recommendations"]) >= 1
    assert data.get("tone") in ("aman", "waspada", "bahaya")


# ---- AI: reorder ----
def test_reorder(s):
    payload = {
        "inventory": [
            {"item": "Ayam", "stock": 2, "unit": "kg", "min": 5},
            {"item": "Minyak", "stock": 1, "unit": "liter", "min": 3},
        ],
        "sales": [
            {"date": "2025-01-10", "item": "Nasi Goreng", "qty": 20},
            {"date": "2025-01-11", "item": "Mie Ayam", "qty": 15},
        ],
    }
    r = s.post(f"{API}/ai/reorder", json=payload, timeout=TIMEOUT)
    assert r.status_code == 200, r.text
    data = r.json()
    assert "insights" in data and isinstance(data["insights"], list)
    assert "orders" in data and isinstance(data["orders"], list) and len(data["orders"]) >= 1
    o = data["orders"][0]
    assert "item" in o and "quantity" in o and "urgency" in o
