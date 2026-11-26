# Telegram bilan ulanishni tekshiradi. Token ekranga chiqarilmaydi.
import json
import urllib.error

import server


def check():
    if not server.TOKEN:
        print("TOKEN bo'sh.")
        return
    try:
        bot = server.telegram("getMe")["result"]
        print("1) Token to'g'ri. Bot: @" + bot["username"])
        if not server.CHAT_ID:
            print("CHAT_ID bo'sh.")
            return
        server.telegram("sendMessage", {"chat_id": server.CHAT_ID, "text": "Sinov xabari"})
        print("2) Xabar yuborildi. Telegramni tekshiring.")
    except urllib.error.HTTPError as error:
        print("Telegram rad etdi:", error.code, json.load(error).get("description"))
    except OSError as error:
        print("Telegramga ulanib bo'lmadi (internet, VPN yoki antivirus):", error)


check()
