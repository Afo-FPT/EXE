'use client'

import { useEffect, useMemo, useState } from 'react'
import { Icon } from '@iconify/react'
import Image from 'next/image'
import Link from 'next/link'

import { useAuth } from '@/contexts/AuthContext'
import { buildApiUrl } from '@/config/api'

type Review = {
  _id: string
  username: string
  avatar?: string
  rating: number
  title?: string
  content: string
  images: string[]
  createdAt: string
}

const MAX_IMAGES = 3
const MAX_IMAGE_SIZE_MB = 8

const ReviewsPage = () => {
  const { user, token, showToast } = useAuth()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    rating: 5,
    title: '',
    content: '',
  })

  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])

  const [lightboxImages, setLightboxImages] = useState<string[]>([])
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  useEffect(() => {
    fetchReviews()
  }, [])

  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [imagePreviews])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const response = await fetch(buildApiUrl('/reviews'))
      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Không thể tải đánh giá')
      }
      setReviews(data.reviews || [])
    } catch (error: any) {
      console.error(error)
      showToast(error?.message || 'Không thể tải đánh giá', 'error')
    } finally {
      setLoading(false)
    }
  }

  const averageRating = useMemo(() => {
    if (!reviews.length) return 0
    return (
      reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    )
  }, [reviews])

  const formatDate = (value: string) => {
    try {
      return new Date(value).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    } catch {
      return value
    }
  }

  const renderStars = (rating: number) => (
    <div className='flex items-center gap-1'>
      {[1, 2, 3, 4, 5].map((star) => (
        <Icon
          key={star}
          icon='solar:star-bold'
          className={`text-xl ${
            star <= rating ? 'text-yellow-400' : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  )

  const renderInteractiveStars = (rating: number) => (
    <div className='flex items-center gap-1'>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type='button'
          onClick={() =>
            setForm((prev) => ({
              ...prev,
              rating: star,
            }))
          }
          className='focus:outline-none'
        >
          <Icon
            icon='solar:star-bold'
            className={`text-2xl ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  )

  const handleChangeImages = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (!files.length) return
    if (files.length + selectedImages.length > MAX_IMAGES) {
      showToast(`Chỉ được chọn tối đa ${MAX_IMAGES} ảnh`, 'info')
    }
    const availableSlots = MAX_IMAGES - selectedImages.length
    const limited = files.slice(0, availableSlots)

    const validFiles: File[] = []
    const previews: string[] = []

    limited.forEach((file) => {
      if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
        showToast(
          `Ảnh "${file.name}" vượt quá ${MAX_IMAGE_SIZE_MB}MB`,
          'info'
        )
        return
      }
      validFiles.push(file)
      previews.push(URL.createObjectURL(file))
    })

    setSelectedImages((prev) => [...prev, ...validFiles])
    setImagePreviews((prev) => [...prev, ...previews])
  }

  const handleRemoveImage = (index: number) => {
    const newFiles = [...selectedImages]
    const newPreviews = [...imagePreviews]
    const removedPreview = newPreviews.splice(index, 1)[0]
    newFiles.splice(index, 1)
    if (removedPreview) URL.revokeObjectURL(removedPreview)
    setSelectedImages(newFiles)
    setImagePreviews(newPreviews)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!user || !token) {
      showToast('Bạn cần đăng nhập để gửi đánh giá', 'info')
      return
    }

    if (!form.content.trim()) {
      showToast('Vui lòng nhập nội dung đánh giá', 'info')
      return
    }

    try {
      setSubmitting(true)
      const body = new FormData()
      body.append('rating', String(form.rating))
      body.append('title', form.title)
      body.append('content', form.content)
      selectedImages.forEach((file) => body.append('images', file))

      const response = await fetch(buildApiUrl('/reviews'), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body,
      })
      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Không thể gửi đánh giá')
      }

      showToast('Đã gửi đánh giá thành công!', 'success')
      setReviews((prev) => [data.review, ...prev])
      setForm({ rating: 5, title: '', content: '' })
      imagePreviews.forEach((url) => URL.revokeObjectURL(url))
      setSelectedImages([])
      setImagePreviews([])
    } catch (error: any) {
      console.error(error)
      showToast(error?.message || 'Không thể gửi đánh giá', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className='pt-32 pb-16 bg-gradient-to-b from-gray-50 via-white to-white min-h-screen'>
      <div className='container max-w-6xl mx-auto px-4 space-y-10'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <div className='bg-white rounded-2xl p-6 shadow-sm border border-gray-100 md:col-span-3 md:flex md:items-center md:gap-8'>
            <div>
              <p className='text-sm text-gray-500'>Điểm trung bình</p>
              <div className='flex items-center gap-4'>
                <span className='text-5xl font-extrabold text-gray-900'>
                  {averageRating.toFixed(1)}
                </span>
                <div>
                  {renderStars(Math.round(averageRating))}
                  <p className='text-sm text-gray-500'>
                    {reviews.length} đánh giá
                  </p>
                </div>
              </div>
            </div>
            {!user && (
              <Link
                href='/signin'
                className='mt-6 md:mt-0 inline-flex items-center gap-2 px-5 py-3 rounded-2xl border border-primary text-primary font-semibold hover:bg-primary hover:text-white transition-colors'>
                <Icon icon='solar:user-circle-bold' className='text-xl' />
                Đăng nhập để đánh giá
              </Link>
            )}
          </div>
        </div>

        <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8'>
          <h2 className='text-2xl font-semibold text-gray-900 mb-4'>
            Chia sẻ cảm nhận của bạn
          </h2>
          <form onSubmit={handleSubmit} className='space-y-6'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Điểm đánh giá
              </label>
              <div className='flex items-center gap-3'>
                {renderInteractiveStars(form.rating)}
                <span className='text-sm text-gray-500'>
                  {form.rating} / 5 sao
                </span>
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Nội dung đánh giá
              </label>
              <textarea
                rows={4}
                value={form.content}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, content: e.target.value }))
                }
                placeholder='Chia sẻ trải nghiệm của bạn về sản phẩm, dịch vụ...'
                className='w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary resize-none'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Ảnh minh hoạ (tối đa {MAX_IMAGES}, {MAX_IMAGE_SIZE_MB}MB/ảnh)
              </label>
              <div className='flex gap-4 flex-wrap'>
                <label className='w-28 h-28 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-500 cursor-pointer hover:border-primary hover:text-primary transition-colors'>
                  <Icon icon='solar:camera-broken' className='text-2xl mb-1' />
                  <span className='text-xs text-center'>Thêm ảnh</span>
                  <input
                    type='file'
                    accept='image/*'
                    multiple
                    hidden
                    onChange={handleChangeImages}
                    disabled={!user}
                  />
                </label>
                {imagePreviews.map((preview, index) => (
                  <div
                    key={preview}
                    className='relative w-28 h-28 rounded-xl overflow-hidden border'>
                    <Image
                      src={preview}
                      alt={`preview-${index}`}
                      fill
                      className='object-cover'
                    />
                    <button
                      type='button'
                      onClick={() => handleRemoveImage(index)}
                      className='absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 hover:bg-black'>
                      <Icon icon='solar:close-circle-bold' className='text-lg' />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button
              type='submit'
              disabled={!user || submitting}
              className='w-full md:w-auto px-6 py-3 rounded-2xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed'>
              {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
            </button>
          </form>
        </div>

        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <h2 className='text-2xl font-semibold text-gray-900'>
              Đánh giá mới nhất
            </h2>
            <button
              onClick={fetchReviews}
              className='inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80'>
              <Icon icon='solar:refresh-bold' />
              Tải lại
            </button>
          </div>

          {loading ? (
            <div className='bg-white rounded-2xl border shadow-sm p-6 flex items-center gap-3'>
              <div className='animate-spin rounded-full h-10 w-10 border-b-2 border-primary'></div>
              <p className='text-gray-600'>Đang tải đánh giá...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className='bg-white rounded-2xl border shadow-sm p-10 text-center'>
              <Icon
                icon='solar:chat-round-dots-bold-duotone'
                className='text-5xl text-gray-300 mx-auto mb-4'
              />
              <p className='text-gray-600'>
                Chưa có đánh giá nào. Hãy là người đầu tiên chia sẻ cảm nhận!
              </p>
            </div>
          ) : (
            <div className='space-y-4'>
              {reviews.map((review) => (
                <div
                  key={review._id}
                  className='bg-white rounded-2xl border shadow-sm p-6 space-y-4'>
                  <div className='flex items-center gap-4'>
                    <div className='w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-lg overflow-hidden'>
                      {review.avatar ? (
                        <Image
                          src={review.avatar}
                          alt={review.username}
                          width={48}
                          height={48}
                        />
                      ) : (
                        review.username?.charAt(0)?.toUpperCase() || 'U'
                      )}
                    </div>
                    <div>
                      <p className='font-semibold text-gray-900'>
                        {review.username || 'Người dùng'}
                      </p>
                      <p className='text-sm text-gray-500'>
                        {formatDate(review.createdAt)}
                      </p>
                    </div>
                    <div className='ml-auto text-right'>
                      {renderStars(review.rating)}
                      <p className='text-sm text-gray-500'>
                        {review.rating} / 5
                      </p>
                    </div>
                  </div>
                  {review.title && (
                    <h3 className='text-lg font-semibold text-gray-900'>
                      {review.title}
                    </h3>
                  )}
                  <p className='text-gray-700 leading-relaxed whitespace-pre-line'>
                    {review.content}
                  </p>
                  {review.images?.length > 0 && (
                    <div className='grid grid-cols-2 md:grid-cols-3 gap-3'>
                      {review.images.map((src, idx) => (
                        <button
                          key={src}
                          type='button'
                          onClick={() => {
                            setLightboxImages(review.images)
                            setLightboxIndex(idx)
                            setLightboxOpen(true)
                          }}
                          className='relative aspect-video rounded-xl overflow-hidden border focus:outline-none focus:ring-2 focus:ring-primary'
                        >
                          <Image
                            src={src}
                            alt='review image'
                            fill
                            className='object-cover'
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {lightboxOpen && lightboxImages.length > 0 && (
        <div className='fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4'>
          <button
            onClick={() => setLightboxOpen(false)}
            className='absolute top-4 right-4 text-white hover:text-gray-200'>
            <Icon icon='solar:close-circle-bold' className='w-8 h-8' />
          </button>

          <button
            type='button'
            onClick={() =>
              setLightboxIndex(
                (prev) => (prev - 1 + lightboxImages.length) % lightboxImages.length
              )
            }
            className='absolute left-4 md:left-8 text-white hover:text-gray-200'>
            <Icon icon='solar:alt-arrow-left-bold' className='w-8 h-8' />
          </button>

          <div className='relative max-w-4xl w-full max-h-[80vh]'>
            <Image
              src={lightboxImages[lightboxIndex]}
              alt='review-full'
              fill
              className='object-contain'
            />
          </div>

          <button
            type='button'
            onClick={() =>
              setLightboxIndex((prev) => (prev + 1) % lightboxImages.length)
            }
            className='absolute right-4 md:right-8 text-white hover:text-gray-200'>
            <Icon icon='solar:alt-arrow-right-bold' className='w-8 h-8' />
          </button>
        </div>
      )}
    </div>
  )
}

export default ReviewsPage


