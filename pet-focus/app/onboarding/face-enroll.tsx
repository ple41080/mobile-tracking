import React, { useState } from 'react'
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { CameraCaptureModal } from '@/components/camera/CameraCaptureModal'
import { useIdentityStore } from '@/stores/identityStore'

export default function FaceEnrollScreen() {
  const router = useRouter()
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [cameraOpen, setCameraOpen] = useState(true)
  const setFaceEnrolled = useIdentityStore((s) => s.setFaceEnrolled)

  function navigateAfterExit() {
    if (returnTo === 'quests') {
      router.replace('/(tabs)/quests')
      return
    }
    router.replace('/(tabs)')
  }

  function handleSkip() {
    navigateAfterExit()
  }

  async function handleCapture(uri: string) {
    setLoading(true)
    setMessage(null)

    try {
      const { enrollFace } = await import('@/services/faceVerifier')
      const result = await enrollFace(uri)
      if (result.success) {
        setFaceEnrolled(true)
        navigateAfterExit()
        return
      }
      setMessage(result.reason ?? 'ลงทะเบียนไม่สำเร็จ')
      setCameraOpen(true)
    } catch {
      setMessage('เกิดข้อผิดพลาด ลองใหม่อีกครั้ง')
      setCameraOpen(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className="flex-1 bg-background">
      {!cameraOpen && (
        <SafeAreaView className="flex-1 px-6 justify-center">
          <Text className="text-white text-2xl font-bold mb-2">ลงทะเบียนใบหน้า</Text>
          <Text className="text-white/70 mb-6">
            ใช้ยืนยันตัวตนตอนส่งเควสทำงานบ้าน — เก็บเฉพาะข้อมูลตัวเลขบนเครื่อง ไม่เก็บรูป
          </Text>
          {message ? (
            <Text className="text-red-300 text-center mb-4 px-2">{message}</Text>
          ) : null}
          {loading ? (
            <ActivityIndicator color="#FFC94D" className="mb-4" />
          ) : (
            <TouchableOpacity
              onPress={() => setCameraOpen(true)}
              className="bg-accent rounded-2xl py-4 items-center mb-3"
            >
              <Text className="text-background font-bold">เปิดกล้องถ่ายรูป</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={handleSkip} className="py-3 items-center">
            <Text className="text-white/60">ข้ามไปก่อน</Text>
          </TouchableOpacity>
        </SafeAreaView>
      )}

      <CameraCaptureModal
        visible={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={handleCapture}
        facing="front"
        title="ลงทะเบียนใบหน้า"
        hint="จัดใบหน้าให้อยู่ในวงกลม แล้วกดถ่ายรูป — ใช้ยืนยันตอนส่งเควส"
        captureLabel="ถ่ายรูปลงทะเบียน"
        confirmLabel="ใช้รูปนี้ลงทะเบียน"
      />
    </View>
  )
}
