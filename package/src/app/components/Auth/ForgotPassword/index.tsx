'use client'
import React from 'react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import axios from 'axios'
import Loader from '@/app/components/Common/Loader'
import Link from 'next/link'
import Image from 'next/image'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [loader, setLoader] = useState(false)

  const handleSubmit = async (e: any) => {
    e.preventDefault()

    if (!email) {
      toast.error('Vui lòng nhập địa chỉ email của bạn.')

      return
    }

    setLoader(true)

    try {
      const res = await axios.post('/api/forgot-password/reset', {
        email: email.toLowerCase(),
      })

      if (res.status === 404) {
        toast.error('Không tìm thấy người dùng.')
        return
      }

      if (res.status === 200) {
        toast.success(res.data)
        setEmail('')
      }

      setEmail('')
      setLoader(false)
    } catch (error: any) {
      toast.error(error?.response.data)
      setLoader(false)
    }
  }

  return (
      <div className='container'>

            <div
              className='wow fadeInUp relative mx-auto overflow-hidden rounded-lg bg-white px-8 py-14 text-center dark:bg-dark-2 sm:px-12 md:px-[60px]'
              data-wow-delay='.15s'>

              <form onSubmit={handleSubmit}>
                <div className='mb-[22px]'>
                  <input
                    type='email'
                    placeholder='Nhập email của bạn'
                    name='email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className='w-full rounded-md border border-stroke bg-transparent px-5 py-3 text-base text-dark outline-hidden transition placeholder:text-dark-6 focus:border-primary focus-visible:shadow-none dark:border-dark-3 dark:text-white dark:focus:border-primary'
                  />
                </div>
                <div className=''>
                  <button
                    type='submit'
                    className='flex w-full cursor-pointer items-center justify-center rounded-md border border-primary bg-primary px-5 py-3 text-base text-white transition duration-300 ease-in-out hover:bg-blue-dark'>
                    Send Email {loader && <Loader />}
                  </button>
                </div>
              </form>

              
            </div>
          </div>
  
  )
}

export default ForgotPassword
