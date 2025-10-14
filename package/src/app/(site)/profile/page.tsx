'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Icon } from '@iconify/react'

const ProfilePage = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [showChangePassword, setShowChangePassword] = useState(false)

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Icon icon="solar:user-bold" className="text-6xl text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Vui lòng đăng nhập</h2>
          <p className="text-gray-600">Bạn cần đăng nhập để xem hồ sơ cá nhân</p>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'profile', label: 'Thông tin cá nhân', icon: 'solar:user-bold' },
    { id: 'orders', label: 'Lịch sử mua hàng', icon: 'solar:bag-bold' },
    { id: 'security', label: 'Bảo mật', icon: 'solar:shield-bold' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              <Icon icon="solar:user-bold" className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user.username}</h1>
              <p className="text-gray-600">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon icon={tab.icon} className="text-lg" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Thông tin cá nhân</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tên đăng nhập
                    </label>
                    <p className="px-3 py-2 bg-gray-50 rounded-lg">{user.username}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <p className="px-3 py-2 bg-gray-50 rounded-lg">{user.email}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vai trò
                    </label>
                    <p className="px-3 py-2 bg-gray-50 rounded-lg">{user.role}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ID người dùng
                    </label>
                    <p className="px-3 py-2 bg-gray-50 rounded-lg text-sm">{user._id}</p>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon icon="solar:shield-warning-bold" className="text-yellow-600 text-xl" />
                    <span className="font-medium text-yellow-800">Bảo mật</span>
                  </div>
                  <p className="text-yellow-700 mb-3">Để bảo vệ tài khoản của bạn, hãy thường xuyên thay đổi mật khẩu</p>
                  <button
                    onClick={() => setShowChangePassword(true)}
                    className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
                  >
                    Đổi mật khẩu
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Lịch sử mua hàng</h2>
                
                <div className="text-center py-12">
                  <Icon icon="solar:bag-bold" className="text-6xl text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có đơn hàng nào</h3>
                  <p className="text-gray-600 mb-6">Bạn chưa có đơn hàng nào trong lịch sử</p>
                  <a
                    href="/store"
                    className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Mua sắm ngay
                  </a>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Bảo mật tài khoản</h2>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Mật khẩu</h3>
                  <p className="text-gray-600 mb-4">Quản lý mật khẩu và các thiết lập bảo mật</p>
                  <button
                    onClick={() => setShowChangePassword(true)}
                    className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Đổi mật khẩu
                  </button>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Quên mật khẩu?</h3>
                  <p className="text-gray-600 mb-4">Nếu bạn quên mật khẩu, chúng tôi có thể gửi link reset qua email</p>
                  <button
                    onClick={() => window.location.href = '/forgotpassword'}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Đặt lại mật khẩu
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showChangePassword && (
        <ChangePasswordModal onClose={() => setShowChangePassword(false)} />
      )}
    </div>
  )
}

// Simple Change Password Modal Component
const ChangePasswordModal = ({ onClose }: { onClose: () => void }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

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
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => {
          onClose()
        }, 2000)
      } else {
        setError(data.message || 'Có lỗi xảy ra khi đổi mật khẩu')
      }
    } catch (error) {
      console.error('Error changing password:', error)
      setError('Có lỗi xảy ra khi đổi mật khẩu')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <Icon icon="solar:check-circle-bold" className="text-green-500 text-6xl mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Thành công!</h2>
            <p className="text-gray-600">Mật khẩu đã được thay đổi thành công</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Đổi mật khẩu</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <Icon icon="solar:close-circle-bold" className="text-2xl" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mật khẩu hiện tại
            </label>
            <input
              type="password"
              value={formData.currentPassword}
              onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mật khẩu mới
            </label>
            <input
              type="password"
              value={formData.newPassword}
              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
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

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProfilePage
