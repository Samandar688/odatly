# Odatly

Odatly endi React Native + Expo loyihasi sifatida yuritiladi. Eski Vite/Capacitor mockup va web prototip fayllari olib tashlangan.

Asosiy app kodi:

```text
native/
```

## Ishga Tushirish

```powershell
cd native
npm install
npm run start
```

Development build telefonga o'rnatilgan bo'lsa, Metro server orqali JS o'zgarishlari darhol ko'rinadi.

## Android Build

Development build:

```powershell
cd native
npm run eas:dev:android
```

Expo dev menu tugmasisiz preview APK:

```powershell
cd native
npm run eas:preview:android
```

## Tekshiruv

```powershell
cd native
npm run typecheck
npx expo export --platform android
```

## Hozirgi Holat

- Kirish ism orqali ishlaydi.
- Data hozircha telefonda lokal saqlanadi.
- Habit qo'shish, tahrirlash, pauza qilish va o'chirish bor.
- Check-in: status, daqiqa, kayfiyat va izoh saqlaydi.
- Today, Habits, Calendar, Stats, Profile va Habit detail ekranlari React Native ichida ishlaydi.
