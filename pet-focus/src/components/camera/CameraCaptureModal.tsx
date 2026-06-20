import React, { useEffect, useRef, useState } from 'react'
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Image,
  Switch,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { CameraView, useCameraPermissions, CameraType } from 'expo-camera'
import { useCameraSettingsStore } from '@/stores/cameraSettingsStore'

type CameraCaptureModalProps = {
  visible: boolean
  onClose: () => void
  onCapture: (uri: string) => void
  title: string
  hint: string
  facing?: CameraType
  captureLabel?: string
  confirmLabel?: string
}

export function CameraCaptureModal({
  visible,
  onClose,
  onCapture,
  title,
  hint,
  facing = 'back',
  captureLabel = 'ถ่ายรูป',
  confirmLabel = 'ใช้รูปนี้',
}: CameraCaptureModalProps) {
  const cameraRef = useRef<CameraView>(null)
  const [permission, requestPermission] = useCameraPermissions()
  const [previewUri, setPreviewUri] = useState<string | null>(null)
  const [capturing, setCapturing] = useState(false)
  const [cameraFacing, setCameraFacing] = useState<CameraType>(facing)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const mirrorPreview = useCameraSettingsStore((s) => s.mirrorPreview)
  const shutterSound = useCameraSettingsStore((s) => s.shutterSound)
  const setMirrorPreview = useCameraSettingsStore((s) => s.setMirrorPreview)
  const setShutterSound = useCameraSettingsStore((s) => s.setShutterSound)

  useEffect(() => {
    if (!visible) {
      setPreviewUri(null)
      setCapturing(false)
      setSettingsOpen(false)
      return
    }
    setCameraFacing(facing)
  }, [visible, facing])

  const showMirror = mirrorPreview && cameraFacing === 'front'

  async function handleTakePhoto() {
    if (!cameraRef.current || capturing) return
    setCapturing(true)
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.85,
        skipProcessing: true,
        shutterSound,
      })
      if (photo?.uri) {
        setPreviewUri(photo.uri)
      }
    } finally {
      setCapturing(false)
    }
  }

  function handleConfirm() {
    if (!previewUri) return
    onCapture(previewUri)
    setPreviewUri(null)
    onClose()
  }

  function handleRetake() {
    setPreviewUri(null)
  }

  if (!visible) return null

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-background">
        {!permission ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color="#FFC94D" />
          </View>
        ) : !permission.granted ? (
          <SafeAreaView className="flex-1 px-6 justify-center">
            <Text className="text-white text-xl font-bold mb-3">ต้องใช้กล้อง</Text>
            <Text className="text-white/70 mb-6">{hint}</Text>
            <TouchableOpacity
              onPress={requestPermission}
              className="bg-accent rounded-2xl py-4 items-center mb-3"
            >
              <Text className="text-background font-bold">อนุญาตใช้กล้อง</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose} className="py-3 items-center">
              <Text className="text-white/60">ยกเลิก</Text>
            </TouchableOpacity>
          </SafeAreaView>
        ) : previewUri ? (
          <SafeAreaView className="flex-1">
            <View className="px-6 pt-4 pb-2">
              <Text className="text-white text-xl font-bold">{title}</Text>
              <Text className="text-white/70 mt-1">ตรวจสอบรูปก่อนส่ง</Text>
            </View>
            <View className="flex-1 px-4 py-2">
              <Image
                source={{ uri: previewUri }}
                className="flex-1 rounded-2xl"
                resizeMode="contain"
                style={showMirror ? { transform: [{ scaleX: -1 }] } : undefined}
              />
            </View>
            <SafeAreaView edges={['bottom']} className="px-6 pb-4 gap-3">
              <TouchableOpacity
                onPress={handleConfirm}
                className="bg-accent rounded-2xl py-4 items-center"
              >
                <Text className="text-background font-bold">{confirmLabel}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleRetake}
                className="rounded-2xl py-4 items-center border border-white/20"
              >
                <Text className="text-white font-semibold">ถ่ายใหม่</Text>
              </TouchableOpacity>
            </SafeAreaView>
          </SafeAreaView>
        ) : (
          <>
            <CameraView
              ref={cameraRef}
              facing={cameraFacing}
              style={StyleSheet.absoluteFillObject}
              mirror={showMirror}
              mute
              animateShutter={shutterSound}
            />
            <SafeAreaView className="flex-1 justify-between px-6 py-4">
              <View>
                <View className="flex-row items-center justify-between mb-4">
                  <TouchableOpacity onPress={onClose} className="py-1">
                    <Text className="text-white/80 text-base">← ปิด</Text>
                  </TouchableOpacity>
                  <View className="flex-row items-center gap-2">
                    <TouchableOpacity
                      onPress={() => setSettingsOpen((v) => !v)}
                      className="px-3 py-2 rounded-full bg-black/40 border border-white/20"
                    >
                      <Text className="text-white font-semibold text-sm">ตั้งค่า</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() =>
                        setCameraFacing((current) => (current === 'front' ? 'back' : 'front'))
                      }
                      className="px-4 py-2 rounded-full bg-black/40 border border-white/20"
                    >
                      <Text className="text-white font-semibold text-sm">
                        {cameraFacing === 'front' ? 'กล้องหลัง' : 'กล้องหน้า'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {settingsOpen ? (
                  <View className="mb-4 rounded-2xl bg-black/50 border border-white/15 p-4 gap-3">
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1 pr-3">
                        <Text className="text-white font-medium text-sm">กลับด้านภาพ</Text>
                        <Text className="text-white/50 text-xs mt-0.5">
                          กล้องหน้า — เหมือนกระจก (ปิด = ตรงกับรูปที่บันทึก)
                        </Text>
                      </View>
                      <Switch
                        value={mirrorPreview}
                        onValueChange={setMirrorPreview}
                        trackColor={{ false: '#3f4f46', true: '#FFC94D' }}
                        thumbColor="#fff"
                      />
                    </View>
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1 pr-3">
                        <Text className="text-white font-medium text-sm">เสียงชัตเตอร์</Text>
                        <Text className="text-white/50 text-xs mt-0.5">
                          ปิดค่าเริ่มต้น — บางเครื่องยังดังจากระบบ
                        </Text>
                      </View>
                      <Switch
                        value={shutterSound}
                        onValueChange={setShutterSound}
                        trackColor={{ false: '#3f4f46', true: '#FFC94D' }}
                        thumbColor="#fff"
                      />
                    </View>
                  </View>
                ) : null}

                <Text className="text-white text-xl font-bold">{title}</Text>
                <Text className="text-white/70 mt-2">{hint}</Text>
              </View>

              <View className="items-center">
                <View
                  className={`rounded-full border-4 border-accent/80 ${
                    cameraFacing === 'front' ? 'w-64 h-64' : 'w-72 h-48'
                  }`}
                />
              </View>

              <TouchableOpacity
                onPress={handleTakePhoto}
                disabled={capturing}
                className={`rounded-2xl py-4 items-center ${capturing ? 'bg-white/20' : 'bg-accent'}`}
              >
                {capturing ? (
                  <ActivityIndicator color="#0F2820" />
                ) : (
                  <Text className="text-background font-bold text-base">{captureLabel}</Text>
                )}
              </TouchableOpacity>
            </SafeAreaView>
          </>
        )}
      </View>
    </Modal>
  )
}
