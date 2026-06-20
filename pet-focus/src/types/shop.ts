import { PetId } from '@/types/pet'

export type ItemCategory = 'outfit' | 'room' | 'background' | 'pet'
export type ItemRarity = 'common' | 'rare' | 'legendary'
export type ItemCurrency = 'coin'

export interface ShopItem {
  id: string
  name: string
  emoji: string
  category: ItemCategory
  rarity: ItemRarity
  price: number
  currency: ItemCurrency
  description: string
  // background items only
  bgColor?: string
  bgGradient?: [string, string]
  tabBarColor?: string
  surfaceColor?: string
  petId?: PetId
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
  // { id: 'scarf_red', name: 'ผ้าพันคอแดง', emoji: '🧣', category: 'outfit', rarity: 'common', price: 80, currency: 'coin', description: 'อบอุ่นสบายใจ' },
  // { id: 'wings_butterfly', name: 'ปีกผีเสื้อ', emoji: '🦋', category: 'outfit', rarity: 'rare', price: 300, currency: 'coin', description: 'บินได้เหมือนนางฟ้า' },
  // { id: 'crown_gold', name: 'มงกุฎทอง', emoji: '👑', category: 'outfit', rarity: 'legendary', price: 800, currency: 'coin', description: 'ราชาแห่งโฟกัส' },
  // { id: 'bow_pink', name: 'โบว์ชมพู', emoji: '🎀', category: 'outfit', rarity: 'common', price: 60, currency: 'coin', description: 'น่ารักมากจ้า' },
  // { id: 'room_bed', name: 'เตียงนอน', emoji: '🛏️', category: 'room', rarity: 'common', price: 200, currency: 'coin', description: 'นอนหลับฝันดี' },
  // { id: 'room_plant', name: 'ต้นไม้', emoji: '🌱', category: 'room', rarity: 'common', price: 80, currency: 'coin', description: 'ห้องสดชื่น' },
  // { id: 'room_lamp', name: 'โคมไฟ', emoji: '🪔', category: 'room', rarity: 'common', price: 120, currency: 'coin', description: 'แสงอบอุ่นยามเย็น' },
  // { id: 'room_tv', name: 'โทรทัศน์', emoji: '📺', category: 'room', rarity: 'rare', price: 350, currency: 'coin', description: 'ดูหนังได้แบบ premium' },
  // { id: 'room_piano', name: 'เปียโน', emoji: '🎹', category: 'room', rarity: 'legendary', price: 700, currency: 'coin', description: 'บรรเลงเพลงสุดหรู' },
  // ─── Backgrounds ────────────────────────────────────────────────────────────
  { id: 'bg_sky', name: 'ท้องฟ้าใส', emoji: '☁️', category: 'background', rarity: 'common', price: 50, currency: 'coin', description: 'ฟ้าสว่างสดชื่น', bgColor: '#E3F2FD', tabBarColor: '#1565C0', surfaceColor: '#1976D2' },
  { id: 'bg_pink', name: 'ชมพูหวาน', emoji: '🌸', category: 'background', rarity: 'common', price: 50, currency: 'coin', description: 'หวานน่ารัก', bgColor: '#FCE4EC', tabBarColor: '#880E4F', surfaceColor: '#AD1457' },
  { id: 'bg_mint', name: 'มิ้นต์สดใส', emoji: '🌿', category: 'background', rarity: 'common', price: 50, currency: 'coin', description: 'สดชื่นเย็นตา', bgColor: '#E8F5E9', tabBarColor: '#1B5E20', surfaceColor: '#2E7D32' },
  { id: 'bg_lavender', name: 'ลาเวนเดอร์', emoji: '💜', category: 'background', rarity: 'common', price: 50, currency: 'coin', description: 'ม่วงอ่อนนุ่มตา', bgColor: '#F3E5F5', tabBarColor: '#4A148C', surfaceColor: '#6A1B9A' },
  { id: 'bg_peach', name: 'พีชอ่อน', emoji: '🍑', category: 'background', rarity: 'common', price: 60, currency: 'coin', description: 'อบอุ่นหัวใจ', bgColor: '#FFF3E0', tabBarColor: '#E65100', surfaceColor: '#F4511E' },
  { id: 'bg_ocean', name: 'ใต้ทะเล', emoji: '🌊', category: 'background', rarity: 'rare', price: 300, currency: 'coin', description: 'ลึกลับใต้น้ำ', bgGradient: ['#006994', '#00BCD4'], tabBarColor: '#003d5b', surfaceColor: '#00546e' },
  { id: 'bg_sunset', name: 'พระอาทิตย์ตก', emoji: '🌅', category: 'background', rarity: 'rare', price: 300, currency: 'coin', description: 'สวยงามยามเย็น', bgGradient: ['#FF6B6B', '#FFD93D'], tabBarColor: '#B71C1C', surfaceColor: '#C62828' },
  { id: 'bg_galaxy', name: 'กาแลกซี่', emoji: '🌌', category: 'background', rarity: 'legendary', price: 800, currency: 'coin', description: 'ห้วงอวกาศ', bgGradient: ['#0D0D2B', '#5B2D8E'], tabBarColor: '#1A0A3D', surfaceColor: '#2D1260' },
  { id: 'bg_rainbow', name: 'สายรุ้ง', emoji: '🌈', category: 'background', rarity: 'legendary', price: 900, currency: 'coin', description: 'สีสันมหาสนุก', bgGradient: ['#FF6B6B', '#4ECDC4'], tabBarColor: '#B71C1C', surfaceColor: '#C62828' },

  // ─── Pets ────────────────────────────────────────────────────────────────────
  { id: 'pet_dog', name: 'สุนัข', emoji: '🐕', category: 'pet', rarity: 'rare', price: 500, currency: 'coin', description: 'เพื่อนซี้น้องหมา', petId: 'pet_dog' },
  // { id: 'pet_rabbit', name: 'กระต่าย', emoji: '🐇', category: 'pet', rarity: 'rare', price: 500, currency: 'coin', description: 'กระโดดไปกระโดดมา' },
  // { id: 'pet_dragon', name: 'มังกร', emoji: '🐲', category: 'pet', rarity: 'legendary', price: 1200, currency: 'coin', description: 'มังกรผู้พิทักษ์' },
]
