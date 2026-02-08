import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, CreditCard, ArrowRight, Loader2 } from 'lucide-react'
import { redeemCode } from '../api/codes'
import { useAuth } from '../context/AuthContext'
import ThemeToggle from '../components/ThemeToggle'
import { formatErrorMessage } from '../utils/errorFormatter'

export default function HomePage() {
  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { login, isAuthenticated, cardId } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) {
      setError('Пожалуйста, введите код активации')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await redeemCode(code.trim())
      login(response.access_token, response.card_id)
      navigate('/edit')
    } catch (err: any) {
      const errorMessage = formatErrorMessage(err) || 'Неверный код активации'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-500/20 dark:bg-blue-500/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-500/20 dark:bg-purple-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-full blur-3xl" />
      </div>

      {/* Floating Cards Decoration */}
      <motion.div 
        className="absolute top-20 left-10 md:left-20 opacity-20"
        animate={{ y: [-10, 10, -10], rotate: [-5, 5, -5] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <CreditCard className="w-16 h-16 text-blue-400 dark:text-blue-400" />
      </motion.div>
      <motion.div 
        className="absolute bottom-20 right-10 md:right-20 opacity-20"
        animate={{ y: [10, -10, 10], rotate: [5, -5, 5] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <CreditCard className="w-20 h-20 text-purple-400 dark:text-purple-400" />
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md z-10"
      >
        {/* Logo & Title */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 shadow-2xl shadow-purple-500/30"
          >
            <Sparkles className="w-10 h-10 text-white" />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl md:text-5xl font-bold text-dark-900 dark:text-white mb-3"
          >
            Tap<span className="text-gradient">Card</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-light-500 dark:text-dark-400 text-lg"
          >
            Ваша цифровая визитка
          </motion.p>
        </div>

        {/* Card with Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass rounded-3xl p-8 shadow-2xl"
        >
          {isAuthenticated ? (
            <div className="text-center">
              <h2 className="text-xl font-semibold text-dark-900 dark:text-white mb-4">Вы уже авторизованы</h2>
              <p className="text-light-500 dark:text-dark-400 mb-6">Вы можете перейти к редактированию или просмотру вашей визитки</p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => navigate('/edit')}
                  className="w-full py-4 px-6 rounded-2xl font-semibold text-white bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:opacity-90 transition-all duration-300 flex items-center justify-center gap-2 group shadow-lg shadow-purple-500/25"
                >
                  Редактировать
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => navigate(`/card/${cardId}`)}
                  className="w-full py-4 px-6 rounded-2xl font-semibold text-dark-900 dark:text-white bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-all duration-300"
                >
                  Просмотреть визитку
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <h2 className="text-xl font-semibold text-dark-900 dark:text-white mb-2 text-center">
                Активация визитки
              </h2>
              <p className="text-light-500 dark:text-dark-400 text-sm mb-6 text-center">
                Введите код активации, полученный вместе с вашей TapCard
              </p>

              <div className="space-y-4">
                <div>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value)
                      setError('')
                    }}
                    placeholder="Введите код активации"
                    className="w-full px-5 py-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-dark-900 dark:text-white placeholder-light-500 dark:placeholder-dark-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 text-center text-lg tracking-widest font-mono"
                  />
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 dark:text-red-400 text-sm mt-2 text-center"
                    >
                      {error}
                    </motion.p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 px-6 rounded-2xl font-semibold text-white bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group shadow-lg shadow-purple-500/25"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Активировать
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </motion.div>

        {/* Footer Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center text-light-500 dark:text-dark-500 text-sm mt-8"
        >
          Нет кода? <a href="#" className="text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300 transition-colors">Узнать больше</a>
        </motion.p>
      </motion.div>
    </div>
  )
}
