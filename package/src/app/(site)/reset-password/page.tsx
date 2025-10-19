'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Icon } from '@iconify/react'
import Link from 'next/link'
import { buildApiUrl } from '@/config/api'

const ResetPasswordContent = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [tokenValid, setTokenValid] = useState(false)
  const [tokenLoading, setTokenLoading] = useState(true)

  // Verify token when component mounts
  useEffect(() => {
    if (!token) {
      setError('Token không hợp lệ')
      setTokenLoading(false)
      return
    }

    const verifyToken = async () => {
      try {
        const response = await fetch(buildApiUrl(`/password-reset/verify-token/${token}`))
        const data = await response.json()

        if (response.ok && data.success) {
          setTokenValid(true)
        } else {
          setError(data.message || 'Token không hợp lệ hoặc đã hết hạn')
        }
      } catch (error) {
        console.error('Error verifying token:', error)
        setError('Có lỗi xảy ra khi xác thực token')
      } finally {
        setTokenLoading(false)
      }
    }

    verifyToken()
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validation
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Mật khẩu mới và xác nhận mật khẩu không khớp')
      setLoading(false)
      return
    }

    if (formData.newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự')
      setLoading(false)
      return
    }

    try {
      const response = await fetch(buildApiUrl('/password-reset/reset-password'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token,
          newPassword: formData.newPassword
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSuccess(true)
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/signin')
        }, 3000)
      } else {
        setError(data.message || 'Có lỗi xảy ra khi đặt lại mật khẩu')
      }
    } catch (error) {
      console.error('Error resetting password:', error)
      setError('Có lỗi xảy ra khi đặt lại mật khẩu')
    } finally {
      setLoading(false)
    }
  }

  if (tokenLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Icon icon="solar:loading-bold" className="text-6xl text-primary mx-auto mb-4 animate-spin" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Đang xác thực...</h2>
          <p className="text-gray-600">Vui lòng chờ trong giây lát</p>
        </div>
      </div>
    )
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm p-8 text-center">
          <Icon icon="solar:danger-circle-bold" className="text-red-500 text-6xl mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Token không hợp lệ</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <Link
              href="/forgotpassword"
              className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary/90 transition-colors block"
            >
              Yêu cầu link mới
            </Link>
            <Link
              href="/signin"
              className="w-full bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 transition-colors block"
            >
              Quay lại đăng nhập
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm p-8 text-center">
          <Icon icon="solar:check-circle-bold" className="text-green-500 text-6xl mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Thành công!</h1>
          <p className="text-gray-600 mb-6">
            Mật khẩu của bạn đã được đặt lại thành công. 
            Bạn sẽ được chuyển hướng đến trang đăng nhập trong giây lát.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <Icon icon="solar:check-circle-bold" className="text-green-600 text-lg" />
              <span className="text-green-700">Mật khẩu đã được cập nhật</span>
            </div>
          </div>
          <Link
            href="/signin"
            className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary/90 transition-colors block"
          >
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm p-8">
        <div className="text-center mb-8">
          <Icon icon="solar:lock-password-bold" className="text-primary text-6xl mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Đặt lại mật khẩu</h1>
          <p className="text-gray-600">
            Nhập mật khẩu mới cho tài khoản của bạn
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mật khẩu mới
            </label>
            <input
              type="password"
              value={formData.newPassword}
              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Nhập mật khẩu mới"
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Xác nhận mật khẩu mới
            </label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Nhập lại mật khẩu mới"
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
            disabled={loading || !formData.newPassword || !formData.confirmPassword}
            className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <Icon icon="solar:loading-bold" className="text-lg animate-spin" />
                Đang xử lý...
              </div>
            ) : (
              'Đặt lại mật khẩu'
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
              <h3 className="font-medium text-blue-900 mb-1">Yêu cầu mật khẩu</h3>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• Ít nhất 6 ký tự</li>
                <li>• Nên bao gồm chữ hoa, chữ thường và số</li>
                <li>• Tránh sử dụng thông tin cá nhân</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const ResetPasswordPage = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Icon icon="solar:loading-bold" className="text-6xl text-primary mx-auto mb-4 animate-spin" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Đang tải...</h2>
          <p className="text-gray-600">Vui lòng chờ trong giây lát</p>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}

export default ResetPasswordPage

