'use client'
import Image from 'next/image'
import Link from 'next/link'
import { Icon } from '@iconify/react'
import { useEffect, useState } from 'react'
import { FeaturesType } from '@/app/types/features'
import FeaturesSkeleton from '../../Skeleton/Features'

const Features = () => {
  const [features, setFeatures] = useState<FeaturesType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Sử dụng data tĩnh thay vì fetch API
    const staticFeaturesData = [
      {
        heading: "Không Đơn Thuần Là Một Mô Hình",
        subheading: "Mỗi sản phẩm là một tác phẩm nghệ thuật được đầu tư công phu, kết hợp giữa mỹ học hiện đại và giá trị truyền thống.",
        imgSrc: "/images/Features/feature1.svg"
      },
      {
        heading: "Mỗi Quân Cờ Là Một Câu Chuyện",
        subheading: "Từng mô hình là sự kết tinh của những truyền thuyết lịch sử và văn hóa Việt, được tái hiện sinh động qua thiết kế sáng tạo.",
        imgSrc: "/images/Features/feature2.svg"
      },
      {
        heading: "Tôn Vinh Bản Sắc Văn Hóa Việt",
        subheading: "Dự án hướng đến việc bảo tồn và lan toả giá trị văn hóa dân tộc thông qua từng chi tiết thiết kế đặc sắc và ý nghĩa.",
        imgSrc: "/images/Features/feature3.svg"
      },
      {
        heading: "Trải Nghiệm Sưu Tầm Mới Lạ",
        subheading: "Sưu tầm không còn chỉ là sở hữu – đó là hành trình khám phá văn hóa và cảm hứng nghệ thuật trong từng quân cờ.",
        imgSrc: "/images/Features/feature4.svg"
      },
      {
        heading: "Kết Nối Cộng Đồng Qua Sưu Tầm",
        subheading: "Mỗi người sưu tầm là một mảnh ghép trong hành trình gìn giữ và chia sẻ văn hóa – cùng nhau tạo nên một cộng đồng đam mê và gắn kết.",
        imgSrc: "/images/Features/feature5.svg"
      }
    ]
    
    setFeatures(staticFeaturesData)
    setLoading(false)
  }, [])

  return (
    <section id='features' className='bg-primary/10 relative'>
      <div className='container'>
        <div className='text-center mb-14'>
          <p className='text-primary text-lg font-normal tracking-widest uppercase'>
            Điều gì khiến chúng tôi khác biệt?
          </p>
          <h2 className='font-semibold lg:max-w-60% mx-auto mt-3'>
            Khám phá văn hoá trong từng hộp quà
          </h2>
        </div>
        <div className='grid sm:grid-cols-2 lg:grid-cols-5 gap-y-28 gap-x-6 mt-24'>
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
              <FeaturesSkeleton key={i} />
            ))
            : features.map((items, i) => (
              <div
                key={i}
                className='p-8 relative rounded-3xl bg-linear-to-b from-primary/10 to-white shadow-md hover:scale-105 transition duration-300 ease-in-out hover:cursor-pointer'>
                <div className='rounded-full flex justify-center absolute -top-[15%] sm:top-[-15%] md:top-[-20%] lg:top-[-15%] left-[5%]'>
                  <Image
                    src={items.imgSrc}
                    alt={items.imgSrc}
                    width={200}
                    height={10}
                  />
                </div>
                <p className='text-2xl text-black font-semibold text-center mt-16'>
                  {items.heading}
                </p>
                <p className='text-base font-normal text-black/50 text-center mt-2 leading-6'>
                  {items.subheading}
                </p>
              </div>
            ))}
        </div>

      </div>
    </section>
  )
}

export default Features
