'use client'
import Link from 'next/link'
import SocialSignIn from '../SocialSignIn'
import Logo from '@/app/components/Layout/Header/Logo'

const Signin = () => {

  return (
    <>
      <hr className="mb-8 mt-2 border-t border-black/20" />

      <SocialSignIn />
      <span className='z-1 relative my-8 block text-center  before:absolute before:h-px before:w-[40%] before:bg-black/20 before:left-0 before:top-3  after:absolute after:h-px after:w-[40%] after:bg-black/20 after:top-3 after:right-0'>
        <span className='text-body-secondary relative z-10 inline-block px-3 text-base text-black'>
          Hoặc
        </span>
      </span>

      <form onSubmit={(e) => e.preventDefault()}>
        <div className='mb-[22px]'>
          <input
            type='email'
            placeholder='Email'

            className='w-full rounded-md border border-solid bg-transparent px-5 py-3 text-base text-dark outline-hidden transition border-gray-200 placeholder:text-black/30 focus:border-primary focus-visible:shadow-none text-black'
          />
        </div>
        <div className='mb-[22px]'>
          <input
            type='password'
            placeholder='Mât khẩu'

            className='w-full rounded-md border border-solid bg-transparent px-5 py-3 text-base text-dark outline-hidden transition border-gray-200 placeholder:text-black/30 focus:border-primary focus-visible:shadow-none text-black'
          />
        </div>
        <div className='mb-9'>
          <button

            type='submit'
            className='bg-primary w-full py-3 rounded-lg text-18 font-medium border text-white border-primary hover:text-primary hover:bg-transparent hover:cursor-pointer transition duration-300 ease-in-out'>
            Đăng nhập
          </button>
        </div>
      </form>
    </>
  )
}

export default Signin
