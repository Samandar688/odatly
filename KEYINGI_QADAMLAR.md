# Odatly Keyingi Qadamlar

Bu hujjat hozirgi holatdan real productionga yaqin appga borish uchun ish tartibi.

## Hozirgi Holat

- App Vite React asosida yozilgan.
- Android APK Capacitor orqali build qilinyapti.
- Local/demo rejim ishlaydi.
- Supabase client, auth flow, database mapperlar va RLS schema tayyor.
- Real baza ishlashi uchun `.env` ichiga Supabase project URL va anon key kiritish kerak.
- Oxirgi debug APK: `Odatly-debug.apk`.

## 1. Supabase Ulash

1. Supabase project yaratiladi.
2. `supabase/schema.sql` fayli Supabase SQL Editor ichida to‘liq run qilinadi.
3. Supabase Auth sozlamalari tekshiriladi:
   - Tez test uchun email confirmation vaqtincha o‘chirilishi mumkin.
   - Productionga yaqin holatda email confirmation yoqilgan bo‘lgani yaxshi.
4. Project Settings → API ichidan quyidagilar olinadi:
   - `Project URL`
   - `anon public key`
5. Root papkada `.env` yaratiladi:

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

6. Web test:

```bash
npm run dev
```

Tekshiriladigan flow:

- Register
- Login
- Habit qo‘shish
- Habit active toggle
- Check-in done/missed
- Statistics yangilanishi
- Calendar’da loglar chiqishi
- Logout

## 2. Android APK Qayta Build

Supabase `.env` to‘ldirilgandan keyin:

```bash
npm run check
npm run cap:sync
npm run android:build
```

APK joylashuvi:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

Rootga qulay nusxa:

```powershell
Copy-Item android\app\build\outputs\apk\debug\app-debug.apk Odatly-debug.apk -Force
```

## 3. EAS Bo‘yicha Qaror

Hozirgi loyiha Expo emas, Vite React + Capacitor.

Shuning uchun hozirgi stack uchun asosiy build yo‘li:

- Android Studio / Gradle
- Capacitor
- `npm run android:build`

EAS orqali build qilish kerak bo‘lsa, ikkita yo‘l bor:

1. Expo/React Native migratsiya qilish.
2. EAS o‘rniga hozirgi Capacitor Android projectni Gradle bilan build qilishda davom etish.

EAS link berilganda avval qaysi yo‘l tanlanishini aniqlaymiz. Agar EAS majburiy bo‘lsa, Expo migratsiya alohida bosqich bo‘ladi.

## 4. Gitga Qo‘shish

Ertangi git ishlari:

```bash
git init
git status
git add .
git commit -m "Initial Odatly mobile MVP"
```

Gitga kirmasligi kerak:

- `.env`
- `node_modules/`
- `dist/`
- `android/local.properties`
- `*.apk`

Bu `.gitignore` ichida allaqachon yozilgan.

Gitga kirishi kerak:

- `src/`
- `android/`
- `supabase/schema.sql`
- `capacitor.config.ts`
- `package.json`
- `package-lock.json`
- `README.md`
- `KEYINGI_QADAMLAR.md`
- `.env.example`

## 5. Productionga Yaqinlashtirish

Keyingi texnik ishlar:

- Release signed APK yoki AAB sozlash.
- App icon va splash screenni Odatly brandingga moslash.
- Local notification qo‘shish.
- Offline sync strategiyasini yakunlash.
- Empty/loading/error statelarni barcha ekranlarda yaxshilash.
- Habit edit screenni real update bilan ulash.
- Soft delete uchun `is_active=false` flowini UI’da aniq qilish.
- Supabase RLS policylarini real user test bilan tekshirish.

## 6. Acceptance Test Checklist

- User ro‘yxatdan o‘ta oladi.
- User login qila oladi.
- User logout qila oladi.
- User yangi habit qo‘sha oladi.
- Habit Supabase `habits` jadvalida ko‘rinadi.
- User habitni active/inactive qila oladi.
- User done check-in saqlay oladi.
- User missed check-in saqlay oladi.
- Bir habit uchun bir kunda duplicate log yaratilmaydi.
- Statistics real loglar asosida o‘zgaradi.
- Calendar real loglar asosida o‘zgaradi.
- Boshqa user ma’lumotlari ko‘rinmaydi.
- Android APK telefonga o‘rnatiladi va ochiladi.
