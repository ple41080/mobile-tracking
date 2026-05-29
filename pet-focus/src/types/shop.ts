export type ItemCategory = 'outfit' | 'room' | 'pet'
export type ItemRarity = 'common' | 'rare' | 'legendary'
export type ItemCurrency = 'coin' | 'gem'

export interface ShopItem {
  id: string
  name: string
  emoji: string
  category: ItemCategory
  rarity: ItemRarity
  price: number
  currency: ItemCurrency
  description: string
}

export const RARITY_COLORS: Record<ItemRarity, string> = {
  common: '#A0A878',
  rare: '#5DB347',
  legendary: '#F5C518',
}

export const RARITY_LABELS: Record<ItemRarity, string> = {
  common: 'ธรรมดา',
  rare: 'หายาก',
  legendary: 'ตำนาน',
}

export const SHOP_ITEMS: ShopItem[] = [
  { id: 'hat_school', name: 'หมวกนักเรียน', emoji: '🎓', category: 'outfit', rarity: 'common', price: 100, currency: 'coin', description: 'หมวกแห่งความรู้' },
  { id: 'glasses_sun', name: 'แว่นกันแดด', emoji: '🕶️', category: 'outfit', rarity: 'common', price: 150, currency: 'coin', description: 'ดูเท่มากเลย' },
  { id: 'scarf_red', name: 'ผ้าพันคอแดง', emoji: '🧣', category: 'outfit', rarity: 'common', price: 80, currency: 'coin', description: 'อบอุ่นสบายใจ' },
  { id: 'wings_butterfly', name: 'ปีกผีเสื้อ', emoji: '🦋', category: 'outfit', rarity: 'rare', price: 50, currency: 'gem', description: 'บินได้เหมือนนางฟ้า' },
  { id: 'crown_gold', name: 'มงกุฎทอง', emoji: '👑', category: 'outfit', rarity: 'legendary', price: 100, currency: 'gem', description: 'ราชาแห่งโฟกัส' },
  { id: 'bow_pink', name: 'โบว์ชมพู', emoji: '🎀', category: 'outfit', rarity: 'common', price: 60, currency: 'coin', description: 'น่ารักมากจ้า' },
  { id: 'room_bed', name: 'เตียงนอน', emoji: '🛏️', category: 'room', rarity: 'common', price: 200, currency: 'coin', description: 'นอนหลับฝันดี' },
  { id: 'room_plant', name: 'ต้นไม้', emoji: '🌱', category: 'room', rarity: 'common', price: 80, currency: 'coin', description: 'ห้องสดชื่น' },
  { id: 'room_lamp', name: 'โคมไฟ', emoji: '🪔', category: 'room', rarity: 'common', price: 120, currency: 'coin', description: 'แสงอบอุ่นยามเย็น' },
  { id: 'room_tv', name: 'โทรทัศน์', emoji: '📺', category: 'room', rarity: 'rare', price: 40, currency: 'gem', description: 'ดูหนังได้แบบ premium' },
  { id: 'room_piano', name: 'เปียโน', emoji: '🎹', category: 'room', rarity: 'legendary', price: 80, currency: 'gem', description: 'บรรเลงเพลงสุดหรู' },
  { id: 'pet_dog', name: 'สุนัข', emoji: '🐕', category: 'pet', rarity: 'rare', price: 60, currency: 'gem', description: 'เพื่อนซี้น้องหมา' },
  { id: 'pet_rabbit', name: 'กระต่าย', emoji: '🐇', category: 'pet', rarity: 'rare', price: 55, currency: 'gem', description: 'กระโดดไปกระโดดมา' },
  { id: 'pet_dragon', name: 'มังกร', emoji: '🐲', category: 'pet', rarity: 'legendary', price: 150, currency: 'gem', description: 'มังกรผู้พิทักษ์' },
]

export const GACHA_RATES = {
  common: 0.60,
  rare: 0.90,
  legendary: 1.00,
}
