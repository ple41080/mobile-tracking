import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { useRouter } from 'expo-router'
import { CHORE_QUESTS } from '@/types/focus'
import { useChoreQuestStore } from '@/stores/choreQuestStore'
import { useIdentityStore } from '@/stores/identityStore'
import { verifyChorePhoto } from '@/services/choreVerifier'
import { verifyPhotoTakenToday } from '@/services/photoFreshness'
import { useAppTheme } from '@/hooks/useAppTheme'
import { CameraCaptureModal } from '@/components/camera/CameraCaptureModal'

export function ChoreQuestList() {
  const router = useRouter()
  const { surface, border } = useAppTheme()
  const faceEnrolled = useIdentityStore((s) => s.faceEnrolled)
  const ensureToday = useChoreQuestStore((s) => s.ensureToday)
  const getQuestProgress = useChoreQuestStore((s) => s.getQuestProgress)
  const recordAttempt = useChoreQuestStore((s) => s.recordAttempt)
  const completeQuest = useChoreQuestStore((s) => s.completeQuest)
  const [activeQuestId, setActiveQuestId] = useState<string | null>(null)
  const [cameraQuestId, setCameraQuestId] = useState<string | null>(null)

  useEffect(() => {
    ensureToday()
  }, [ensureToday])

  function promptFaceEnroll() {
    Alert.alert(
      'ลงทะเบียนใบหน้าก่อน',
      'ต้องลงทะเบียนใบหน้าก่อนส่งเควส — เก็บเฉพาะข้อมูลตัวเลขบนเครื่อง ไม่เก็บรูป',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'ลงทะเบียน',
          onPress: () => router.push('/onboarding/face-enroll?returnTo=quests'),
        },
      ]
    )
  }

  async function submitQuestPhoto(questId: string, uri: string) {
    const quest = CHORE_QUESTS.find((q) => q.id === questId)
    if (!quest) return

    setActiveQuestId(questId)
    try {
      const result = await verifyChorePhoto(quest, uri)
      recordAttempt(questId, result.passed, result.reason)

      if (result.passed) {
        completeQuest(quest)
        Alert.alert('สำเร็จ! 🎉', `ผ่านเควส "${quest.title}" ได้ ${quest.reward.coins} ⭐`)
      } else {
        Alert.alert('ยังไม่ผ่าน', result.reason ?? 'ลองถ่ายใหม่ให้เห็นทั้งใบหน้าและงานที่ทำ')
      }
    } catch {
      Alert.alert('ผิดพลาด', 'วิเคราะห์รูปไม่สำเร็จ ลองใหม่อีกครั้ง')
    } finally {
      setActiveQuestId(null)
    }
  }

  function beginSubmit(questId: string) {
    const progress = getQuestProgress(questId)
    if (progress.completedAt) {
      Alert.alert('เสร็จแล้ว', 'เควสนี้ทำสำเร็จวันนี้แล้ว')
      return
    }
    if (!faceEnrolled) {
      promptFaceEnroll()
      return
    }
    return true
  }

  function handleTakePhoto(questId: string) {
    if (!beginSubmit(questId)) return
    setCameraQuestId(questId)
  }

  async function handlePickPhoto(questId: string) {
    if (!beginSubmit(questId)) return

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) {
      Alert.alert('ต้องเข้าถึงคลังรูป', 'อนุญาตคลังรูปเพื่อเลือกรูปยืนยันเควส')
      return
    }

    const photo = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.85,
      exif: true,
    })

    if (photo.canceled || !photo.assets[0]?.uri) {
      return
    }

    const asset = photo.assets[0]
    const freshness = verifyPhotoTakenToday(asset.exif ?? null)
    if (!freshness.ok) {
      Alert.alert('รูปไม่ตรงเงื่อนไข', freshness.reason)
      return
    }

    await submitQuestPhoto(questId, asset.uri)
  }

  const activeCameraQuest = CHORE_QUESTS.find((q) => q.id === cameraQuestId)

  return (
    <>
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }}>
        <Text className="text-white/60 text-sm mb-3 px-1">
          ถ่ายหรือเลือกรูปที่ถ่ายวันนี้ มีทั้งใบหน้าและงาน — รูปจะไม่ถูกเก็บ วิเคราะห์บนเครื่องแล้วทิ้ง
        </Text>

        {CHORE_QUESTS.map((quest) => {
          const progress = getQuestProgress(quest.id)
          const done = Boolean(progress.completedAt)
          const loading = activeQuestId === quest.id

          return (
            <View
              key={quest.id}
              style={{ backgroundColor: surface, borderColor: border }}
              className="rounded-2xl p-4 mb-3 border border-white/10"
            >
              <View className="flex-row items-start justify-between mb-2">
                <View className="flex-1 pr-3">
                  <Text className="text-white font-bold text-base">{quest.title}</Text>
                  <Text className="text-white/60 text-xs mt-1">{quest.description}</Text>
                </View>
                <Text className="text-accent font-bold">+{quest.reward.coins} ⭐</Text>
              </View>

              {done ? (
                <Text className="text-green-400 text-sm">✓ สำเร็จวันนี้แล้ว</Text>
              ) : (
                <>
                  {progress.lastResult && !progress.lastResult.matched && (
                    <Text className="text-red-300 text-xs mb-2">{progress.lastResult.reason}</Text>
                  )}
                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      onPress={() => handleTakePhoto(quest.id)}
                      disabled={loading}
                      className={`flex-1 rounded-xl py-3 items-center ${
                        loading ? 'bg-white/10' : 'bg-accent'
                      }`}
                    >
                      {loading ? (
                        <ActivityIndicator color="#0F2820" />
                      ) : (
                        <Text className="text-background font-bold text-sm">ถ่ายรูป</Text>
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handlePickPhoto(quest.id)}
                      disabled={loading}
                      className={`flex-1 rounded-xl py-3 items-center border ${
                        loading ? 'border-white/10 bg-white/5' : 'border-white/20 bg-white/10'
                      }`}
                    >
                      <Text className="text-white font-bold text-sm">เลือกรูป</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          )
        })}
      </ScrollView>

      <CameraCaptureModal
        visible={cameraQuestId != null}
        onClose={() => setCameraQuestId(null)}
        onCapture={(uri) => {
          const questId = cameraQuestId
          setCameraQuestId(null)
          if (questId) {
            submitQuestPhoto(questId, uri)
          }
        }}
        facing="back"
        title={activeCameraQuest?.title ?? 'ถ่ายรูปยืนยันเควส'}
        hint="ถ่ายให้เห็นทั้งใบหน้าและงานที่ทำในภาพเดียวกัน"
        captureLabel="ถ่ายรูป"
        confirmLabel="ใช้รูปนี้ส่งเควส"
      />
    </>
  )
}
