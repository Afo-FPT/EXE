'use client'

import React, { FC, useEffect, useState } from 'react'
import Link from 'next/link'
import { Icon } from '@iconify/react'
import { usePathname } from 'next/navigation'
import Logo from '../Header/Logo'
import { FooterLinkType } from '@/app/types/footerlink'

const Footer: FC = () => {
  const [footerlink, SetFooterlink] = useState<FooterLinkType[]>([])
  const pathname = usePathname()

  useEffect(() => {
    // Sử dụng data tĩnh thay vì fetch API
    const staticFooterData = [
      {
        section: "Sản phẩm",
        links: [
          { label: "Sản phẩm mới", href: "/products/new" },
          { label: "Bán chạy", href: "/products/bestsellers" },
          { label: "Khuyến mãi", href: "/products/sale" }
        ]
      },
      {
        section: "Hỗ trợ",
        links: [
          { label: "Trung tâm trợ giúp", href: "/help" },
          { label: "Liên hệ", href: "/contact" },
          { label: "FAQ", href: "/faq" }
        ]
      }
    ]
    
    SetFooterlink(staticFooterData)
  }, [])

  // Hide footer on admin dashboard and mystery box pages
  const shouldHideFooter = pathname?.startsWith('/admin') || pathname === '/mystery-box'
  
  if (shouldHideFooter) {
    return null
  }

  return (
    <footer className='bg-primary/10 pt-8'>
      <div className='container'>
        <div className='grid grid-cols-1 sm:grid-cols-6 lg:gap-20 md:gap-24 sm:gap-12 gap-12 pb-10'>
          <div className='col-span-2'>
            <Logo />
            <p className='text-sm font-medium text-grey my-5 max-w-70%'>
              Open an account in minutes, get full financial control for much
              longer.
            </p>
            <div className='flex gap-6 items-center'>
              <Link
                href='#'
                className='group bg-white hover:bg-primary rounded-full shadow-xl p-3'>
                <Icon
                  icon='fa6-brands:facebook-f'
                  width='16'
                  height='16'
                  className=' group-hover:text-white text-black'
                />
              </Link>
              <Link
                href='#'
                className='group bg-white hover:bg-primary rounded-full shadow-xl p-3'>
                <Icon
                  icon='fa6-brands:instagram'
                  width='16'
                  height='16'
                  className=' group-hover:text-white text-black'
                />
              </Link>
              <Link
                href='#'
                className='group bg-white hover:bg-primary rounded-full shadow-xl p-3'>
                <Icon
                  icon='fa6-brands:x-twitter'
                  width='16'
                  height='16'
                  className=' group-hover:text-white text-black'
                />
              </Link>
            </div>
          </div>
          <div className='col-span-2'>
            <div className='flex gap-20'>
              {footerlink.map((product, i) => (
                <div key={i} className='group relative col-span-2'>
                  <p className='text-black text-xl font-semibold mb-9'>
                    {product.section}
                  </p>
                  <ul>
                    {product.links.map((item, i) => (
                      <li key={i} className='mb-3'>
                        <Link
                          href={item.href}
                          className='text-black/60 hover:text-black text-base font-normal mb-6'>
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <div className='col-span-2 sm:col-span-6 md:col-span-2'>
            <div className='flex flex-col gap-5'>
              <div className='flex'>
                <Icon
                  icon='solar:point-on-map-perspective-bold'
                  className='text-primary text-3xl lg:text-2xl inline-block me-2'
                />
                <p className='text-black text-base'>
                  925 Filbert Street Pennsylvania 18072
                </p>
              </div>
              <Link href='tel:+1(909) 235-9814'>
                <div className='flex'>
                  <Icon
                    icon='solar:phone-bold'
                    className='text-primary text-3xl lg:text-2xl inline-block me-2'
                  />
                  <p className='text-black/60 hover:text-black text-base'>
                    +1(909) 235-9814
                  </p>
                </div>
              </Link>
              <Link href='/'>
                <div className='flex'>
                  <Icon
                    icon='solar:mailbox-bold'
                    className='text-primary text-3xl lg:text-2xl inline-block me-2'
                  />
                  <p className='text-black/60 hover:text-black text-base'>
                    info@gmail.com
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>
        <div className='border-t border-grey/15 py-5 flex flex-col sm:flex-row justify-between sm:items-center gap-5'>
          <p className='text-sm text-black/70'>
  ©2025 – An <span className="font-medium">Experiential Entrepreneurship</span> project by FPT University, developed by <span className="font-medium">MistyTeam</span>.</p>

          <div className=''>
            <Link
              href='#'
              className='text-sm text-black/70 px-5 border-r border-grey/15 hover:text-primary hover:underline'>
              Privacy policy
            </Link>
            <Link
              href='#'
              className='text-sm text-black/70 px-5 hover:text-primary hover:underline'>
              Terms & conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
