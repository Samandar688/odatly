Sen senior full-stack mobile engineer sifatida ishlaysan. Menda “Odatly” nomli habit-tracker Android app bor. Hozirgi holati maket/prototip: UI chiroyli, lekin real product darajasiga yetkazish kerak.

Maqsad:
Odatly appni real ishlaydigan MVP/productga aylantir. Static/demo/local mock holatlarni olib tashla yoki faqat fallback/demo mode sifatida qoldir. Asosiy data real backend bilan ishlasin, foydalanuvchi ro‘yxatdan o‘tsin, odat qo‘shsin, check-in qilsin, statistikani real data asosida ko‘rsin va eslatmalar real ishlasin.

Hozirgi app haqida:
- App nomi: Odatly
- Android package/appId: uz.odatly.app
- Stack: React + Capacitor
- App ichida hozir onboarding, register/login, home, habits, stats, calendar, profile, add habit, habit detail/check-in ekranlari bor.
- Hozir localStorage orqali `odatly.local.auth.v1` va `odatly.local.mvp.v1` ishlatilmoqda.
- Supabase SDK bundle ichida bor, lekin env ulanmaganligi sababli real backend ishlamayapti.
- Mavjud data modelga yaqin jadvallar: `profiles`, `habits`, `habit_logs`.
- Hozirgi demo habitlar: Badantarbiya, Kitob o‘qish, Ingliz tili, Suv ichish, Meditatsiya, Yugurish.
- UI uslubini saqla: clean, soft green wellness style, Uzbek tilidagi matnlar, chiroyli mobile layout.

Vazifa:
1. Avval loyihani audit qil:
   - Qaysi fayllarda AuthProvider, HabitProvider/store, routing/screen state, UI components borligini aniqlagin.
   - Qaysi joylarda demo data, hardcoded seed data, localStorage-only logic borligini topgin.
   - Supabase client qayerda yaratilganini topib, uni `.env` orqali to‘g‘ri ulangin.

2. Supabase backendni real holatga keltir:
   - `.env.example` yarat:
     - VITE_SUPABASE_URL=
     - VITE_SUPABASE_ANON_KEY=
   - Supabase client faqat env mavjud bo‘lsa ishlasin.
   - Env yo‘q bo‘lsa app buzilmasin, lekin foydalanuvchiga “Demo mode” deb aniq ko‘rsatsin.
   - Production uchun asosiy rejim Supabase bo‘lsin.

3. Database migration yarat:
   - `profiles`
     - id uuid primary key references auth.users(id) on delete cascade
     - full_name text
     - email text
     - avatar_url text nullable
     - language text default 'uz'
     - timezone text default 'Asia/Tashkent'
     - created_at timestamptz default now()
     - updated_at timestamptz default now()
   - `habits`
     - id uuid primary key default gen_random_uuid()
     - user_id uuid references auth.users(id) on delete cascade
     - name text not null
     - description text default ''
     - icon text default '🌱'
     - target text default ''
     - category text default ''
     - color text default '#3CB878'
     - reminder_time text nullable, format HH:mm
     - days_of_week text[] not null default '{}'
     - is_active boolean default true
     - sort_order int default 0
     - created_at timestamptz default now()
     - updated_at timestamptz default now()
   - `habit_logs`
     - id uuid primary key default gen_random_uuid()
     - user_id uuid references auth.users(id) on delete cascade
     - habit_id uuid references habits(id) on delete cascade
     - log_date date not null
     - status text not null check status in ('done','missed','skipped')
     - duration_minutes int default 0
     - note text default ''
     - mood text default ''
     - created_at timestamptz default now()
     - updated_at timestamptz default now()
     - unique(habit_id, log_date)
   - `devices` yoki `notification_settings` jadvalini qo‘sh:
     - user_id
     - habit_id nullable
     - reminder_enabled boolean
     - reminder_time text
     - timezone text
     - platform text
     - created_at / updated_at

4. Row Level Security qo‘sh:
   - Har bir foydalanuvchi faqat o‘z `profiles`, `habits`, `habit_logs`, `devices/notification_settings` ma’lumotlarini ko‘ra olsin.
   - select/insert/update/delete policy yoz.
   - `profiles.id = auth.uid()`
   - `habits.user_id = auth.uid()`
   - `habit_logs.user_id = auth.uid()`

5. Authni real ishlaydigan qil:
   - Email/password registration.
   - Login.
   - Logout.
   - Forgot password.
   - Email tasdiqlash yoqilgan bo‘lsa userga aniq xabar ko‘rsat.
   - Auth loading, error, success state professional bo‘lsin.
   - Registerdan keyin profile avtomatik yaralsin.
   - Google login UI hozir bor bo‘lsa, ishlamasa yashir yoki real OAuth ulangandan keyin ko‘rsat.

6. Habit CRUD real bo‘lsin:
   - Habit qo‘shish.
   - Habit tahrirlash.
   - Habitni active/inactive qilish.
   - Habitni o‘chirishdan oldin confirm modal.
   - Haftaning kunlari bo‘yicha schedule.
   - Reminder time.
   - Category, icon, color, target.
   - Empty state: “Hozircha odat yo‘q, birinchi odatingizni qo‘shing”.
   - Barcha o‘zgarishlar Supabasega yozilsin va UI darhol yangilansin.

7. Check-in real bo‘lsin:
   - Bugungi habitni “Ha, bajardim”, “Yo‘q, bajarmadim”, “Skip” qilish imkoniyati.
   - Duration minutes, mood, note saqlansin.
   - Bir kunda bir habitga faqat bitta log bo‘lsin; qayta belgilansa update bo‘lsin.
   - `upsert` to‘g‘ri ishlasin.
   - Bugungi progress, streak, completion rate faqat real `habit_logs` asosida chiqsin.

8. Statistika real bo‘lsin:
   - Bugungi progress.
   - Haftalik bajarilish foizi.
   - Oylik dinamika.
   - Eng uzun streak.
   - Joriy streak.
   - Eng yaxshi odatlar.
   - Calendar view: done/partial/missed/none/future holatlar.
   - Demo/hardcoded chart data ishlatilmasin.

9. Reminder va notificationni real qil:
   - Capacitor Local Notifications o‘rnat va sozla.
   - Android permission so‘rash.
   - Har bir habit uchun reminder_time va days_of_week bo‘yicha local notification schedule qil.
   - User habitni edit/delete/inactive qilsa notification ham yangilansin yoki bekor qilinsin.
   - Timezone: Asia/Tashkent default.
   - Notification text Uzbekcha:
     - Title: “Odatly eslatma”
     - Body: “Bugun {habit_name} odatini bajarishni unutmang.”
   - App ochilganda notification permission holatini tekshir.

10. Offline-first minimal sync qil:
   - Internet bo‘lmasa app ishlashda davom etsin.
   - Local cache saqlansin.
   - Offline qilingan check-in/habit changes keyin internet kelganda Supabasega sync bo‘lsin.
   - Conflict oddiy qoida bilan yechilsin: latest updated_at wins.
   - User data yo‘qolmasin.

11. UI/UX polishing:
   - Hozirgi dizaynni buzma, lekin maketga o‘xshagan joylarni real state bilan almashtir.
   - Barcha buttonlar ishlasin.
   - Loading skeleton/spinner qo‘sh.
   - Error toast yoki inline alert qo‘sh.
   - Success feedback: “Saqlandi”, “Check-in bajarildi”.
   - Keyboard bilan inputlar qulay ishlasin.
   - Android status bar va safe area to‘g‘ri ko‘rinsin.
   - Barcha matnlar Uzbek lotinida bo‘lsin.
   - Ortiqcha debug/mock yozuvlarni olib tashla.

12. Android production tayyorgarligi:
   - Capacitor configni tekshir.
   - App icon va splash screenni normal qil.
   - Internet permission borligini tekshir.
   - Android build release uchun instruction yoz.
   - Debug APK emas, release AAB/APK olish yo‘lini READMEga yoz.
   - Version: 1.0.0, build number oshirish tizimini qo‘sh.

13. Code quality:
   - TypeScript bo‘lsa typelarni to‘liq qil.
   - API/store logicni alohida service/repository qilib tartibla.
   - Components juda kattalashgan bo‘lsa bo‘lib chiq.
   - Duplicate logicni kamaytir.
   - ESLint/build xatolarini tozalagin.
   - Sensitive keylarni codega yozma.

14. Test/acceptance checklist:
   Quyidagilar 100% ishlashi kerak:
   - New user register qiladi.
   - Login qiladi.
   - Profile yaraladi.
   - Habit qo‘shadi.
   - Habit edit/delete/disable qiladi.
   - Bugun check-in qiladi.
   - Note, mood, duration saqlanadi.
   - App yopilib ochilganda data saqlanib turadi.
   - Boshqa device/browserda login qilganda data Supabasedan keladi.
   - Haftalik/oylik statistika real yangilanadi.
   - Calendar real holatni ko‘rsatadi.
   - Reminder notification keladi.
   - Logoutdan keyin boshqa userning data ko‘rinmaydi.
   - Offline holatda check-in qilib, internet qaytganda sync bo‘ladi.
   - Android APK/AAB build xatosiz chiqadi.

Natijada menga quyidagilarni ber:
- Qilingan o‘zgarishlar ro‘yxati.
- Yaratilgan/yangilangan fayllar ro‘yxati.
- Supabase migration SQL.
- `.env.example`.
- Android build qilish komandasi.
- Test checklist.
- Qolgan risklar yoki keyingi bosqichlar.