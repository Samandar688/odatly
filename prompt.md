We already have the Odat React Native Expo app screens implemented. Do not rebuild the project from scratch. Keep the current routes, screens, mock data, and navigation logic. Your task is to do a full UI polish pass and make the app visually match the original clean reference mockup more closely.

Main goal:
Transform the current MVP-looking UI into a premium, clean, soft, modern mobile app UI.

Do not add backend.
Do not add authentication.
Do not add real database.
Do not add new product features.
Only improve UI, layout, spacing, typography, icons, cards, buttons, tab bar, and visual consistency.

Current problems to fix:
1. Replace all letter placeholder icons like B, P, I, T, O, S with real icons.
2. Fix bottom tab bar so it looks modern, soft, and does not overlap content.
3. Add proper ScrollView and bottom padding to every screen where content can go under the tab bar.
4. Reduce overly large font sizes and overly bold text.
5. Make cards softer, lighter, and more consistent.
6. Make buttons less bulky and more elegant.
7. Improve onboarding illustration/logo area.
8. Make all screens follow one consistent design system.
9. Make the UI closer to the attached reference image.
10. Keep all text in Uzbek.

Install and use:
- lucide-react-native for icons
- expo-linear-gradient if needed for soft gradient cards

Recommended commands:
npm install lucide-react-native
npx expo install react-native-svg
npx expo install expo-linear-gradient

Design system:

Colors:
- Background: #F8FAFC
- Card: #FFFFFF
- Text primary: #0F172A
- Text secondary: #64748B
- Border: #E5E7EB
- Green: #16A34A
- Green soft: #EAF8EF
- Blue: #2563EB
- Blue soft: #EFF6FF
- Purple: #7C3AED
- Purple soft: #F3E8FF
- Orange: #F97316
- Orange soft: #FFF3E6
- Success: #22C55E
- Warning: #F59E0B
- Error: #EF4444

Typography:
- Main screen title: 28px, weight 800
- Section title: 18px, weight 700
- Card title: 14–16px, weight 500 or 600
- Large number: 28–34px, weight 800
- Body text: 15–16px, weight 400 or 500
- Muted text: 13–14px, weight 400
- Button text: 16px, weight 700

Spacing:
- Screen horizontal padding: 20px
- Card padding: 20px
- Gap between sections: 18–22px
- Gap inside cards: 10–14px
- Bottom padding for tab screens: at least 120px
- Bottom padding for detail screens: at least 40px

Radius:
- Main cards: 22px
- Small cards: 18px
- Buttons: 18px
- Inputs: 16px
- Chips: 14–16px
- Icon containers: 14–16px

Shadow:
Use subtle shadow only.
Cards should not look too heavy.
Suggested:
shadowColor: "#0F172A"
shadowOpacity: 0.06
shadowRadius: 12
shadowOffset: { width: 0, height: 6 }
elevation: 2

Icons:
Use lucide-react-native icons:
- Bugun: Home or LayoutDashboard
- Pul: Wallet
- Ishlar: CheckSquare or ListTodo
- Telefon: Smartphone
- Ovqat: Utensils or Apple
- Settings: Settings
- Calendar: Calendar
- Back: ChevronLeft
- Add: Plus
- Report: BarChart3 or PieChart
- Focus: Timer
- Water: Droplets
- Weight: Activity or Scale

Bottom tab bar:
- Must be floating style.
- Height around 74–82px.
- Border radius 24px.
- Position absolute at bottom with left/right 20px.
- Background white.
- Soft shadow.
- Active tab should have soft tinted background, not huge block.
- Use icon + label.
- Do not use letters as icons.
- Add enough bottom padding to screens so content never hides behind the tab bar.

Screen layout rules:
- Every main tab screen should use ScrollView.
- Every main tab screen should have contentContainerStyle with paddingBottom: 120.
- Keep top header consistent:
  - Left accent icon in rounded square
  - Big title
  - Optional small right action icon
- Avoid random right-side letter buttons like “S” or “18” unless they are real useful icons.
- Use Calendar icon for date.
- Use Settings icon for settings.

Onboarding screen:
Current onboarding is too plain. Improve it:
- Use a cleaner logo mark.
- App name “Odat” should be large and bold.
- Slogan: “O‘zingni nazorat qil, hayotingni o‘zgartir.”
- Replace the current simple illustration with a better soft illustration card:
  - phone in center
  - four small floating category icons around it:
    - wallet
    - check-square
    - smartphone
    - utensils/apple
- Use soft green background card.
- Primary button: “Boshlash”
- Secondary button: “Kirish”
- Make the onboarding feel premium, calm, and startup-ready.

Bugun screen:
Make it closer to the reference:
- Greeting should be friendly:
  “Salom, Azamat!”
  “Bugun o‘zing uchun zo‘r kun!”
- Odat ball card should be elegant and not too tall.
- Circular progress should be clean and centered.
- Four summary cards should have balanced size and spacing.
- Use real icons.
- Progress bars should be soft and thin.
- Motivational card should be subtle green tinted.

Pul screen:
- Keep the strong green limit card, but polish it.
- The card should look like a premium finance card.
- Expense list card should be clean.
- Replace green letter P icons with category icons:
  - Ovqat: Utensils
  - Transport: Car
  - Kofe / Shirinlik: Coffee
  - Internet / Aloqa: Wifi
- Buttons “Barchasi” and “Hisobot” should be secondary buttons.

Ishlar screen:
- The current text with strike-through looks too heavy. Make completed tasks cleaner.
- Use checkbox icons.
- Progress card should be softer and not too big.
- “+ Yangi ish qo‘shish” button should be blue and elegant.
- “Kun yakuni” card should be subtle and smaller.

Telefon screen:
- Add ScrollView/padding so bottom tab does not cover TikTok.
- Use actual app-like icons or clean colored icon containers.
- “Focus rejimini boshlash” button should be purple.
- “Hozir chalg‘iyapman” should be a white outlined button/card.
- Usage list should have consistent progress bars.

Ovqat screen:
- Add ScrollView/padding so bottom tab does not cover Suv/Vazn cards.
- Use food icons instead of letter O.
- Make calorie card soft orange.
- Show water and weight cards clearly above bottom tab.
- The food list should not feel too tall.

Detail screens:
- Back button should be consistent.
- Inputs should have clean border and white background.
- Disabled buttons should not look broken; use opacity 0.45.
- Error messages should be small and muted red/gray.
- Chips should have selected and unselected states.
- Keep the same spacing across all detail screens.

Acceptance criteria:
1. No placeholder letter icons remain.
2. No content is hidden behind the bottom tab bar.
3. All main screens look visually consistent.
4. The app looks closer to the reference mockup: soft, clean, modern, premium.
5. Uzbek text remains correct.
6. All current navigation still works.
7. No screen crashes.
8. Android screen 360–430 width looks good.
9. Buttons and cards are not overly huge.
10. The app feels like a real product prototype, not a generated draft.



Do not change business logic or routes. First polish shared components and design tokens. Then update screens. The biggest priority is visual quality and consistency.