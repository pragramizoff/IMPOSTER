# 🎭 Imposter O'yini — Telegram Web App

Stol o'yini. 3–10 nafar o'yinchi, bitta telefon, bitta imposter.

## O'yin qoidalari
- 3–10 kishi bitta telefonda o'ynaydi
- Har bir oyinchiga karta beriladi
- Oddiy oyinchilarda **bitta umumiy so'z** bo'ladi (masalan: "non")
- **Imposterda** "IMPOSTER" yozilgan karta bo'ladi
- Telefon navbat bilan aylanadi, har kim faqat o'z kartasini ko'radi
- Hamma karta ko'rib bo'lgach, o'yin boshlanadi
- Oyinchilar so'zni tasvirlab beradilar (to'g'ridan-to'g'ri aytmasdan)
- Imposter kimligini topib, ovoz beriladi

## Texnik stack
- **Frontend:** HTML + CSS + Vanilla JS
- **Backend:** PHP 8.2 (built-in server)
- **Database:** SQLite
- **Hosting:** Railway
- **Platform:** Telegram Web App

## Local ishlatish
```bash
php -S localhost:8080 router.php
# http://localhost:8080 da oching
```

## Railway Deploy

1. GitHub-ga push qiling:
```bash
git init
git add .
git commit -m "Imposter game"
git remote add origin https://github.com/USERNAME/imposter-game.git
git push -u origin main
```

2. [Railway.app](https://railway.app) ga kiring
3. **New Project → Deploy from GitHub Repo** tanlang
4. Reponi tanlang — avtomatik deploy bo'ladi
5. **Settings → Networking → Generate Domain** bosing
6. URL oling: `https://your-app.up.railway.app`

## Telegram Bot sozlash

1. [@BotFather](https://t.me/BotFather) ga yozing
2. `/newbot` — yangi bot yarating
3. `/setmenubutton` — Web App tugmasi qo'shing:
   - Bot tanlang
   - URL: `https://your-app.up.railway.app`
   - Tugma nomi: `🎭 Imposter O'yini`
4. Yoki: `/newapp` → Web App yarating

## So'zlar boshqaruvi
- Menuda **⚙️ So'zlarni Boshqarish** tugmasi orqali
- So'z qo'shish, o'chirish, faol/nofaol qilish
- 100+ so'z 8 ta kategoriyada tayyor
- Kategoriyalar: taom, joy, hayvon, buyum, sport, kasb, tabiat, umumiy

## Fayl tuzilmasi
```
imposter-game/
├── index.html          # Asosiy sahifa
├── api.php             # REST API
├── db.php              # Database + so'zlar
├── router.php          # PHP built-in server uchun router
├── nixpacks.toml       # Railway config
├── composer.json       # PHP meta
├── assets/
│   ├── style.css       # Barcha stillar
│   └── game.js         # O'yin logikasi
└── data/
    └── game.db         # SQLite (avtomatik yaratiladi)
```
