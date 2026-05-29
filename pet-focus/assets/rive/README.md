# Rive Pet Assets

วาง `.riv` file ของสัตว์เลี้ยงที่นี่

## วิธีใช้

1. ออกแบบ animation บน [rive.app](https://rive.app) (มี free tier)
2. Export เป็น `.riv` file แล้ววางที่โฟลเดอร์นี้ เช่น `pet_cat.riv`
3. แก้ใน `HomeScreen` (index.tsx):

```tsx
<PetAvatar
  name={name}
  level={level}
  happiness={happiness}
  riveSource={require('../../assets/rive/pet_cat.riv')}
/>
```

## State Machine ที่ควรมีใน .riv

| Input | Type | ความหมาย |
|-------|------|-----------|
| `happiness` | Number (0–100) | ระดับความสุข |
| `happy` | Trigger | เปลี่ยนเป็น happy state |
| `neutral` | Trigger | เปลี่ยนเป็น neutral state |
| `sad` | Trigger | เปลี่ยนเป็น sad state |

## Free Rive assets

- [rive.app/community](https://rive.app/community) — หาสัตว์น่ารักได้เยอะ
- แนะนำ: ค้นหา "cat", "dog", "pet", "animal"
