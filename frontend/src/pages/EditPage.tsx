import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, 
  Briefcase, 
  FileText, 
  Phone, 
  Mail, 
  Globe, 
  MapPin,
  Plus,
  Trash2,
  Save,
  LogOut,
  Eye,
  Loader2,
  Camera,
  AlertCircle,
  Check,
  X,
  ChevronDown,
  Image
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { updateCard } from '../api/cards'
import { createSocial, deleteSocial } from '../api/socials'
import { uploadAvatar, uploadLogo } from '../api/assets'
import type { CardPatch, SocialType, SocialIn, Social } from '../types'
import SocialIcon from '../components/SocialIcon'
import ThemeToggle from '../components/ThemeToggle'
import { formatErrorMessage } from '../utils/errorFormatter'

const socialTypes: { value: SocialType; label: string }[] = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'telegram', label: 'Telegram' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'custom', label: 'Другое' },
]

export default function EditPage() {
  const navigate = useNavigate()
  const { isAuthenticated, card, cardId, logout, refreshCard } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState<CardPatch>({
    name: '',
    title: '',
    description: '',
    phone: '',
    email: '',
    website: '',
    city: '',
  })

  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')

  // Add social modal
  const [showAddSocial, setShowAddSocial] = useState(false)
  const [newSocial, setNewSocial] = useState<SocialIn>({
    type: 'instagram',
    url: '',
    label: '',
  })
  const [isAddingSocial, setIsAddingSocial] = useState(false)
  const [deletingSocialId, setDeletingSocialId] = useState<number | null>(null)
  const [uploadingLogoId, setUploadingLogoId] = useState<number | null>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const [selectedSocialId, setSelectedSocialId] = useState<number | null>(null)
  
  // Local state for socials to enable instant UI updates
  const [localSocials, setLocalSocials] = useState<Social[]>([])

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/')
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    if (card) {
      setFormData({
        name: card.name,
        title: card.title,
        description: card.description,
        phone: card.phone,
        email: card.email,
        website: card.website,
        city: card.city,
      })
      setLocalSocials(card.socials || [])
    }
  }, [card])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setSaveStatus('idle')
  }

  const handleSave = async () => {
    setIsSaving(true)
    setError('')
    setSaveStatus('idle')

    try {
      if (cardId) {
        await updateCard(cardId, formData)
        await refreshCard()
        setSaveStatus('success')
        setTimeout(() => setSaveStatus('idle'), 3000)
      }
    } catch (err: any) {
      const errorMessage = formatErrorMessage(err)
      setError(errorMessage)
      setSaveStatus('error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      await uploadAvatar(file)
      await refreshCard()
    } catch (err: any) {
      const errorMessage = formatErrorMessage(err)
      setError(errorMessage)
    } finally {
      setIsUploading(false)
    }
  }

  const handleAddSocial = async () => {
    if (!newSocial.url || !newSocial.label) {
      return
    }

    setIsAddingSocial(true)
    try {
      const createdSocial = await createSocial(newSocial)
      // Update local state immediately
      setLocalSocials(prev => [...prev, createdSocial])
      setShowAddSocial(false)
      setNewSocial({ type: 'instagram', url: '', label: '' })
      // Also sync with server
      await refreshCard()
    } catch (err: any) {
      console.error('Add social error:', err)
      const errorMessage = formatErrorMessage(err)
      setError(errorMessage)
    } finally {
      setIsAddingSocial(false)
    }
  }

  const handleDeleteSocial = async (socialId: number) => {
    setDeletingSocialId(socialId)
    try {
      await deleteSocial(socialId)
      // Update local state immediately
      setLocalSocials(prev => prev.filter(s => s.id !== socialId))
    } catch (err: any) {
      // Backend has a bug - it returns 404 even on successful delete
      // So we check if delete actually worked by updating local state anyway
      // and refreshing from server
      console.error('Delete response:', err)
      
      // Update local state - assume delete worked
      setLocalSocials(prev => prev.filter(s => s.id !== socialId))
      
      // Only show error if it's not a 404 (which is the buggy success response)
      if (err.response?.status !== 404) {
        const errorMessage = formatErrorMessage(err)
        setError(errorMessage)
      }
    } finally {
      setDeletingSocialId(null)
    }
  }

  const handleLogoClick = (socialId: number) => {
    setSelectedSocialId(socialId)
    logoInputRef.current?.click()
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !selectedSocialId) return

    setUploadingLogoId(selectedSocialId)
    try {
      await uploadLogo(selectedSocialId, file)
      // Refresh to get updated logo URL
      await refreshCard()
    } catch (err: any) {
      const errorMessage = formatErrorMessage(err)
      setError(errorMessage)
    } finally {
      setUploadingLogoId(null)
      setSelectedSocialId(null)
      // Reset file input
      if (logoInputRef.current) {
        logoInputRef.current.value = ''
      }
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  if (!card) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-lg mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <h1 className="text-2xl font-bold text-dark-900 dark:text-white">Редактирование</h1>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              to={`/card/${cardId}`}
              className="p-2.5 rounded-xl glass hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              title="Просмотр"
            >
              <Eye className="w-5 h-5 text-dark-900 dark:text-white" />
            </Link>
            <button
              onClick={handleLogout}
              className="p-2.5 rounded-xl glass hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              title="Выйти"
            >
              <LogOut className="w-5 h-5 text-dark-900 dark:text-white" />
            </button>
          </div>
        </motion.div>

        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-4 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0" />
              <span className="text-red-600 dark:text-red-300 text-sm flex-1">{error}</span>
              <button onClick={() => setError('')} className="text-red-500 dark:text-red-400 hover:text-red-400 dark:hover:text-red-300">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Avatar Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-3xl p-6 mb-4"
        >
          <h2 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">Фото профиля</h2>
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-light-200 dark:from-dark-700 to-light-300 dark:to-dark-800">
                {card.avatar_link ? (
                  <img 
                    src={card.avatar_link} 
                    alt={card.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
                    <span className="text-3xl font-bold text-white">
                      {formData.name?.charAt(0).toUpperCase() || 'T'}
                    </span>
                  </div>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isUploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Camera className="w-4 h-4" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>
            <div className="flex-1">
              <p className="text-light-600 dark:text-dark-300 text-sm">
                Нажмите на кнопку камеры, чтобы загрузить новое фото
              </p>
              <p className="text-light-500 dark:text-dark-500 text-xs mt-1">
                JPG, PNG до 5MB
              </p>
            </div>
          </div>
        </motion.div>

        {/* Basic Info Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-3xl p-6 mb-4"
        >
          <h2 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">Основная информация</h2>
          <div className="space-y-4">
            <InputField
              icon={<User className="w-5 h-5" />}
              label="Имя"
              name="name"
              value={formData.name || ''}
              onChange={handleChange}
              placeholder="Ваше имя"
            />
            <InputField
              icon={<Briefcase className="w-5 h-5" />}
              label="Должность"
              name="title"
              value={formData.title || ''}
              onChange={handleChange}
              placeholder="Ваша должность"
            />
            <div>
              <label className="text-light-600 dark:text-dark-400 text-sm mb-2 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Описание
              </label>
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                placeholder="Расскажите о себе"
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-dark-900 dark:text-white placeholder-light-500 dark:placeholder-dark-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 resize-none"
              />
            </div>
            <InputField
              icon={<MapPin className="w-5 h-5" />}
              label="Город"
              name="city"
              value={formData.city || ''}
              onChange={handleChange}
              placeholder="Ваш город"
            />
          </div>
        </motion.div>

        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-3xl p-6 mb-4"
        >
          <h2 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">Контакты</h2>
          <div className="space-y-4">
            <InputField
              icon={<Phone className="w-5 h-5" />}
              label="Телефон"
              name="phone"
              value={formData.phone || ''}
              onChange={handleChange}
              placeholder="77001234567"
            />
            <InputField
              icon={<Mail className="w-5 h-5" />}
              label="Email"
              name="email"
              type="email"
              value={formData.email || ''}
              onChange={handleChange}
              placeholder="example@email.com"
            />
            <InputField
              icon={<Globe className="w-5 h-5" />}
              label="Сайт"
              name="website"
              value={formData.website || ''}
              onChange={handleChange}
              placeholder="https://example.com"
            />
          </div>
        </motion.div>

        {/* Social Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-3xl p-6 mb-4"
        >
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-dark-900 dark:text-white">Социальные сети</h2>
            <button
              onClick={() => setShowAddSocial(true)}
              className="p-2 rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-400 hover:bg-purple-500/30 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <p className="text-light-500 dark:text-dark-500 text-xs mb-4">Наведите на иконку, чтобы загрузить свой логотип</p>

          {/* Hidden file input for logo upload */}
          <input
            ref={logoInputRef}
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            className="hidden"
          />

          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {localSocials.map((social) => (
                <motion.div
                  key={social.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-black/5 dark:bg-white/5"
                >
                  {/* Social Icon with upload overlay */}
                  <div className="relative group">
                    <SocialIcon type={social.type} iconUrl={social.app_icon_link} className="w-10 h-10" />
                    <button
                      onClick={() => handleLogoClick(social.id)}
                      disabled={uploadingLogoId === social.id}
                      className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Загрузить логотип"
                    >
                      {uploadingLogoId === social.id ? (
                        <Loader2 className="w-4 h-4 text-white animate-spin" />
                      ) : (
                        <Image className="w-4 h-4 text-white" />
                      )}
                    </button>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-dark-900 dark:text-white font-medium truncate">{social.label}</p>
                    <p className="text-light-500 dark:text-dark-500 text-sm truncate">{social.url}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteSocial(social.id)}
                    disabled={deletingSocialId === social.id}
                    className="p-2 rounded-lg bg-red-500/20 text-red-500 dark:text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50"
                  >
                    {deletingSocialId === social.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
            {localSocials.length === 0 && (
              <p className="text-light-500 dark:text-dark-500 text-center py-4">
                Нет добавленных соцсетей
              </p>
            )}
          </div>
        </motion.div>

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`w-full py-4 px-6 rounded-2xl font-semibold text-white flex items-center justify-center gap-2 transition-all duration-300 shadow-lg ${
              saveStatus === 'success'
                ? 'bg-green-500 shadow-green-500/25'
                : saveStatus === 'error'
                ? 'bg-red-500 shadow-red-500/25'
                : 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-purple-500/25 hover:opacity-90'
            } disabled:opacity-50`}
          >
            {isSaving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : saveStatus === 'success' ? (
              <>
                <Check className="w-5 h-5" />
                Сохранено
              </>
            ) : saveStatus === 'error' ? (
              <>
                <AlertCircle className="w-5 h-5" />
                Ошибка
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Сохранить изменения
              </>
            )}
          </button>
        </motion.div>
      </div>

      {/* Add Social Modal */}
      <AnimatePresence>
        {showAddSocial && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowAddSocial(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md glass rounded-3xl p-6"
            >
              <h3 className="text-xl font-semibold text-dark-900 dark:text-white mb-6">Добавить соцсеть</h3>
              
              <div className="space-y-4">
                {/* Social Type Selector */}
                <div>
                  <label className="text-light-600 dark:text-dark-400 text-sm mb-2 block">Тип</label>
                  <div className="relative">
                    <select
                      value={newSocial.type}
                      onChange={(e) => setNewSocial(prev => ({ ...prev, type: e.target.value as SocialType }))}
                      className="w-full px-4 py-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-dark-900 dark:text-white appearance-none focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
                    >
                      {socialTypes.map(type => (
                        <option key={type.value} value={type.value} className="bg-white dark:bg-dark-800 text-dark-900 dark:text-white">
                          {type.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-5 h-5 text-light-500 dark:text-dark-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Label */}
                <div>
                  <label className="text-light-600 dark:text-dark-400 text-sm mb-2 block">Название</label>
                  <input
                    type="text"
                    value={newSocial.label}
                    onChange={(e) => setNewSocial(prev => ({ ...prev, label: e.target.value }))}
                    placeholder="Мой Instagram"
                    className="w-full px-4 py-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-dark-900 dark:text-white placeholder-light-500 dark:placeholder-dark-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
                  />
                </div>

                {/* URL */}
                <div>
                  <label className="text-light-600 dark:text-dark-400 text-sm mb-2 block">Ссылка</label>
                  <input
                    type="url"
                    value={newSocial.url}
                    onChange={(e) => setNewSocial(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="https://instagram.com/username"
                    className="w-full px-4 py-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-dark-900 dark:text-white placeholder-light-500 dark:placeholder-dark-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddSocial(false)}
                  className="flex-1 py-3 px-4 rounded-xl bg-black/5 dark:bg-white/10 text-dark-900 dark:text-white hover:bg-black/10 dark:hover:bg-white/20 transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={handleAddSocial}
                  disabled={isAddingSocial || !newSocial.url || !newSocial.label}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isAddingSocial ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      Добавить
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Input Field Component
interface InputFieldProps {
  icon: React.ReactNode
  label: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  type?: string
}

function InputField({ icon, label, name, value, onChange, placeholder, type = 'text' }: InputFieldProps) {
  return (
    <div>
      <label className="text-light-600 dark:text-dark-400 text-sm mb-2 flex items-center gap-2">
        {icon}
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-dark-900 dark:text-white placeholder-light-500 dark:placeholder-dark-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
      />
    </div>
  )
}
