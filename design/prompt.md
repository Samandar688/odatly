# Odatly: "Bugun" (Today) Sahifasi uchun Ideal UI/UX Prompti

Ushbu hujjat loyihaning "Bugun" sahifasini vizual ko'rinishini yaratish uchun eng mukammal, detallarga boy va har bir pixeligacha ta'riflangan dizayn promptini o'z ichiga oladi.

## 🎨 Umumiy Stil va Estetika
- **Design Trend:** Modern, Premium, Clean, Glassmorphism va Neumorphism elementlari bilan aralashgan "Soft UI".
- **Color Palette:** 
  - **Background:** Och yashil/kulrang aralashmasi (`#EEF4F0` yoki `#F8FBF8`) — ko'zni charchatmaydigan, osoyishta kayfiyat beruvchi fon.
  - **Primary Accent:** Baquvvat yashil (`#3CB878`) — progress va muvaffaqiyat ramzi.
  - **Cards & Elements:** Mutlaqo oq (`#FFFFFF`) — juda nozik soya (drop-shadow: `0px 8px 24px rgba(28,32,53,0.04)`) bilan ajralib turadi.
  - **Typography Colors:** Asosiy matnlar uchun to'q ko'k-qora (`#1C2035`), yordamchi matnlar uchun yumshoq kulrang (`#7B8088`).
- **Typography:** Zamonaviy, toza sans-serif shriftlari (masalan: `Inter`, `Outfit` yoki `SF Pro Display`). Sarlavhalar qalinroq (Bold/Semi-bold), yordamchi matnlar o'qishga qulay (Medium/Regular).

## 📱 Ekran Kompozitsiyasi (Pixel-Perfect Detallar)

### 1. Header (Tepa qism)
- **Joylashuv:** Ekranning eng yuqori qismida, Safe Area insets hisobga olingan holda.
- **Tarkibi:** 
  - Chap tomonda foydalanuvchiga xushmuomala salom: **"Salom, Samandar! 👋"** (24px, Bold, `#1C2035`).
  - Uning pastida bugungi sana va motivatsion matn: **"19 Iyun, Dushanba • 3 ta odat kutyapti"** (14px, Medium, `#7B8088`).
  - O'ng tomonda foydalanuvchi avatari yoki chiroyli "Bugun" badgi (Yashil fon `#E8F5EE`, yashil matn `#2D9162`, pilled radius).

### 2. Daily Progress Card (Kunlik taraqqiyot kartasi)
- **O'lcham va Joylashuv:** Headerdan biroz pastda, ekranning to'liq kengligini (chetlarida 20px padding) egallaydigan keng karta.
- **Dizayn:** Oq fon (`#FFFFFF`), burchaklari silliq yumaloqlangan (Border Radius: 24px).
- **Elementlar:**
  - Ichida katta aylanma progress bar (Circular Progress) yashil rangda (75% to'lgan).
  - Progress bar o'rtasida katta shriftda "75%" yozuvi.
  - Yonida: **"Ajoyib natija!"** va **"Bugungi odatlarning katta qismini bajardingiz."**
  - Karta fonida juda och, abstrakt geometrik shakllar (mikro-dizayn) bo'lishi mumkin.

### 3. Habits List (Odatlar ro'yxati)
- **Sarlavha:** Kartadan pastda, "Bugungi Odatlar" (18px, Semi-Bold, `#1C2035`).
- **List Item (Har bir odat qatori):**
  - **Burchaklari:** 16px radiusli to'rtburchak.
  - **Fon:** Bajarilmaganlar uchun oq (`#FFFFFF`), bajarilganlar uchun juda och yashil (`#E8F5EE` yoki uning oppacity tushirilgan varianti).
  - **Chap tomon:** Odatning rangi bilan belgilangan dumaloq icon-konteyner (masalan, Apelsin `#FF8B36` fon, ichida oq yozuv yoki icon).
  - **O'rta qism:** 
    - Odat nomi: "Ertalab yurish" (16px, Medium, `#1C2035`).
    - Detallar: "30 daqiqa • 07:00" (13px, Regular, `#7B8088`).
  - **O'ng tomon (Check-in tugmasi):** 
    - Bajarilmagan bo'lsa: Chiroyli aylana border (border-color: `#E0E0E0`).
    - Bajarilgan bo'lsa: Asosiy yashil rang bilan to'ldirilgan, markazida oq "Check" (✔) belgisi bor, yengil porlash (glow) effekti bilan.
- **Interaktivlik (Micro-animations):** Tugmani bosganda mayin kattalashib-kichiklashuvchi (scale) va rang o'zgaruvchi animatsiya.

### 4. Floating Action Button (Qo'shish tugmasi)
- **Joylashuv:** O'ng tomon pastki burchakda, Tab Bardang sal yuqoriroqda.
- **Dizayn:** Mukammal dumaloq (Size: 60x60px), asosiy yashil rang (`#3CB878`), yashil rangli mayin soya (Shadow: `0px 8px 24px rgba(60, 184, 120, 0.4)`).
- **Tarkibi:** Oq rangdagi aniq va qalin **"+"** belgisi.

### 5. Bottom Tab Bar (Pastki navigatsiya)
- **Joylashuv:** Ekranning eng pastki qismida, ekranga "suzib" (floating) turgandek yoki to'liq qoplagan (solid) holda.
- **Dizayn:** Oq rangli, yuqori qismida juda nozik chiziq (Border-top: `1px solid rgba(0,0,0,0.05)`) yoki Glassmorphism effekti (orqasi biroz xira ko'rinuvchi - Blur).
- **Elementlar:** 5 ta ikonka (Bugun, Odatlar, Kalendar, Stat, Profil).
- **Aktiv Tab ("Bugun"):** Ikonka yashil (`#3CB878`) rangda porlab turadi, ostida kichik yashil nuqta yoki chiziqcha. Matni ham yashil. Boshqalari esa yumshoq kulrang (`#B8BBC4`).

## 🖼 Image Generation uchun Inglizcha Prompt
Agarda bu dizaynni Midjourney, DALL-E 3 yoki boshqa AI generatorida yasamoqchi bo'lsangiz, aynan mana shu matndan foydalaning:

> **"A highly professional, premium UI/UX design of a mobile app screen for a Habit Tracker application named 'Odatly'. The screen is the 'Today' view. Aesthetic is modern, clean, soft UI with subtle glassmorphism elements. Color palette: background is soft greenish-white (#EEF4F0), primary accent color is vibrant green (#3CB878), UI cards are pure white with extremely soft drop-shadows. The header features 'Salom, Samandar!' with a modern badge. Below the header is a beautiful 'Daily Progress' card containing a green circular progress ring showing 75% completion. Below the card, a list of habits (e.g., morning walk, reading) represented as sleek rounded list items. Each list item has a colorful minimalist icon, elegant typography for the habit name and time, and a modern circular check-in button on the right (some checked with a green tick and subtle glow, some empty). Floating action button on the bottom right with a '+' icon casting a soft green shadow. Bottom tab bar with 5 minimalist icons, the 'Today' tab is active and highlighted in green. Typography is 'Inter' or 'Outfit', highly legible and well-structured. Dribbble style, award-winning UI design, 8k resolution, photorealistic mockup on a flat aesthetic background."**
