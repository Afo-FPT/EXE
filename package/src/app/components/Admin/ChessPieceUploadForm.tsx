'use client'

import { useState } from 'react'
import { buildApiUrl } from '@/config/api'
// import { uploadToVercelBlob } from '@/app/api/upload/blob/client-upload'

interface ChessPieceUploadFormProps {
  onSuccess: () => void
  onClose: () => void
}

interface UploadProgress {
  isUploading: boolean
  progress: number
  message: string
}

export default function ChessPieceUploadForm({ onSuccess, onClose }: ChessPieceUploadFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'xe',
    collection: '',
    description: '',
    price: '',
    discountPercent: '0',
    stock: '1'
  })
  
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    isUploading: false,
    progress: 0,
    message: ''
  })
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['glb', 'gltf', 'obj', 'fbx', 'dae']
      const fileExtension = file.name.split('.').pop()?.toLowerCase()
      
      if (!fileExtension || !allowedTypes.includes(fileExtension)) {
        alert(`File type not supported. Allowed types: ${allowedTypes.join(', ')}`)
        return
      }
      
      // Validate file size (increased limit for EC2)
      if (file.size > 100 * 1024 * 1024) {
        alert('File too large. Maximum size is 100MB.')
        return
      }
      
      setSelectedFile(file)
      
      // Create preview URL for file name display
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedFile) {
      alert('Please select a 3D model file')
      return
    }

    setUploadProgress({
      isUploading: true,
      progress: 0,
      message: 'Preparing upload...'
    })

    try {
      // Step 1: Upload 3D model to Vercel Blob using server-side upload
      setUploadProgress({
        isUploading: true,
        progress: 10,
        message: 'Preparing 3D model upload...'
      })

      const uploadFormData = new FormData()
      uploadFormData.append('file', selectedFile)
      uploadFormData.append('collection', formData.collection || 'default')

      // Show file size info
      const fileSizeMB = (selectedFile.size / 1024 / 1024).toFixed(2)
      setUploadProgress({
        isUploading: true,
        progress: 20,
        message: `Uploading 3D model (${fileSizeMB}MB) to Vercel Blob...`
      })

      const uploadResponse = await fetch(buildApiUrl('/upload/blob'), {
        method: 'POST',
        body: uploadFormData
      })

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const uploadResult = await uploadResponse.json()
      console.log('✅ 3D model uploaded to Vercel Blob:', uploadResult)

      setUploadProgress({
        isUploading: true,
        progress: 70,
        message: 'Creating chess piece...'
      })

      // Step 2: Create chess piece with 3D model URL
      const chessPieceFormData = new FormData()
      chessPieceFormData.append('name', formData.name)
      chessPieceFormData.append('type', formData.type)
      chessPieceFormData.append('collection', formData.collection)
      chessPieceFormData.append('description', formData.description)
      chessPieceFormData.append('price', formData.price)
      chessPieceFormData.append('discountPercent', formData.discountPercent)
      chessPieceFormData.append('stock', formData.stock)
      chessPieceFormData.append('model3D', uploadResult.url)

      const chessPieceResponse = await fetch(buildApiUrl('/chess-pieces'), {
        method: 'POST',
        body: chessPieceFormData
      })

      if (!chessPieceResponse.ok) {
        const errorData = await chessPieceResponse.json()
        throw new Error(errorData.message || 'Failed to create chess piece')
      }

      setUploadProgress({
        isUploading: true,
        progress: 100,
        message: 'Success! Chess piece created with 3D model.'
      })

      // Clean up preview URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }

      // Reset form
      setFormData({
        name: '',
        type: 'xe',
        collection: '',
        description: '',
        price: '',
        discountPercent: '0',
        stock: '1'
      })
      setSelectedFile(null)
      setPreviewUrl(null)

      setTimeout(() => {
        onSuccess()
        onClose()
      }, 1000)

    } catch (error) {
      console.error('❌ Upload error:', error)
      setUploadProgress({
        isUploading: false,
        progress: 0,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Thêm Quân Cờ Mới</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              disabled={uploadProgress.isUploading}
            >
              &times;
            </button>
          </div>

          {uploadProgress.isUploading && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-700">{uploadProgress.message}</span>
                <span className="text-sm text-blue-600">{uploadProgress.progress}%</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress.progress}%` }}
                ></div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên Quân Cờ *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  disabled={uploadProgress.isUploading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ví dụ: Xe Cổ Điển"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loại Quân Cờ *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                  disabled={uploadProgress.isUploading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="xe">Xe</option>
                  <option value="hậu">Hậu</option>
                  <option value="mã">Mã</option>
                  <option value="tượng">Tượng</option>
                  <option value="tốt">Tốt</option>
                  <option value="vua">Vua</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Collection *
              </label>
              <input
                type="text"
                name="collection"
                value={formData.collection}
                onChange={handleInputChange}
                required
                disabled={uploadProgress.isUploading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ví dụ: Cổ Điển, Hiện Đại, Fantasy"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mô tả *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                disabled={uploadProgress.isUploading}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Mô tả chi tiết về quân cờ..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giá ($) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  disabled={uploadProgress.isUploading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giảm giá (%)
                </label>
                <input
                  type="number"
                  name="discountPercent"
                  value={formData.discountPercent}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  disabled={uploadProgress.isUploading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số lượng *
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  required
                  min="1"
                  disabled={uploadProgress.isUploading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="1"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                File 3D Model *
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
                <div className="space-y-1 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                      <span>Upload 3D model</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        accept=".glb,.gltf,.obj,.fbx,.dae"
                        onChange={handleFileChange}
                        disabled={uploadProgress.isUploading}
                        className="sr-only"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    GLB, GLTF, OBJ, FBX, DAE up to 10MB (Server-side upload)
                  </p>
                </div>
              </div>
              
              {selectedFile && (
                <div className="mt-2 p-3 bg-green-50 rounded-md">
                  <div className="flex items-center">
                    <svg className="flex-shrink-0 h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-800">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-green-600">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={uploadProgress.isUploading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={uploadProgress.isUploading || !selectedFile}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploadProgress.isUploading ? 'Đang tạo...' : 'Tạo Quân Cờ'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
