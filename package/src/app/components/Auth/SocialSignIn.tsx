import React, { useState } from 'react'

// Extend Window interface for Google
declare global {
  interface Window {
    google: any
  }
}

const SocialSignIn = () => {
  const [isLoading, setIsLoading] = useState(false)

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true)
      console.log('Google login clicked')
      
      // Check if Google Client ID is configured
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
      console.log('Client ID:', clientId)
      
      if (!clientId) {
        alert('Google Client ID chưa được cấu hình')
        return
      }

      // Load Google API script
      if (!window.google) {
        const script = document.createElement('script')
        script.src = 'https://accounts.google.com/gsi/client'
        script.async = true
        script.defer = true
        document.head.appendChild(script)
        
        // Wait for script to load
        await new Promise((resolve) => {
          script.onload = resolve
        })
      }

      // Initialize Google OAuth
      const authInstance = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'email profile',
        callback: async (response: any) => {
          try {
            if (response.error) {
              throw new Error(response.error)
            }

            console.log('Google OAuth response:', response)

            // Get user info
            const userInfo = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${response.access_token}`)
            const userData = await userInfo.json()
            console.log('User data:', userData)

            // Send to backend
            const backendResponse = await fetch('http://localhost:5000/api/google-login', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                token: response.access_token,
                userData: userData
              })
            })

            const result = await backendResponse.json()
            console.log('Backend response:', result)

            if (result.success) {
              // Store token and user data
              localStorage.setItem('token', result.token)
              localStorage.setItem('user', JSON.stringify(result.user))
              
              alert('Đăng nhập Google thành công!')
              window.location.href = '/'
            } else {
              throw new Error(result.message || 'Google login failed')
            }
          } catch (error) {
            console.error('Google login error:', error)
            alert('Đăng nhập Google thất bại: ' + (error instanceof Error ? error.message : 'Lỗi không xác định'))
          } finally {
            setIsLoading(false)
          }
        }
      })

      // Request access token
      authInstance.requestAccessToken()

    } catch (error) {
      console.error('Google login initialization error:', error)
      alert('Lỗi khởi tạo Google login: ' + (error instanceof Error ? error.message : 'Lỗi không xác định'))
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className='flex gap-4'>
        <button 
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className='flex w-full items-center justify-center gap-2.5 rounded-lg p-3.5 border border-gray-200 text-black hover:bg-neutral-100 hover:cursor-pointer disabled:opacity-50'
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          ) : (
            <>
              Đăng nhập với Google
              <svg
                width='23'
                height='22'
                viewBox='0 0 23 22'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'>
                <g clipPath='url(#clip0_709_8846)'>
                  <path
                    d='M22.5001 11.2438C22.5134 10.4876 22.4338 9.73256 22.2629 8.995H11.7246V13.0771H17.9105C17.7933 13.7929 17.5296 14.478 17.1352 15.0914C16.7409 15.7047 16.224 16.2335 15.6158 16.646L15.5942 16.7827L18.9264 19.3124L19.1571 19.335C21.2772 17.4161 22.4997 14.5926 22.4997 11.2438'
                    fill='#4285F4'
                  />
                  <path
                    d='M11.7245 22C14.755 22 17.2992 21.0221 19.1577 19.3355L15.6156 16.6464C14.6679 17.2944 13.3958 17.7467 11.7245 17.7467C10.3051 17.7385 8.92433 17.2926 7.77814 16.472C6.63195 15.6515 5.77851 14.4981 5.33892 13.1755L5.20737 13.1865L1.74255 15.8142L1.69727 15.9376C2.63043 17.7602 4.06252 19.2925 5.83341 20.3631C7.60429 21.4337 9.64416 22.0005 11.7249 22'
                    fill='#34A853'
                  />
                  <path
                    d='M5.33889 13.1755C5.09338 12.4753 4.96669 11.7404 4.96388 11C4.9684 10.2608 5.09041 9.52685 5.32552 8.8245L5.31927 8.67868L1.81196 6.00867L1.69724 6.06214C0.910039 7.5938 0.5 9.28491 0.5 10.9999C0.5 12.7148 0.910039 14.406 1.69724 15.9376L5.33889 13.1755Z'
                    fill='#FBBC05'
                  />
                  <path
                    d='M11.7249 4.25337C13.3333 4.22889 14.8888 4.8159 16.065 5.89121L19.2329 2.86003C17.2011 0.992106 14.5106 -0.0328008 11.7249 3.27798e-05C9.64418 -0.000452376 7.60433 0.566279 5.83345 1.63686C4.06256 2.70743 2.63046 4.23965 1.69727 6.06218L5.32684 8.82455C5.77077 7.50213 6.62703 6.34962 7.77491 5.5295C8.9228 4.70938 10.3044 4.26302 11.7249 4.25337Z'
                    fill='#EB4335'
                  />
                </g>
                <defs>
                  <clipPath id='clip0_709_8846'>
                    <rect
                      width='22'
                      height='22'
                      fill='white'
                      transform='translate(0.5)'
                    />
                  </clipPath>
                </defs>
              </svg>
            </>
          )}
        </button>

        <button className='flex w-full items-center justify-center gap-2.5 rounded-lg p-3.5 border border-gray-200 text-black hover:bg-neutral-100 hover:cursor-pointer'>
          Đăng nhập với Facebook
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="#1877F2"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M22.675 0h-21.35C.597 0 0 .597 0 1.326v21.348C0 23.403.597 24 1.326 
    24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.894-4.788 4.659-4.788 
    1.325 0 2.464.099 2.795.143v3.24l-1.918.001c-1.504 
    0-1.796.716-1.796 1.765v2.316h3.587l-.467 
    3.622h-3.12V24h6.116C23.403 24 24 
    23.403 24 22.674V1.326C24 .597 23.403 0 22.675 0z"/>
          </svg>
        </button>
      </div>
    </>
  )
}

export default SocialSignIn
