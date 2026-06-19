# Odatly Native

React Native + Expo varianti. Rootdagi eski Vite/Capacitor mockup olib tashlangan; asosiy ish shu papkada davom etadi.

## Development build

1. Expo hisobga kiring:

   ```powershell
   npx eas-cli@latest login
   ```

2. Android development APK build qiling:

   ```powershell
   npm run eas:dev:android
   ```

3. Expo build sahifasidan APKni telefonga o'rnating.

4. Kodni tez test qilish uchun Metro serverni ishga tushiring:

   ```powershell
   npm run start
   ```

Telefon va kompyuter bir Wi-Fi tarmog'ida bo'lsa, o'rnatilgan development build Metroga ulanadi va JS o'zgarishlari darhol ko'rinadi.

## Hozirgi auth qarori

Kirish hozircha faqat ism bilan ishlaydi. Parol va begona seed ma'lumotlar yo'q. Data telefonda lokal saqlanadi; backend/Supabase keyingi bosqichda ulanadi.
