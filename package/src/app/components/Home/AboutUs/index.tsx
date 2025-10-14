'use client'

import Image from 'next/image'

const Cook = () => {
  return (
    <section className='relative' id='aboutus'>
      <div className='container px-4'>
        <div className='absolute right-0 bottom-[-18%] xl:block hidden'>
          <Image
            src='/images/Cook/cloud.webp'
            alt='burger-image'
            width={463}
            height={622}
          />
        </div>
        <div className='grid grid-cols-1 lg:grid-cols-12 my-16 space-x-5'>
          <div className='lg:col-span-6 flex lg:justify-start justify-center'>
            <Image
              src='/images/Cook/chess.webp'
              alt='nothing'
              width={636}
              height={808}
            />
          </div>
          <div className='lg:col-span-6 flex flex-col justify-center items-center lg:items-start'>
            <p className='text-primary text-lg font-normal mb-3 tracking-widest uppercase lg:text-start text-center'>
              Nhóm phát triển
            </p>
            <h2 className='lg:text-start text-center'>
              MistyTeam
            </h2>
            <p className='text-black/50 text-lg font-normal my-5 text-start'>
              MistyTeam là một nhóm sinh viên thuộc Đại học FPT, tập hợp những cá nhân đam mê sáng tạo, thiết kế và công nghệ.
              Với tinh thần khởi nghiệp và học hỏi không ngừng, chúng tôi cùng nhau phát triển Kỳ Vương Sưu Tầm
              – một dự án kết hợp giữa văn hoá, sưu tầm và trải nghiệm tương tác độc đáo.
            </p>
            <p className='text-black/50 text-lg font-normal mb-10 text-start'>
              Chúng tôi tin rằng mỗi sản phẩm không chỉ là một món đồ chơi, mà là một câu chuyện văn hoá được đóng gói để bạn khám phá.
              Từ ý tưởng, thiết kế, đến triển khai, MistyTeam luôn hướng đến sự chân thực, sáng tạo và kết nối cộng đồng.
            </p>
            <div
              onClick={() => window.open("https://www.facebook.com", "_blank")}
              className="relative w-[260px] h-[75px] cursor-pointer hover:opacity-80 transition"
            >
              <Image
                src="/images/Button/button-2.png" 
                alt="Liên Hệ"
                layout="fill"
                objectFit="cover"
                className="rounded"
              />
              <span className="absolute inset-0 flex items-center justify-center text-text text-xl font-semibold text-center px-4">
                Liên Hệ Với Chúng Tôi
              </span>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}

export default Cook
