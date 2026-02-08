import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Phone, 
  Mail, 
  Globe, 
  MapPin, 
  Share2, 
  Download, 
  Loader2, 
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
  Edit3
} from 'lucide-react'
import { getCard } from '../api/cards'
import { useAuth } from '../context/AuthContext'
import type { Card, Social } from '../types'
import SocialIcon from '../components/SocialIcon'
import ThemeToggle from '../components/ThemeToggle'
import { downloadVCard } from '../utils/vcard'

export default function CardPage() {
  const { id } = useParams<{ id: string }>()
  const { isAuthenticated, cardId } = useAuth()
  const [card, setCard] = useState<Card | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)
  
  // Check if the logged-in user owns this card
  const isOwner = isAuthenticated && cardId === parseInt(id || '0')

  useEffect(() => {
    const fetchCard = async () => {
      if (!id) return
      
      try {
        const cardData = await getCard(parseInt(id))
        setCard(cardData)
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Не удалось загрузить визитку')
      } finally {
        setIsLoading(false)
      }
    }

    fetchCard()
  }, [id])

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: card?.name || 'TapCard',
          text: `${card?.name} - ${card?.title}`,
          url: window.location.href,
        })
      } catch (err) {
        setShowShareMenu(true)
      }
    } else {
      setShowShareMenu(true)
    }
  }

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const formatPhone = (phone: string) => {
    // Format: +7 (XXX) XXX-XX-XX
    if (phone.length === 11) {
      return `+${phone[0]} (${phone.slice(1, 4)}) ${phone.slice(4, 7)}-${phone.slice(7, 9)}-${phone.slice(9)}`
    }
    return phone
  }

  const handlePhoneClick = () => {
    if (card?.phone) {
      window.location.href = `tel:+${card.phone}`
    }
  }

  const handleEmailClick = () => {
    if (card?.email) {
      window.location.href = `mailto:${card.email}`
    }
  }

  const handleWebsiteClick = () => {
    if (card?.website) {
      window.open(ensureAbsoluteUrl(card.website), '_blank')
    }
  }

  const ensureAbsoluteUrl = (url: string): string => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url
    }
    return `https://${url}`
  }

  const handleSocialClick = (social: Social) => {
    window.open(ensureAbsoluteUrl(social.url), '_blank')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
          <p className="text-light-500 dark:text-dark-400">Загрузка визитки...</p>
        </motion.div>
      </div>
    )
  }

  if (error || !card) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl p-8 max-w-md w-full text-center"
        >
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-dark-900 dark:text-white mb-2">Ошибка</h2>
          <p className="text-light-500 dark:text-dark-400 mb-6">{error || 'Визитка не найдена'}</p>
          <Link 
            to="/"
            className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300 transition-colors"
          >
            Вернуться на главную
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start py-8 px-4 relative overflow-hidden">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl" />
      </div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md z-10"
      >
        {/* Profile Section */}
        <div className="glass rounded-3xl overflow-hidden shadow-2xl">
          {/* Header with gradient */}
          <div className="h-32 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 relative">
            <div className="absolute inset-0 bg-black/20" />
            
            {/* Header Buttons */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
              {isOwner && (
                <Link
                  to="/edit"
                  className="p-2.5 rounded-xl bg-white/20 hover:bg-white/30 transition-colors backdrop-blur-sm"
                  title="Редактировать"
                >
                  <Edit3 className="w-5 h-5 text-white" />
                </Link>
              )}
              <button
                onClick={handleShare}
                className="p-2.5 rounded-xl bg-white/20 hover:bg-white/30 transition-colors backdrop-blur-sm"
              >
                <Share2 className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Avatar */}
          <div className="relative px-6">
            <motion.div
              initial={{ scale: 0, y: -50 }}
              animate={{ scale: 1, y: -50 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="w-28 h-28 rounded-2xl bg-gradient-to-br from-light-200 dark:from-dark-800 to-light-300 dark:to-dark-900 border-4 border-white dark:border-dark-900 overflow-hidden shadow-2xl"
            >
              {card.avatar_link ? (
                <img 
                  src={card.avatar_link} 
                  alt={card.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
                  <span className="text-3xl font-bold text-white">
                    {card.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </motion.div>
          </div>

          {/* Info */}
          <div className="px-6 pb-6 -mt-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h1 className="text-2xl font-bold text-dark-900 dark:text-white mb-1">{card.name}</h1>
              <p className="text-purple-600 dark:text-purple-400 font-medium mb-3">{card.title}</p>
              <p className="text-light-600 dark:text-dark-400 text-sm leading-relaxed mb-4">{card.description}</p>
              
              {/* Location */}
              <div className="flex items-center gap-2 text-light-500 dark:text-dark-500 text-sm">
                <MapPin className="w-4 h-4" />
                <span>{card.city}</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Contact Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-4 grid grid-cols-3 gap-3"
        >
          <button
            onClick={handlePhoneClick}
            className="glass rounded-2xl p-4 flex flex-col items-center gap-2 hover:bg-black/5 dark:hover:bg-white/10 transition-colors group"
          >
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Phone className="w-6 h-6 text-green-500 dark:text-green-400" />
            </div>
            <span className="text-light-600 dark:text-dark-400 text-xs">Позвонить</span>
          </button>
          
          <button
            onClick={handleEmailClick}
            className="glass rounded-2xl p-4 flex flex-col items-center gap-2 hover:bg-black/5 dark:hover:bg-white/10 transition-colors group"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Mail className="w-6 h-6 text-blue-500 dark:text-blue-400" />
            </div>
            <span className="text-light-600 dark:text-dark-400 text-xs">Email</span>
          </button>
          
          <button
            onClick={handleWebsiteClick}
            className="glass rounded-2xl p-4 flex flex-col items-center gap-2 hover:bg-black/5 dark:hover:bg-white/10 transition-colors group"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Globe className="w-6 h-6 text-purple-500 dark:text-purple-400" />
            </div>
            <span className="text-light-600 dark:text-dark-400 text-xs">Сайт</span>
          </button>
        </motion.div>

        {/* Contact Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-4 glass rounded-2xl p-4 space-y-3"
        >
          <div className="flex items-center gap-3 text-dark-700 dark:text-dark-300">
            <Phone className="w-5 h-5 text-light-500 dark:text-dark-500" />
            <span className="text-sm">{formatPhone(card.phone)}</span>
          </div>
          <div className="flex items-center gap-3 text-dark-700 dark:text-dark-300">
            <Mail className="w-5 h-5 text-light-500 dark:text-dark-500" />
            <span className="text-sm">{card.email}</span>
          </div>
          <div className="flex items-center gap-3 text-dark-700 dark:text-dark-300">
            <Globe className="w-5 h-5 text-light-500 dark:text-dark-500" />
            <span className="text-sm truncate">{card.website}</span>
          </div>
        </motion.div>

        {/* Social Links */}
        {card.socials && card.socials.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-4"
          >
            <h3 className="text-light-600 dark:text-dark-400 text-sm font-medium mb-3 px-1">Социальные сети</h3>
            <div className="space-y-2">
              {card.socials.filter(s => s.is_visible).map((social, index) => (
                <motion.button
                  key={social.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  onClick={() => handleSocialClick(social)}
                  className="w-full glass rounded-2xl p-4 flex items-center gap-4 hover:bg-black/5 dark:hover:bg-white/10 transition-colors group"
                >
                  <SocialIcon type={social.type} iconUrl={social.app_icon_link} />
                  <div className="flex-1 text-left">
                    <p className="text-dark-900 dark:text-white font-medium">{social.label}</p>
                    <p className="text-light-500 dark:text-dark-500 text-sm truncate">{social.url}</p>
                  </div>
                  <ExternalLink className="w-5 h-5 text-light-500 dark:text-dark-500 group-hover:text-dark-900 dark:group-hover:text-white transition-colors" />
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Save Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-6"
        >
          <button 
            onClick={() => downloadVCard(card)}
            className="w-full py-4 px-6 rounded-2xl font-semibold text-white bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:opacity-90 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25"
          >
            <Download className="w-5 h-5" />
            Сохранить контакт
          </button>
        </motion.div>

        {/* Powered by */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-light-400 dark:text-dark-600 text-xs mt-6"
        >
          Powered by TapCard
        </motion.p>
      </motion.div>

      {/* Share Menu Modal */}
      <AnimatePresence>
        {showShareMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center p-4"
            onClick={() => setShowShareMenu(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md glass rounded-3xl p-6"
            >
              <h3 className="text-xl font-semibold text-dark-900 dark:text-white mb-4 text-center">Поделиться визиткой</h3>
              
              <button
                onClick={copyToClipboard}
                className="w-full py-4 px-6 rounded-2xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors flex items-center justify-center gap-3 mb-3"
              >
                {copied ? (
                  <>
                    <Check className="w-5 h-5 text-green-500 dark:text-green-400" />
                    <span className="text-green-600 dark:text-green-400 font-medium">Скопировано!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5 text-dark-900 dark:text-white" />
                    <span className="text-dark-900 dark:text-white font-medium">Копировать ссылку</span>
                  </>
                )}
              </button>
              
              <button
                onClick={() => setShowShareMenu(false)}
                className="w-full py-3 text-light-500 dark:text-dark-400 hover:text-dark-900 dark:hover:text-white transition-colors"
              >
                Отмена
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
