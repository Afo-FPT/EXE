'use client'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { ProductType } from '@/app/types/product'
import FeaturesSkeleton from '../../Skeleton/Features'
import Link from 'next/link'

const ProductList = () => {
  const [products, setProducts] = useState<ProductType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Sử dụng data tĩnh thay vì fetch API
    const staticProductData = [
      {
        name: "Sản phẩm 1",
        description: "Mô tả sản phẩm 1",
        imgSrc: "/images/Product/demo.png"
      },
      {
        name: "Sản phẩm 2",
        description: "Mô tả sản phẩm 2", 
        imgSrc: "/images/Product/demo1.png"
      },
      {
        name: "Sản phẩm 3",
        description: "Mô tả sản phẩm 3",
        imgSrc: "/images/Product/demo.svg"
      }
    ]
    
    setProducts(staticProductData)
    setLoading(false)

    // fetchProducts() - Đã thay thế bằng data tĩnh
  }, [])

  return (
    <section>
      <div className="container mx-auto px-4 flex flex-col gap-6">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => <FeaturesSkeleton key={i} />)
          : products.map((product, index) => {
            const isEven = index % 2 === 0
            const bgColor = isEven ? 'bg-primary/20' : 'bg-primary/10'

            return (
              <div
                key={index}
                className={`flex flex-col md:flex-row items-center rounded-xl shadow-md overflow-hidden ${isEven ? '' : 'md:flex-row-reverse'
                  } ${bgColor}`}
              >
                {/* Hình ảnh */}
                <Image
                  src={product.imgSrc}
                  alt={product.name}
                  width={500}
                  height={300}
                  className="md:w-1/2 h-full object-cover rounded-xl shadow-md transition-transform duration-300 hover:scale-105"
                />

                {/* Nội dung */}
                <div className="w-full md:w-1/2 p-6 text-center md:text-left space-y-2">
                  <h3 className="text-2xl font-bold text-gray-800">{product.name}</h3>
                  <p className="text-gray-700">{product.description}</p>
                  <Link href='/#product'>
                    <button className='text-xl font-medium rounded-full text-white py-3 px-8 bg-primary hover:text-primary border border-primary hover:bg-transparent hover:cursor-pointer transition ease-in-out duration-300'>
                      Xem Thêm
                    </button>
                  </Link>
                </div>
              </div>
            )
          })}
      </div>
    </section>
  )
}

export default ProductList
