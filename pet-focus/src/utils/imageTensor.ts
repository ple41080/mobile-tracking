import { Image } from 'react-native'
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator'
import { decode } from 'jpeg-js'
import { Buffer } from 'buffer'
import type { Frame } from '@react-native-ml-kit/face-detection'

export const FACE_INPUT_SIZE = 112

export function todayKey(): string {
  return new Date().toISOString().split('T')[0]
}

export function getImageSize(uri: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    Image.getSize(uri, (width, height) => resolve({ width, height }), reject)
  })
}

export async function resizeToFaceInput(uri: string): Promise<string> {
  const result = await manipulateAsync(
    uri,
    [{ resize: { width: FACE_INPUT_SIZE, height: FACE_INPUT_SIZE } }],
    { compress: 1, format: SaveFormat.JPEG, base64: false }
  )
  return result.uri
}

export async function cropFaceRegion(
  uri: string,
  frame: Frame,
  imageWidth: number,
  imageHeight: number
): Promise<string> {
  const padding = 0.15
  const padW = frame.width * padding
  const padH = frame.height * padding

  const originX = Math.max(0, Math.floor(frame.left - padW))
  const originY = Math.max(0, Math.floor(frame.top - padH))
  const width = Math.min(imageWidth - originX, Math.ceil(frame.width + padW * 2))
  const height = Math.min(imageHeight - originY, Math.ceil(frame.height + padH * 2))

  const cropped = await manipulateAsync(
    uri,
    [{ crop: { originX, originY, width, height } }],
    { compress: 0.9, format: SaveFormat.JPEG, base64: false }
  )
  return resizeToFaceInput(cropped.uri)
}

export async function uriToFaceTensor(uri: string): Promise<Float32Array> {
  const resized = await manipulateAsync(
    uri,
    [{ resize: { width: FACE_INPUT_SIZE, height: FACE_INPUT_SIZE } }],
    { compress: 1, format: SaveFormat.JPEG, base64: true }
  )

  if (!resized.base64) {
    throw new Error('Failed to read image data')
  }

  const { data, width, height } = decode(Buffer.from(resized.base64, 'base64'))
  if (width !== FACE_INPUT_SIZE || height !== FACE_INPUT_SIZE) {
    throw new Error('Unexpected image size after resize')
  }

  const pixels = FACE_INPUT_SIZE * FACE_INPUT_SIZE * 3
  const tensor = new Float32Array(pixels)
  for (let i = 0; i < FACE_INPUT_SIZE * FACE_INPUT_SIZE; i++) {
    tensor[i * 3] = (data[i * 4] - 127.5) / 128
    tensor[i * 3 + 1] = (data[i * 4 + 1] - 127.5) / 128
    tensor[i * 3 + 2] = (data[i * 4 + 2] - 127.5) / 128
  }
  return tensor
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0
  let dot = 0
  let normA = 0
  let normB = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB)
  return denom === 0 ? 0 : dot / denom
}
