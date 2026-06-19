# Odatly Habit Tracking App

Odatly MVP uchun Vite + React prototip. Figma eksporti asosida boshlanib, hozir local-first habit tracking logikasi bilan ishlaydi.

## Ishga tushirish

```bash
npm install
npm run dev
```

Default lokal URL: `http://127.0.0.1:5173`.

## Tekshiruv

```bash
npm run check
npm run build
npm audit --omit=dev
```

## Android APK

Debug APK build qilish:

```bash
npm run cap:sync
npm run android:build
```

APK chiqadigan joy:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

Qulay nusxa root papkada ham bor:

```text
Odatly-debug.apk
```

## Hozirgi imkoniyatlar

- Habit qo‘shish va faollashtirish/faolsizlantirish.
- Bugungi planned habitlarni chiqarish.
- Check-in: `done` yoki `missed`, duration, note va mood.
- Bir habit uchun bir kunda bitta log: mavjud bo‘lsa yangilanadi.
- Haftalik/oylik/umumiy statistika, duration va streak hisoblash.
- Calendar va habit detail ekranlari real local loglardan ishlaydi.
- `.env` sozlansa Supabase auth/database bilan ishlaydi, aks holda demo/local rejimda ishlaydi.

## Supabase sozlash

1. Supabase project yarating.
2. Supabase SQL Editor ichida [supabase/schema.sql](supabase/schema.sql) faylini to‘liq ishga tushiring.
3. Project Settings → API ichidan `Project URL` va `anon public` key oling.
4. `.env.example` asosida `.env` yarating:

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

5. Web test:

```bash
npm run dev
```

6. Android APK uchun `.env` to‘ldirilgandan keyin:

```bash
npm run cap:sync
npm run android:build
```

Supabase’da email confirmation yoqilgan bo‘lsa, ro‘yxatdan o‘tgandan keyin email tasdiqlash kerak bo‘ladi. Tez MVP test uchun Supabase Auth settings ichida email confirmationni vaqtincha o‘chirib qo‘yish mumkin.

## Keyingi katta bosqich

Local notification va production release signing qo‘shish kerak.
