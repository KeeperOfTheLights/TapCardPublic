export type SocialType = 'instagram' | 'telegram' | 'tiktok' | 'youtube' | 'custom'

export interface Social {
  id: number
  card_id: number
  type: SocialType
  url: string
  label: string
  order_id: number
  icon_asset_id: number | null
  is_visible: boolean
  created_at: string
  app_icon_link: string | null
}

export interface Card {
  id: number
  name: string
  title: string
  description: string
  phone: string
  email: string
  website: string
  city: string
  is_active: boolean
  created_at: string
  updated_at: string
  socials: Social[]
  avatar_link: string | null
}

export interface CardPatch {
  name?: string
  title?: string
  description?: string
  phone?: string
  email?: string
  website?: string
  city?: string
}

export interface SocialIn {
  type: SocialType
  url: string
  label: string
}

export interface CodeRedeemResponse {
  access_token: string
  token_type: string
  card_id: number
}

export interface AssetOut {
  id: number
  card_id: number
  type: string
  file_name: string
  created_at: string
}



