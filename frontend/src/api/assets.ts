import apiClient from './client'
import type { AssetOut } from '../types'
import { compressAvatar, compressLogo } from '../utils/imageCompression'

export const uploadAvatar = async (file: File): Promise<AssetOut> => {
  // Compress image before upload
  const compressedFile = await compressAvatar(file)
  
  const formData = new FormData()
  // Append file with explicit filename
  formData.append('file', compressedFile, compressedFile.name)
  
  // Don't set Content-Type header - let browser set it with boundary automatically
  const response = await apiClient.post<AssetOut>('/assets/avatar/', formData)
  return response.data
}

export const uploadLogo = async (socialId: number, file: File): Promise<AssetOut> => {
  // Compress image before upload
  const compressedFile = await compressLogo(file)
  
  const formData = new FormData()
  // Append social_id first, then file with explicit filename
  formData.append('social_id', socialId.toString())
  formData.append('file', compressedFile, compressedFile.name)
  
  // Don't set Content-Type header - let browser set it with boundary automatically
  const response = await apiClient.post<AssetOut>('/assets/logo/', formData)
  return response.data
}
