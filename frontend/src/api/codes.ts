import apiClient from './client'
import type { CodeRedeemResponse } from '../types'

export const redeemCode = async (code: string): Promise<CodeRedeemResponse> => {
  const response = await apiClient.post<CodeRedeemResponse>('/codes/redeem/', { code })
  return response.data
}



