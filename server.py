# Saytni ochadi va formadagi xabarni Telegramga yuboradi.
# Qo'shimcha kutubxona o'rnatish shart emas.
import json
import os
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

FOLDER = Path(__file__).parent


def read_env():
    """.env faylidagi NOM=qiymat qatorlarini o'qiydi."""
    values = {}
    path = FOLDER / ".env"
    if path.is_file():
        for line in path.read_text(encoding="utf-8-sig").splitlines():
            if "=" in line and not line.startswith("#"):
                key, value = line.split("=", 1)
                values[key.strip()] = value.strip().strip("\"'")
    return values


# Internetda (Render) qiymatlar Environment bo'limidan, kompyuterda .env dan olinadi
env = {**read_env(), **os.environ}
TOKEN = env.get("TOKEN", "")
CHAT_ID = env.get("CHAT_ID", "")
# Faqat shu fayllar brauzerga beriladi (.env berilmaydi)
FILES = {
    "/": ("index.html", "text/html; charset=utf-8"),
    "/index.html": ("index.html", "text/html; charset=utf-8"),
    "/style.css": ("style.css", "text/css; charset=utf-8"),
    "/script.js": ("script.js", "text/javascript; charset=utf-8"),
    "/rasmlar/rasm.jpg": ("rasmlar/rasm.jpg", "image/jpeg"),
}


def telegram(method, data=None):
    request = urllib.request.Request(
        f"https://api.telegram.org/bot{TOKEN}/{method}",
        data=json.dumps(data or {}).encode(),
        headers={"Content-Type": "application/json"},
    )
    with urllib.request.urlopen(request, timeout=10) as response:
        return json.load(response)


class Site(BaseHTTPRequestHandler):
    def do_HEAD(self):
        # Render saytni HEAD so'rovi bilan tekshiradi
        self.send_response(200 if self.path.split("?")[0] in FILES else 404)
        self.end_headers()

    def do_GET(self):
        item = FILES.get(self.path.split("?")[0])
        if not item or not (FOLDER / item[0]).is_file():
            self.send_error(404)
            return
        body = (FOLDER / item[0]).read_bytes()
        self.send_response(200)
        self.send_header("Content-Type", item[1])
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        if self.path != "/send" or self.headers.get("Content-Type") != "application/json":
            self.send_error(404)
            return
        try:
            length = int(self.headers.get("Content-Length", 0))
            if not 0 < length <= 10000:
                raise ValueError("Xabar hajmi noto'g'ri")
            data = json.loads(self.rfile.read(length))
            name, contact, message = (str(data[k]).strip() for k in ("name", "contact", "message"))
            if not (name and contact and message):
                raise ValueError("Maydon bo'sh")
            text = f"Saytdan yangi xabar\nIsm: {name}\nAloqa: {contact}\n\n{message}"
            telegram("sendMessage", {"chat_id": CHAT_ID, "text": text[:4000]})
        except Exception as error:
            print("Xato:", error)
            self.send_error(500)
            return
        self.send_response(200)
        self.send_header("Content-Length", "0")
        self.end_headers()


def main():
    if not TOKEN:
        print("Avval .env fayliga TOKEN yozing.")
        return
    if not CHAT_ID:
        updates = telegram("getUpdates")["result"]
        chats = {u["message"]["chat"]["id"] for u in updates if "message" in u}
        if chats:
            print("CHAT_ID:", *chats)
            print("Shu raqamni .env ga yozib, qayta ishga tushiring.")
        else:
            print("Botingizga Telegramda /start yozing va qayta ishga tushiring.")
        return
    port = int(os.environ.get("PORT", 8000))
    host = "0.0.0.0" if "PORT" in os.environ else "127.0.0.1"
    print(f"Sayt tayyor: http://localhost:{port}  (to'xtatish: Ctrl+C)", flush=True)
    ThreadingHTTPServer((host, port), Site).serve_forever()


if __name__ == "__main__":
    main()
