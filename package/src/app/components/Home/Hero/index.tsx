
'use client'

import Link from 'next/link'
import Image from 'next/image'
import Spline from '@splinetool/react-spline/next';

const Hero = () => {

  return (
    <section
      id='home-section'
      className='relative bg-cover bg-center bg-no-repeat h-[800px]'
      style={{ backgroundImage: "url('/images/bg/Hero.png')" }}
    >
      <div className='container xl:pt-7 pt-16'>
        <div className="absolute left-70% bottom-20 z-1 h-auto pointer-events-none">
          <Image
            src='/images/Cook/cloud.webp'
            alt='cloud'
            width={463}
            height={622}
          />
        </div>
        <div className='grid grid-cols-1 lg:grid-cols-12 items-center'>

          <div className='lg:col-span-6'>
            <h1 className='font-semibold mt-25 text-secondary lg:text-start text-left sm:leading-20 leading-16'>
              Unbox the mystery, collect the culture.
            </h1>
            <p className='text-black/55 text-lg font-normal mb-10 lg:text-start text-center'>
              Khám phá thế giới mô hình cờ vua mang cảm hứng từ những câu chuyện, truyền thuyết và truyền thống Việt Nam.
            </p>
            <div className='flex flex-col sm:flex-row gap-5 items-center justify-center lg:justify-start'>
              <Link href='/#product'>
                <div className="relative w-[225px] h-[75px] cursor-pointer hover:opacity-80 transition">
                  <Image
                    src="/images/Button/test.png"
                    alt="Nút Xem Thêm"
                    layout="fill"
                    objectFit="cover"
                    className="rounded"
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-text text-xl font-semibold">
                    Xem Thêm
                  </span>
                </div>
              </Link>
              <Link href='/collection'>
                <div className="relative w-[225px] h-[75px] cursor-pointer hover:opacity-80 transition">
                  <Image
                    src="/images/Button/primary.png"
                    alt="Nút Bộ Sưu Tập"
                    layout="fill"
                    objectFit="cover"
                    className="rounded"
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-text text-xl font-semibold">
                    Bộ Sưu Tập
                  </span>
                </div>
              </Link>

            </div>
          </div>

          <div className='lg:col-span-6 flex justify-center relative'>
            {/* <div className='flex bg-secondary/45 p-2 gap-2 items-center bottom-10 left-10 rounded-xl absolute'>
              <Image
                src='/images/hero/chess.webp'
                alt='chess-image'
                width={68}
                height={68}
              />
              <p className='text-lg text-text font-normal'>
                Không chỉ là cờ vua <br />Đó là một nền văn hoá
              </p>
            </div> */}
            <Image
              src='/images/hero/banner.png'
              alt='banner'
              width={1000}
              height={805}
              className="mt-15"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero



