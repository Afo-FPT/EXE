'use client'
import { useState } from 'react'
import { Icon } from '@iconify/react'
import Link from 'next/link'
import { buildApiUrl } from '@/config/api'

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch(buildApiUrl('/password-reset/forgot-password'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSuccess(true)
      } else {
        setError(data.message || 'Có lỗi xảy ra khi gửi email reset mật khẩu')
      }
    } catch (error) {
      console.error('Error sending reset password request:', error)
      setError('Có lỗi xảy ra khi gửi email reset mật khẩu')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm p-8 text-center">
          <Icon icon="solar:check-circle-bold" className="text-green-500 text-6xl mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Email đã được gửi!</h1>
          <p className="text-gray-600 mb-6">
            Chúng tôi đã gửi link đặt lại mật khẩu đến email <strong>{email}</strong>. 
            Vui lòng kiểm tra hộp thư và làm theo hướng dẫn.
          </p>
          <div className="space-y-3">
            <Link
              href="/signin"
              className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary/90 transition-colors block"
            >
              Quay lại đăng nhập
            </Link>
            <button
              onClick={() => {
                setSuccess(false)
                setEmail('')
              }}
              className="w-full bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Gửi lại email
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm p-8">
        <div className="text-center mb-8">
          <Icon icon="solar:lock-password-bold" className="text-primary text-6xl mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Quên mật khẩu?</h1>
          <p className="text-gray-600">
            Nhập email của bạn để nhận link đặt lại mật khẩu
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Nhập email của bạn"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Icon icon="solar:danger-circle-bold" className="text-red-600 text-lg" />
                <span className="text-red-700">{error}</span>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !email}
            className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <Icon icon="solar:loading-bold" className="text-lg animate-spin" />
                Đang gửi...
              </div>
            ) : (
              'Gửi link đặt lại mật khẩu'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Nhớ mật khẩu?{' '}
            <Link href="/signin" className="text-primary hover:text-primary/80 font-medium">
              Đăng nhập
            </Link>
          </p>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <Icon icon="solar:info-circle-bold" className="text-blue-600 text-lg mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900 mb-1">Lưu ý</h3>
              <p className="text-blue-700 text-sm">
                Link đặt lại mật khẩu sẽ có hiệu lực trong 24 giờ. 
                Nếu không nhận được email, hãy kiểm tra thư mục spam.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordPage