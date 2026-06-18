# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing any code.

ทุกครั้งที่ มีการแก้ อะไร ให้มาอัพเดตไฟล์นี้ด้วยว่ามี feature อะไร logic อะไรบ้าง เพื่อตอนอ่านจะได้รู้ว่าโปรเจคนี้มีโครงสร้างยังไง แต่ละ feature ทำงานยังไง

---

# Pet Focus — ภาพรวมโปรเจกต์

แอปช่วยลดเวลาใช้มือถือสำหรับนักเรียน โดยใช้สัตว์เลี้ยงเสมือนเป็นแรงจูงใจ (เสริมแรงเชิงบวก) ทำ Focus session → สัตว์เลี้ยงมีความสุข + ได้เหรียญ/EXP ไปแต่งตัว/ตกแต่งห้อง

- **Stack:** Expo SDK 52 (RN 0.76), expo-router, NativeWind (Tailwind), Zustand, Firebase, Rive
- **ต้องใช้ dev client** (`npx expo run:android`) เพราะมี native module `AppBlockModule` + Rive — ใช้ Expo Go ไม่ได้
- **แพลตฟอร์มหลัก:** Android (block แอป / usage stats ทำงานเฉพาะ Android)

## โครงสร้างหน้า (app/(tabs)/)
- `index.tsx` — หน้า Home: แสดงสัตว์เลี้ยง (Rive), HUD เหรียญ ⭐ + Lv, stat bar (happiness/hp), ของตกแต่งห้อง, แตะสัตว์เพื่อเพิ่ม happiness
- `focus.tsx` — Focus Mode: เลือกเวลา, timer ring, เริ่ม/ยกเลิก, modal สำเร็จ + **mood check-in**, modal fail (เชิงบวก)
- `shop.tsx` — ร้านค้า: ซื้อด้วยเหรียญ ⭐ อย่างเดียว, แบ่งหมวด (แต่งตัว/พื้นหลัง/ตกแต่ง/สัตว์), modal ยืนยันซื้อ
- `stats.tsx` — สถิติ: screen time วันนี้, streak, **การ์ดสรุปสัปดาห์ (sessions/เวลาโฟกัส/อารมณ์เฉลี่ย)**, AI tip, กราฟแอปที่ใช้มากสุด

## Stores (Zustand, src/stores/)
- `petStore` — name/level/exp/hp/happiness/**coins** (ไม่มี gems แล้ว), equippedItems; `addCoins/spendCoins/addExp/updateHappiness/equipItem`
- `focusStore` — สถานะ session, timer, streak, totalFocusMinutes, **moodLog (persist ลง AsyncStorage)**; helper `getCoinsForDuration`, `getWeeklySummary`
- `shopStore` — แค่ activeCategory (ลบ Gacha logic แล้ว)
- `roomStore` — พื้นหลัง/สี theme/ของตกแต่งที่วาง
- `userStore` — profile/login/ownedItems/achievements

## Hooks (src/hooks/)
- `useFocusSession` — คุม flow โฟกัส: start/complete/fail, ให้รางวัล (coin + EXP + happiness+10) ตอนสำเร็จ; **fail ไม่มี penalty** (เสริมแรงบวก)
- `usePetStatus`, `useScreenTime`, `useDailyQuest`, `useAppTheme`

## Services (src/services/)
- `appBlock.ts`, `focusTimer.ts` — เรียก native `AppBlockModule` (block แอป, focus service)
- `usageStats.ts` — ดึง usage จาก native, **merge ตาม packageName + sort** (กัน key ซ้ำ/นับซ้ำ)
- `firebase/` — config, auth, firestore (pet/wallet[coins]/focusSessions/dailyStats/streak), functions (AI tip)

## Features สำคัญ + logic
1. **Focus session** — เลือก 30/60/120/180 นาที, native block TikTok/IG/FB; สำเร็จ → coin (ตาม `FOCUS_REWARDS`) + EXP (coin×2) + happiness+10
2. **Mood check-in** (`MoodCheckIn.tsx`) — หลังโฟกัสสำเร็จ เลือกอารมณ์ 1-5 (`MOOD_OPTIONS`), บันทึกลง `moodLog` พร้อม date+minutes, ข้ามได้
3. **Weekly summary** — `getWeeklySummary()` คำนวณ sessions/เวลาโฟกัส/อารมณ์เฉลี่ย 7 วันล่าสุดจาก moodLog → แสดงใน Stats
4. **ร้านค้า** — ซื้อด้วยเหรียญอย่างเดียว, owned → สวม/วาง/ตั้ง theme; **ไม่มี Gacha, ไม่มีเพชร, ไม่มี rarity tag**
5. **เสริมแรงเชิงบวก** — fail ไม่ลงโทษ (ไม่หัก happiness), ข้อความให้กำลังใจ

## ประวัติการเปลี่ยนแปลงล่าสุด
- ลบระบบ Gacha + สกุลเงินเพชร (gems) ทั้งหมด — เหลือเหรียญ (coin) อย่างเดียว, item ที่เคยใช้ gem เปลี่ยนเป็น coin
- ลบ rarity tag (ตำนาน/ธรรมดา/หายาก) ออกจากการ์ดสินค้าและ modal ซื้อ
- แก้ key ซ้ำใน AppUsageChart โดย merge usage ตาม packageName ที่ต้นทาง
- เพิ่มระบบเสริมแรงบวก: เอา penalty ตอน fail ออก + mood check-in + การ์ดสรุปสัปดาห์ (แนวทาง research-lite)
