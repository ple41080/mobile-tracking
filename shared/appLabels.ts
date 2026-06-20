/** Known Android package → display name (Thai student apps + social/media) */
export const APP_LABEL_CATALOG: Record<string, string> = {
  'com.google.android.youtube': 'YouTube',
  'com.zhiliaoapp.musically': 'TikTok',
  'com.ss.android.ugc.trill': 'TikTok',
  'com.instagram.android': 'Instagram',
  'com.facebook.katana': 'Facebook',
  'com.facebook.orca': 'Messenger',
  'com.netflix.mediaclient': 'Netflix',
  'jp.naver.line.android': 'LINE',
  'com.android.chrome': 'Chrome',
  'com.google.android.googlequicksearchbox': 'Google',
  'com.google.android.apps.maps': 'Google Maps',
  'com.google.android.gm': 'Gmail',
  'com.google.android.apps.photos': 'Google Photos',
  'com.spotify.music': 'Spotify',
  'com.discord': 'Discord',
  'com.roblox.client': 'Roblox',
  'com.mojang.minecraftpe': 'Minecraft',
  'com.supercell.clashofclans': 'Clash of Clans',
  'com.supercell.clashroyale': 'Clash Royale',
  'com.garena.game.kgth': 'RoV',
  'com.mobile.legends': 'Mobile Legends',
  'com.tencent.ig': 'PUBG Mobile',
  'com.dts.freefireth': 'Free Fire',
  'com.shopee.th': 'Shopee',
  'com.lazada.android': 'Lazada',
  'com.grabtaxi.passenger': 'Grab',
  'com.linecorp.linemusic.android': 'LINE MUSIC',
  'com.twitter.android': 'X',
  'com.snapchat.android': 'Snapchat',
  'com.whatsapp': 'WhatsApp',
  'com.google.android.apps.youtube.music': 'YouTube Music',
  'com.google.android.apps.messaging': 'Messages',
  'com.sec.android.app.sbrowser': 'Samsung Internet',
  'com.samsung.android.messaging': 'Messages',
  'com.android.vending': 'Play Store',
  'com.google.android.apps.docs': 'Google Docs',
  'com.microsoft.teams': 'Microsoft Teams',
  'us.zoom.videomeetings': 'Zoom',
  'com.google.android.calendar': 'Calendar',
  'com.google.android.deskclock': 'Clock',
  'com.google.android.calculator': 'Calculator',
  'com.google.android.contacts': 'Contacts',
  'com.android.settings': 'Settings',
}

const PACKAGE_PATTERN = /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/i

export function looksLikePackageName(value: string): boolean {
  return PACKAGE_PATTERN.test(value.trim())
}

function heuristicLabel(packageName: string): string {
  const segments = packageName.split('.').filter(Boolean)
  const last = segments[segments.length - 1] ?? packageName
  if (!last) return packageName
  return last.charAt(0).toUpperCase() + last.slice(1)
}

export function resolveAppLabel(packageName: string, rawName?: string | null): string {
  const trimmedRaw = rawName?.trim()
  if (trimmedRaw && !looksLikePackageName(trimmedRaw) && trimmedRaw !== packageName) {
    return trimmedRaw
  }

  const catalog = APP_LABEL_CATALOG[packageName]
  if (catalog) return catalog

  if (trimmedRaw && !looksLikePackageName(trimmedRaw)) {
    return trimmedRaw
  }

  return heuristicLabel(packageName)
}

export type AppUsageDisplay = {
  name: string
  packageName: string
  minutes: number
  iconBase64?: string
}

export function normalizeAppUsage<T extends AppUsageDisplay>(apps: T[]): T[] {
  return apps.map((app) => ({
    ...app,
    name: resolveAppLabel(app.packageName, app.name),
  }))
}
