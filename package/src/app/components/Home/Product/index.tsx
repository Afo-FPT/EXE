'use client'
import Slider from 'react-slick'
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import { ProductType } from '@/app/types/product'
import ChiefDetailSkeleton from '../../Skeleton/ChiefDetail'

const Expert = () => {
  const [Product, setProduct] = useState<ProductType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Sử dụng data tĩnh thay vì fetch API
    const staticProductData = [
      {
        name: "Sản phẩm 1",
        description: "Nhân vật chiến binh với trang phục truyền thống",
        imgSrc: "/images/hero/sp1.png"
      },
      {
        name: "Sản phẩm 2",
        description: "Chiến binh với đầu hổ và trang phục cổ điển", 
        imgSrc: "/images/hero/sp2.png"
      },
      {
        name: "Sản phẩm 3",
        description: "Nữ chiến binh với trang phục truyền thống",
        imgSrc: "/images/hero/sp3.png"
      }
    ]
    
    setProduct(staticProductData)
    setLoading(false)
  }, [])

  const settings = {
    dots: true,
    infinite: true,
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: false,
    autoplay: true,
    speed: 500,
    cssEase: 'linear',
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 800,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 450,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  }

  return (
    <section className='bg-primary/10'>
      <div className='container'>
        <div className='text-center'>
          <p className='text-primary text-lg font-normal mb-3 tracking-widest uppercase'>
            Bộ Sưu Tập Mới Nhất
          </p>
          <h2>Hào Khí Lạc Việt</h2>
        </div>
        <Slider {...settings}>
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
              <ChiefDetailSkeleton key={i} />
            ))
            : Product.map((items, i) => (
              <div key={i}>
                <div className='m-3 my-10 p-10 text-center backdrop-blur-md bg-white/50 rounded-3xl transition-transform duration-300 ease-in-out hover:scale-[1.02] hover:shadow-xl hover:bg-white/70'>
                  <div className='relative'>
                    <Image
                      src={items.imgSrc}
                      alt='product-image'
                      width={362}
                      height={262}
                      className='inline-block m-auto w-auto transition duration-300 ease-in-out hover:scale-105'
                    />
                  </div>
                  <div className='mt-16'>
                    <h3 className='text-2xl font-semibold text-black'>
                      {items.name}
                    </h3>
                    <h4 className='text-lg font-normal text-black/50 opacity-50'>
                      {items.description}
                    </h4>
                  </div>
                </div>
              </div>
            ))}
        </Slider>
      </div>
    </section>
  )
}

export default Expert

// 'use client'

// import React, { useEffect, useState } from 'react'
// import Slider from 'react-slick'
// import dynamic from 'next/dynamic'
// import 'slick-carousel/slick/slick.css'
// import 'slick-carousel/slick/slick-theme.css'
// import { ExpertChiefType } from '@/app/types/expertchief'
// import ChiefDetailSkeleton from '../../Skeleton/ChiefDetail'

// // Dynamic import ModelViewer để tránh SSR lỗi
// const ModelViewer = dynamic(() => import('@/app/components/ModelViewer'), {
//   ssr: false,
// })

// const Expert = () => {
//   const [chiefDetail, setChiefDetail] = useState<ExpertChiefType[]>([])
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const res = await fetch('/api/data')
//         if (!res.ok) throw new Error('Failed to fetch')
//         const data = await res.json()
//         setChiefDetail(data.ExpertChiefData)
//       } catch (error) {
//         console.error('Error fetching services:', error)
//       } finally {
//         setLoading(false)
//       }
//     }
//     fetchData()
//   }, [])

//   const settings = {
//     dots: true,
//     infinite: true,
//     slidesToShow: 3,
//     slidesToScroll: 1,
//     arrows: false,
//     autoplay: true,
//     speed: 500,
//     cssEase: 'linear',
//     responsive: [
//       {
//         breakpoint: 1200,
//         settings: { slidesToShow: 3 },
//       },
//       {
//         breakpoint: 800,
//         settings: { slidesToShow: 2 },
//       },
//       {
//         breakpoint: 450,
//         settings: { slidesToShow: 1 },
//       },
//     ],
//   }

//   return (
//     <section id='product' className="bg-primary/10">
//       <div className="container">
//         <div className="text-center">
//           <p className="text-primary text-lg font-normal mb-3 tracking-widest uppercase">
//             Bộ Sưu Tập Mới Nhất
//           </p>
//           <h2>Hào Khí Lạc Việt</h2>
//         </div>
//         <Slider {...settings}>
//           {loading
//             ? Array.from({ length: 3 }).map((_, i) => (
//                 <ChiefDetailSkeleton key={i} />
//               ))
//             : chiefDetail.map((items, i) => (
//                 <div key={i}>
//                   <div className="m-3 my-10 p-10 text-center backdrop-blur-md bg-white/50 rounded-3xl">
//                     <div className="relative">
//                       {/* 👉 Load mô hình 3D thay ảnh tĩnh */}
//                       <ModelViewer url={items.imgSrc} />

//                       {/* Icon mạng xã hội nếu muốn giữ lại */}
//                       <div className="absolute top-[75%] -right-[10%]">
//                         <img
//                           src="/images/Expert/Linkedin.svg"
//                           alt="linkedin"
//                           width={220}
//                           height={120}
//                         />
//                       </div>
//                     </div>
//                     <div className="mt-16">
//                       <h3 className="text-2xl font-semibold text-black">
//                         {items.name}
//                       </h3>
//                       <h4 className="text-lg font-normal text-black/50 opacity-50">
//                         {items.profession}
//                       </h4>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//         </Slider>
//       </div>
//     </section>
//   )
// }

// export default Expert
