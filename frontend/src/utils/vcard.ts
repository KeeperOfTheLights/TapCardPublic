import type { Card } from '../types'

/**
 * Generate vCard string from card data
 * vCard 3.0 format for maximum compatibility
 */
export function generateVCard(card: Card): string {
  const lines: string[] = [
    'BEGIN:VCARD',
    'VERSION:3.0',
  ]

  // Full name
  lines.push(`FN:${escapeVCard(card.name)}`)
  
  // Name components (for sorting)
  const nameParts = card.name.split(' ')
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : ''
  const firstName = nameParts.slice(0, -1).join(' ') || card.name
  lines.push(`N:${escapeVCard(lastName)};${escapeVCard(firstName)};;;`)

  // Title/Job
  if (card.title) {
    lines.push(`TITLE:${escapeVCard(card.title)}`)
  }

  // Organization/Description as note
  if (card.description) {
    lines.push(`NOTE:${escapeVCard(card.description)}`)
  }

  // Phone
  if (card.phone) {
    const formattedPhone = card.phone.startsWith('+') ? card.phone : `+${card.phone}`
    lines.push(`TEL;TYPE=CELL:${formattedPhone}`)
  }

  // Email
  if (card.email) {
    lines.push(`EMAIL;TYPE=INTERNET:${card.email}`)
  }

  // Website
  if (card.website) {
    lines.push(`URL:${card.website}`)
  }

  // City/Address
  if (card.city) {
    lines.push(`ADR;TYPE=WORK:;;;;;;${escapeVCard(card.city)}`)
  }

  // Avatar photo (if available, as URL)
  if (card.avatar_link) {
    lines.push(`PHOTO;VALUE=URI:${card.avatar_link}`)
  }

  // Social links as custom X- fields
  if (card.socials && card.socials.length > 0) {
    card.socials.filter(s => s.is_visible).forEach(social => {
      lines.push(`X-SOCIALPROFILE;TYPE=${social.type.toUpperCase()}:${social.url}`)
    })
  }

  lines.push('END:VCARD')

  return lines.join('\r\n')
}

/**
 * Escape special characters for vCard format
 */
function escapeVCard(str: string): string {
  if (!str) return ''
  return str
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
}

/**
 * Download vCard file
 */
export function downloadVCard(card: Card): void {
  const vCardContent = generateVCard(card)
  const blob = new Blob([vCardContent], { type: 'text/vcard;charset=utf-8' })
  
  // Create filename from card name
  const filename = `${card.name.replace(/[^a-zA-Zа-яА-Я0-9]/g, '_')}.vcf`
  
  // Create download link
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  
  // Trigger download
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  // Cleanup
  URL.revokeObjectURL(link.href)
}
