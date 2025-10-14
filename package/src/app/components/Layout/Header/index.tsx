'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import Logo from './Logo'
import HeaderLink from './Navigation/HeaderLink'
import MobileHeaderLink from './Navigation/MobileHeaderLink'
import { Icon } from '@iconify/react/dist/iconify.js'
import { HeaderItem } from '@/app/types/menu'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import AuthModal from '@/app/components/Auth/AuthModal'

const Header: React.FC = () => {
  const [headerLink, setHeaderLink] = useState<HeaderItem[]>([])
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { cart } = useCart()

  const [navbarOpen, setNavbarOpen] = useState(false)
  const [sticky, setSticky] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')

  const navbarRef = useRef<HTMLDivElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Sử dụng data tĩnh thay vì fetch API
    const staticHeaderData = [
      {
        label: "Trang chủ",
        href: "/"
      },
      {
        label: "Cửa hàng",
        href: "/store"
      },
      {
        label: "Về chúng tôi", 
        href: "/about"
      },
      {
        label: "Liên hệ",
        href: "/contact"
      }
    ]
    
    setHeaderLink(staticHeaderData)
  }, [])

  const handleScroll = () => {
    setSticky(window.scrollY >= 20)
  }

  const handleClickOutside = (event: MouseEvent) => {
    if (
      mobileMenuRef.current &&
      !mobileMenuRef.current.contains(event.target as Node) &&
      navbarOpen
    ) {
      setNavbarOpen(false)
    }
  }

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [navbarOpen])

  useEffect(() => {
    if (authModalOpen || navbarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }, [authModalOpen, navbarOpen])

  // Hide header on admin dashboard, mystery box, inventory, store, checkout, and cart pages
  const shouldHideHeader = pathname?.startsWith('/admin') || pathname === '/mystery-box' || pathname === '/inventory' || pathname === '/store' || pathname === '/checkout' || pathname === '/cart'
  
  if (shouldHideHeader) {
    return null
  }

  return (
    <header
      className={`fixed top-0 z-40 py-4 w-full transition-all duration-300 ${sticky ? 'shadow-lg bg-white' : 'shadow-none'
        }`}>
      <div>
        <div className='container flex items-center justify-between'>
          <div>
            <Logo />
          </div>
          <nav className='hidden lg:flex grow items-center gap-4 xl:gap-6 justify-center'>
            {headerLink.map((item, index) => (
              <HeaderLink key={index} item={item} />
            ))}
          </nav>
          <div className='flex items-center gap-2 lg:gap-3'>
            {/* Cart Icon */}
            <Link
              href='/cart'
              className='relative p-2 text-gray-700 hover:text-primary transition-colors'>
              <Icon
                icon='solar:cart-bold'
                className='text-2xl'
              />
              {cart.totalItems > 0 && (
                <span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold'>
                  {cart.totalItems > 99 ? '99+' : cart.totalItems}
                </span>
              )}
            </Link>
            
            <Link
              href='#'
              className='text-lg font-medium hover:text-primary hidden xl:block'>
              <Icon
                icon='solar:phone-bold'
                className='text-primary text-3xl lg:text-2xl inline-block me-2'
              />
              (+84) 989999999
            </Link>
                               {user ? (
                     // User đã đăng nhập
                     <div className="flex items-center gap-4">
                       <div className="relative group">
                         <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                           <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                             <Icon icon="solar:user-bold" className="text-white text-lg" />
                           </div>
                           <span className="font-medium">{user.username}</span>
                           <Icon icon="solar:alt-arrow-down-bold" className="text-white text-sm" />
                         </button>
                         
                         {/* User Dropdown Menu */}
                         <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                           <div className="p-4 border-b border-gray-100">
                             <div className="font-medium text-gray-900">{user.username}</div>
                             <div className="text-sm text-gray-500">{user.email}</div>
                           </div>
                           <div className="p-2">
                             <Link href="/profile" className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors block">
                               <Icon icon="solar:user-bold" className="inline-block mr-2" />
                               Hồ sơ cá nhân
                             </Link>
                             <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
                               <Icon icon="solar:settings-bold" className="inline-block mr-2" />
                               Cài đặt
                             </button>
                             <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
                               <Icon icon="solar:history-bold" className="inline-block mr-2" />
                               Lịch sử
                             </button>
                           </div>
                           <div className="p-2 border-t border-gray-100">
                             <button
                               onClick={logout}
                               className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                             >
                               <Icon icon="solar:logout-bold" className="inline-block mr-2" />
                               Đăng xuất
                             </button>
                           </div>
                         </div>
                       </div>
                     </div>
                   ) : (
              // User chưa đăng nhập
              <>
                <div
                  onClick={() => {
                    setAuthMode('login');
                    setAuthModalOpen(true);
                  }}
                  className="relative w-[225px] h-[75px] cursor-pointer hover:opacity-80 transition hidden lg:block"
                >
                  <Image
                    src="/images/Button/primary.png"
                    alt="Đăng Nhập"
                    fill
                    className="object-cover rounded"
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-text text-xl font-semibold">
                    Đăng Nhập
                  </span>
                </div>
                <div
                  onClick={() => {
                    setAuthMode('register');
                    setAuthModalOpen(true);
                  }}
                  className="relative w-[225px] h-[75px] cursor-pointer hover:opacity-80 transition hidden lg:block"
                >
                  <Image
                    src="/images/Button/primary.png"
                    alt="Đăng Ký"
                    fill
                    className="object-cover rounded"
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-text text-xl font-semibold">
                    Đăng Ký
                  </span>
                </div>
              </>
            )}

            <button
              onClick={() => setNavbarOpen(!navbarOpen)}
              className='block lg:hidden p-2 rounded-lg'
              aria-label='Toggle mobile menu'>
              <span className='block w-6 h-0.5 bg-black'></span>
              <span className='block w-6 h-0.5 bg-black mt-1.5'></span>
              <span className='block w-6 h-0.5 bg-black mt-1.5'></span>
            </button>
          </div>
        </div>
        {navbarOpen && (
          <div className='fixed top-0 left-0 w-full h-full bg-black/50 z-40' />
        )}
        <div
          ref={mobileMenuRef}
          className={`lg:hidden fixed top-0 right-0 h-full w-full bg-white shadow-lg transform transition-transform duration-300 max-w-xs ${navbarOpen ? 'translate-x-0' : 'translate-x-full'
            } z-50`}>
          <div className='flex items-center justify-between gap-2 p-4'>
            <div>
              <Logo />
            </div>
            {/*  */}
            <button
              onClick={() => setNavbarOpen(false)}
              className="hover:cursor-pointer"
              aria-label='Close menu Modal'>
              <Icon
                icon='material-symbols:close-rounded'
                width={24}
                height={24}
                className='text-black hover:text-primary text-24 inline-block me-2'
              />
            </button>
          </div>
          <Link
            href='#'
            className='text-lg font-medium hover:text-primary block md:hidden mt-6 p-4'>
            <Icon
              icon='solar:phone-bold'
              className='text-primary text-3xl lg:text-2xl inline-block me-2'
            />
            (+84) 989999999
          </Link>
          <nav className='flex flex-col items-start p-4'>
            {headerLink.map((item, index) => (
              <MobileHeaderLink key={index} item={item} />
            ))}
            
            {/* Mobile Cart Link */}
            <Link
              href='/cart'
              className='flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors w-full'>
              <Icon
                icon='solar:cart-bold'
                className='text-xl'
              />
              <span>Giỏ hàng</span>
              {cart.totalItems > 0 && (
                <span className='ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold'>
                  {cart.totalItems > 99 ? '99+' : cart.totalItems}
                </span>
              )}
            </Link>
            
            <div className='mt-4 flex flex-col space-y-4 w-full'>
              {user ? (
                <>
                  <div className='w-full p-4 bg-gray-50 rounded-lg'>
                    <div className='flex items-center gap-3 mb-3'>
                      <div className='w-12 h-12 bg-primary rounded-full flex items-center justify-center'>
                        <Icon icon="solar:user-bold" className="text-white text-xl" />
                      </div>
                      <div>
                        <div className='font-medium text-gray-900'>{user.username}</div>
                        <div className='text-sm text-gray-500'>{user.email}</div>
                      </div>
                    </div>
                    <div className='space-y-2'>
                      <Link href="/profile" className='w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-white rounded-md transition-colors block'>
                        <Icon icon="solar:user-bold" className="inline-block mr-2" />
                        Hồ sơ cá nhân
                      </Link>
                      <button className='w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-white rounded-md transition-colors'>
                        <Icon icon="solar:settings-bold" className="inline-block mr-2" />
                        Cài đặt
                      </button>
                      <button className='w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-white rounded-md transition-colors'>
                        <Icon icon="solar:history-bold" className="inline-block mr-2" />
                        Lịch sử
                      </button>
                    </div>
                    <div className='pt-2 mt-2 border-t border-gray-200'>
                      <button
                        className='w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors'
                        onClick={() => {
                          logout();
                          setNavbarOpen(false);
                        }}>
                        <Icon icon="solar:logout-bold" className="inline-block mr-2" />
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <button
                    className='bg-primary text-white px-4 py-2 rounded-lg border border-primary hover:text-primary hover:bg-transparent hover:cursor-pointer transition duration-300 ease-in-out'
                    onClick={() => {
                      setAuthMode('login');
                      setAuthModalOpen(true);
                      setNavbarOpen(false);
                    }}>
                    Đăng Nhập
                  </button>
                  <button
                    className='bg-primary text-white px-4 py-2 rounded-lg border border-primary hover:text-primary hover:bg-transparent hover:cursor-pointer transition duration-300 ease-in-out'
                    onClick={() => {
                      setAuthMode('register');
                      setAuthModalOpen(true);
                      setNavbarOpen(false);
                    }}>
                    Đăng Ký
                  </button>
                </>
              )}
            </div>
          </nav>
        </div>
      </div>
      
                   {/* Auth Modal */}
             <AuthModal
               isOpen={authModalOpen}
               onClose={() => setAuthModalOpen(false)}
               mode={authMode}
             />
             
           </header>
  )
}

export default Header
