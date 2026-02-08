import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { Card } from '../types'
import { getCard } from '../api/cards'

interface AuthContextType {
  isAuthenticated: boolean
  cardId: number | null
  card: Card | null
  token: string | null
  login: (token: string, cardId: number) => void
  logout: () => void
  refreshCard: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('access_token'))
  const [cardId, setCardId] = useState<number | null>(() => {
    const stored = localStorage.getItem('card_id')
    return stored ? parseInt(stored) : null
  })
  const [card, setCard] = useState<Card | null>(null)

  const isAuthenticated = !!token && !!cardId

  const login = (newToken: string, newCardId: number) => {
    localStorage.setItem('access_token', newToken)
    localStorage.setItem('card_id', newCardId.toString())
    setToken(newToken)
    setCardId(newCardId)
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('card_id')
    setToken(null)
    setCardId(null)
    setCard(null)
  }

  const refreshCard = async () => {
    if (cardId) {
      try {
        const cardData = await getCard(cardId)
        setCard(cardData)
      } catch (error) {
        console.error('Failed to refresh card:', error)
      }
    }
  }

  useEffect(() => {
    if (cardId) {
      refreshCard()
    }
  }, [cardId])

  return (
    <AuthContext.Provider value={{ isAuthenticated, cardId, card, token, login, logout, refreshCard }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}



