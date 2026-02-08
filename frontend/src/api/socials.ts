import apiClient from './client'
import type { Social, SocialIn } from '../types'

export const createSocial = async (data: SocialIn): Promise<Social> => {
  const response = await apiClient.post<Social>('/socials/', data)
  return response.data
}

export const deleteSocial = async (socialId: number): Promise<void> => {
  await apiClient.delete(`/socials/${socialId}/`)
}



