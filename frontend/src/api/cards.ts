import apiClient from './client'
import type { Card, CardPatch } from '../types'

export const getCard = async (id: number): Promise<Card> => {
  const response = await apiClient.get<Card>(`/cards/${id}/`)
  return response.data
}

export const updateCard = async (id: number, data: CardPatch): Promise<Card> => {
  const response = await apiClient.patch<Card>(`/cards/${id}/`, data)
  return response.data
}



