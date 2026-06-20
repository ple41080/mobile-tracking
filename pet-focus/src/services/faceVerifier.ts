import FaceDetection from '@react-native-ml-kit/face-detection'
import { loadTensorflowModel, TensorflowModel } from 'react-native-fast-tflite'
import * as SecureStore from 'expo-secure-store'
import {
  cosineSimilarity,
  getImageSize,
  cropFaceRegion,
  uriToFaceTensor,
} from '@/utils/imageTensor'

const EMBEDDING_KEY = 'face_embedding'
const FACE_MATCH_THRESHOLD = 0.55
const MIN_FACE_RATIO_ENROLL = 0.25
const MIN_FACE_RATIO_VERIFY = 0.08

type FaceValidationPurpose = 'enroll' | 'verify'

let modelPromise: Promise<TensorflowModel> | null = null

function getModel(): Promise<TensorflowModel> {
  if (!modelPromise) {
    modelPromise = loadTensorflowModel(
      require('../../assets/models/mobile_face_net.tflite'),
      'default'
    )
  }
  return modelPromise
}

async function computeEmbedding(uri: string): Promise<number[]> {
  const model = await getModel()
  const tensor = await uriToFaceTensor(uri)
  const outputs = await model.run([tensor])
  const embedding = Array.from(outputs[0] as Float32Array)
  const norm = Math.sqrt(embedding.reduce((sum, v) => sum + v * v, 0))
  if (norm === 0) return embedding
  return embedding.map((v) => v / norm)
}

async function validateSingleFace(uri: string, purpose: FaceValidationPurpose = 'enroll') {
  const minFaceRatio = purpose === 'enroll' ? MIN_FACE_RATIO_ENROLL : MIN_FACE_RATIO_VERIFY
  const minFaceSize = purpose === 'enroll' ? 0.15 : 0.08

  const faces = await FaceDetection.detect(uri, {
    performanceMode: 'accurate',
    landmarkMode: 'none',
    classificationMode: 'none',
    minFaceSize,
  })

  if (faces.length === 0) {
    const reason =
      purpose === 'enroll'
        ? 'ไม่พบใบหน้าในรูป ลองถ่ายใหม่ให้เห็นหน้าชัดเจน'
        : 'ไม่พบใบหน้าในรูป ให้เห็นหน้าของคุณในรูปด้วย (ไม่ต้องใกล้มาก)'
    return { ok: false as const, reason }
  }
  if (faces.length > 1) {
    return { ok: false as const, reason: 'พบมากกว่า 1 ใบหน้า ให้มีเฉพาะคุณในรูป' }
  }

  const { width: imageWidth, height: imageHeight } = await getImageSize(uri)
  const face = faces[0]
  const faceRatio = face.frame.width / imageWidth
  if (faceRatio < minFaceRatio) {
    const reason =
      purpose === 'enroll'
        ? 'ใบหน้าเล็กเกินไป ขยับเข้าใกล้กล้องอีกนิด'
        : 'ใบหน้าเล็กเกินไป ให้เห็นใบหน้าชัดพอในรูป (ไม่ต้องเต็มกรอบ)'
    return { ok: false as const, reason }
  }

  const croppedUri = await cropFaceRegion(uri, face.frame, imageWidth, imageHeight)
  return { ok: true as const, croppedUri }
}

export async function saveEmbedding(embedding: number[]): Promise<void> {
  await SecureStore.setItemAsync(EMBEDDING_KEY, JSON.stringify(embedding))
}

export async function loadEmbedding(): Promise<number[] | null> {
  const raw = await SecureStore.getItemAsync(EMBEDDING_KEY)
  if (!raw) return null
  return JSON.parse(raw) as number[]
}

export async function clearEnrollment(): Promise<void> {
  await SecureStore.deleteItemAsync(EMBEDDING_KEY)
}

export async function enrollFace(uri: string): Promise<{ success: boolean; reason?: string }> {
  const validation = await validateSingleFace(uri, 'enroll')
  if (!validation.ok) {
    return { success: false, reason: validation.reason }
  }

  try {
    const embedding = await computeEmbedding(validation.croppedUri)
    await saveEmbedding(embedding)
    return { success: true }
  } catch {
    return { success: false, reason: 'วิเคราะห์ใบหน้าไม่สำเร็จ ลองถ่ายใหม่' }
  }
}

export async function verifyFace(
  uri: string
): Promise<{ matched: boolean; similarity: number; reason?: string }> {
  const enrolled = await loadEmbedding()
  if (!enrolled) {
    return { matched: false, similarity: 0, reason: 'ยังไม่ได้ลงทะเบียนใบหน้า' }
  }

  const validation = await validateSingleFace(uri, 'verify')
  if (!validation.ok) {
    return { matched: false, similarity: 0, reason: validation.reason }
  }

  try {
    const embedding = await computeEmbedding(validation.croppedUri)
    const similarity = cosineSimilarity(enrolled, embedding)
    if (similarity >= FACE_MATCH_THRESHOLD) {
      return { matched: true, similarity }
    }
    return {
      matched: false,
      similarity,
      reason: 'ใบหน้าไม่ตรงกับที่ลงทะเบียน',
    }
  } catch {
    return { matched: false, similarity: 0, reason: 'วิเคราะห์ใบหน้าไม่สำเร็จ' }
  }
}
