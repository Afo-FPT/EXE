'use client'
import Link from 'next/link'
import SocialSignUp from '../SocialSignUp'
import Logo from '@/app/components/Layout/Header/Logo'

const SignUp = () => {

  return (
    <>

      <hr className="mb-8 mt-2 border-t border-black/20" />


      <form>
        <div className='mb-[22px]'>
          <input
            type='text'
            placeholder='Tên đăng nhập'
            name='name'
            required
            className='w-full rounded-md border border-solid bg-transparent px-5 py-3 text-base text-dark outline-hidden transition border-gray-200 placeholder:text-black/30 focus:border-primary focus-visible:shadow-none text-black'
          />
        </div>
        <div className='mb-[22px]'>
          <input
            type='email'
            placeholder='Email'
            name='email'
            required
            className='w-full rounded-md border border-solid bg-transparent px-5 py-3 text-base text-dark outline-hidden transition border-gray-200 placeholder:text-black/30 focus:border-primary focus-visible:shadow-none text-black'
          />
        </div>
        <div className='mb-[22px]'>
          <input
            type='password'
            placeholder='Mật khẩu'
            name='password'
            required
            className='w-full rounded-md border border-solid bg-transparent px-5 py-3 text-base text-dark outline-hidden transition border-gray-200 placeholder:text-black/30 focus:border-primary focus-visible:shadow-none text-black'
          />
        </div>
        <div className='mb-[22px]'>
          <input
            type='password'
            placeholder='Xác nhận mật khẩu'
                            name='confirmpassword'
            required
            className='w-full rounded-md border border-solid bg-transparent px-5 py-3 text-base text-dark outline-hidden transition border-gray-200 placeholder:text-black/30 focus:border-primary focus-visible:shadow-none text-black'
          />
        </div>

        <div className='mb-9'>
          <button
            type='submit'
            className='flex w-full items-center text-18 font-medium text-white justify-center rounded-md bg-primary px-5 py-3 text-darkmode transition duration-300 ease-in-out hover:bg-transparent hover:text-primary border-primary border'>
            Đăng ký
          </button>
        </div>
      </form>

    </>
  )
}

export default SignUp
