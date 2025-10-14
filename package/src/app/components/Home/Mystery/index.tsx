'use client'
import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'

export default function CaseOpening() {
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const characters = [
    { 
      name: 'Lý Thường Kiệt', 
      rarity: 'legendary',
      type: 'Tướng Quân',
      description: 'Vị tướng tài ba của nhà Lý',
      icon: '⚔️',
      color: 'from-amber-600 to-yellow-500'
    },
    { 
      name: 'Trần Hưng Đạo', 
      rarity: 'mythical',
      type: 'Đại Tướng',
      description: 'Vị tướng vĩ đại chống quân Nguyên',
      icon: '🗡️',
      color: 'from-purple-600 to-pink-500'
    },
    { 
      name: 'Lê Lợi', 
      rarity: 'epic',
      type: 'Vua',
      description: 'Vị vua khởi nghĩa Lam Sơn',
      icon: '👑',
      color: 'from-red-600 to-orange-500'
    },
    { 
      name: 'Nguyễn Huệ', 
      rarity: 'rare',
      type: 'Hoàng Đế',
      description: 'Vị hoàng đế Quang Trung',
      icon: '🏰',
      color: 'from-blue-600 to-cyan-500'
    },
    { 
      name: 'Phùng Hưng', 
      rarity: 'uncommon',
      type: 'Tướng',
      description: 'Vị tướng chống Bắc thuộc',
      icon: '🛡️',
      color: 'from-green-600 to-emerald-500'
    },
    { 
      name: 'Mai Thúc Loan', 
      rarity: 'common',
      type: 'Lãnh Tụ',
      description: 'Lãnh tụ khởi nghĩa chống Đường',
      icon: '⚡',
      color: 'from-gray-600 to-slate-500'
    },
  ]

  const startOpening = () => {
    if (spinning) return

    setSpinning(true)
    setResult(null)
    setShowResult(false)

    let rounds = 0
    const totalRounds = 30 + Math.floor(Math.random() * 20)
    let speed = 80

    const spin = () => {
      if (rounds >= totalRounds) {
        setSpinning(false)
        const finalIndex = Math.floor(Math.random() * characters.length)
        setCurrentIndex(finalIndex)
        setResult(characters[finalIndex].name)
        setTimeout(() => setShowResult(true), 500)
        return
      }

      setCurrentIndex(prev => (prev + 1) % characters.length)
      rounds++
      
      if (rounds > totalRounds * 0.7) {
        speed += 15
      }

      setTimeout(spin, speed)
    }

    spin()
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'mythical': return 'text-yellow-300 border-yellow-300'
      case 'legendary': return 'text-purple-300 border-purple-300'
      case 'epic': return 'text-pink-300 border-pink-300'
      case 'rare': return 'text-blue-300 border-blue-300'
      case 'uncommon': return 'text-green-300 border-green-300'
      case 'common': return 'text-gray-300 border-gray-300'
      default: return 'text-white border-white'
    }
  }

  const getRarityBg = (rarity: string) => {
    switch (rarity) {
      case 'mythical': return 'bg-yellow-900/30'
      case 'legendary': return 'bg-purple-900/30'
      case 'epic': return 'bg-pink-900/30'
      case 'rare': return 'bg-blue-900/30'
      case 'uncommon': return 'bg-green-900/30'
      case 'common': return 'bg-gray-900/30'
      default: return 'bg-gray-900/30'
    }
  }

  return (
    <section id='mystery' className='relative overflow-hidden min-h-screen'>
      {/* Blurred Background with Soldiers */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-900/80 via-yellow-900/80 to-amber-800/80">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxwYXR0ZXJuIGlkPSJzb2xkaWVycyIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIj4KICAgICAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0icmdiYSgxOTQsMTQ4LDg4LDAuMSkiLz4KICAgICAgPHN2ZyB4PSIyIiB5PSIyIiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIGZpbGw9InJnYmEoMTk0LDE0OCw4OCwwLjIpIj4KICAgICAgICA8cGF0aCBkPSJNOCA0aC0ydjJoMnYtMk04IDZoLTJ2Mmgydi0yTTggOGgtMnYyaDJ2LTJNMTIgNGgtMnYyaDJ2LTJNMTIgNmgtdjJoMnYtMk0xMiA4aC0ydjJoMnYtMiIvPgogICAgICA8L3N2Zz4KICAgIDwvcGF0dGVybj4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNzb2xkaWVycykiLz4KPC9zdmc+')] opacity-20"></div>
      </div>

      <div className='container relative z-10 py-8'>
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-left">
            <p className="text-amber-200 text-sm font-medium">Thiết Triệu</p>
            <h1 className="text-amber-300 text-3xl font-bold tracking-wider">THIẾT TRIỆU</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-emerald-900/50 px-3 py-2 rounded-lg border border-emerald-600">
              <div className="w-5 h-5 bg-emerald-400 rounded-full"></div>
              <span className="text-emerald-200 font-bold">99999</span>
            </div>
            <div className="flex items-center space-x-2 bg-amber-900/50 px-3 py-2 rounded-lg border border-amber-600">
              <div className="w-5 h-5 bg-amber-400 rounded-full"></div>
              <span className="text-amber-200 font-bold">99999</span>
              <button className="text-amber-400 hover:text-amber-300 text-lg">+</button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar */}
          <div className="space-y-4">
            <button className="w-full bg-gradient-to-r from-amber-800/80 to-yellow-800/80 border border-amber-600 rounded-lg p-4 text-center hover:from-amber-700/80 hover:to-yellow-700/80 transition-all duration-300">
              <div className="text-amber-300 font-bold text-lg">COMING SOON</div>
            </button>
            <button className="w-full bg-gradient-to-r from-amber-800/80 to-yellow-800/80 border border-amber-600 rounded-lg p-4 text-center hover:from-amber-700/80 hover:to-yellow-700/80 transition-all duration-300">
              <div className="text-amber-300 font-bold text-lg">COMING SOON</div>
            </button>
            <button className="w-full bg-gradient-to-r from-amber-800/80 to-yellow-800/80 border border-amber-600 rounded-lg p-4 text-center hover:from-amber-700/80 hover:to-yellow-700/80 transition-all duration-300">
              <div className="text-amber-300 font-bold text-lg">COMING SOON</div>
            </button>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            {!showResult ? (
              <div className="bg-gradient-to-r from-amber-900/90 to-yellow-900/90 border-2 border-amber-600 rounded-2xl p-8 text-center min-h-[400px] flex flex-col justify-center">
                <div className="mb-4">
                  <span className="text-amber-200 text-lg font-medium">Cơ Bản</span>
                </div>
                
                {!spinning ? (
                  <div className="text-amber-300 text-2xl font-bold">COMING SOON</div>
                ) : (
                  <div className="space-y-6">
                    {/* Character Display */}
                    <div className="relative">
                      <div className="w-32 h-32 mx-auto bg-gradient-to-br from-amber-700 to-yellow-600 rounded-full border-4 border-amber-500 flex items-center justify-center shadow-2xl">
                        <span className="text-6xl">{characters[currentIndex].icon}</span>
                      </div>
                      
                      {/* Glow Effect */}
                      <div className="absolute inset-0 w-32 h-32 mx-auto bg-gradient-to-br from-amber-400 to-yellow-300 rounded-full blur-xl opacity-50 animate-pulse"></div>
                    </div>
                    
                    <div className="text-center">
                      <h3 className="text-amber-200 text-xl font-bold mb-2">{characters[currentIndex].name}</h3>
                      <p className="text-amber-300 text-sm mb-1">{characters[currentIndex].type}</p>
                      <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${getRarityColor(characters[currentIndex].rarity)} ${getRarityBg(characters[currentIndex].rarity)}`}>
                        {characters[currentIndex].rarity.toUpperCase()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Result Screen */
              <div className="bg-gradient-to-r from-amber-900/90 to-yellow-900/90 border-2 border-amber-600 rounded-2xl p-8 text-center min-h-[400px] flex flex-col justify-center">
                <div className="text-amber-300 text-3xl font-bold mb-6">Chúc mừng!</div>
                
                <div className="relative mb-6">
                  <div className="w-40 h-40 mx-auto bg-gradient-to-br from-amber-700 to-yellow-600 rounded-full border-4 border-amber-500 flex items-center justify-center shadow-2xl">
                    <span className="text-8xl">{characters[currentIndex].icon}</span>
                  </div>
                  
                  {/* Enhanced Glow Effect */}
                  <div className="absolute inset-0 w-40 h-40 mx-auto bg-gradient-to-br from-amber-400 to-yellow-300 rounded-full blur-2xl opacity-60 animate-pulse"></div>
                </div>
                
                <div className="text-center mb-6">
                  <h3 className="text-amber-200 text-2xl font-bold mb-2">{characters[currentIndex].name}</h3>
                  <p className="text-amber-300 text-lg mb-2">{characters[currentIndex].type}</p>
                  <p className="text-amber-200 text-sm mb-3">{characters[currentIndex].description}</p>
                  <div className={`inline-block px-4 py-2 rounded-full text-sm font-bold border-2 ${getRarityColor(characters[currentIndex].rarity)} ${getRarityBg(characters[currentIndex].rarity)}`}>
                    {characters[currentIndex].rarity.toUpperCase()}
                  </div>
                </div>
                
                <button 
                  onClick={() => setShowResult(false)}
                  className="bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white font-bold py-2 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                  Quay lại
                </button>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-4 mt-6">
              <button
                onClick={startOpening}
                disabled={spinning}
                className={`flex-1 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 disabled:from-amber-800 disabled:to-yellow-800 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center space-x-2`}
              >
                <span>Thiết Triệu X1</span>
                <div className="flex flex-col items-center">
                  <div className="w-4 h-4 bg-amber-300 rounded-full"></div>
                  <span className="text-xs">X1</span>
                </div>
              </button>
              
              <button
                onClick={startOpening}
                disabled={spinning}
                className={`flex-1 bg-gradient-to-r from-amber-700 to-yellow-700 hover:from-amber-800 hover:to-yellow-800 disabled:from-amber-900 disabled:to-yellow-900 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center space-x-2`}
              >
                <span>Thiết Triệu X10</span>
                <div className="flex flex-col items-center">
                  <div className="w-4 h-4 bg-amber-300 rounded-full"></div>
                  <span className="text-xs">X10</span>
                </div>
              </button>
            </div>
          </div>

          {/* Right Side - Reward Pool Display */}
          <div className="relative">
            <div className="bg-gradient-to-br from-amber-800/80 to-yellow-800/80 border-2 border-amber-600 rounded-full w-48 h-48 mx-auto relative overflow-hidden">
              {/* Inner Circle */}
              <div className="absolute inset-4 bg-gradient-to-br from-amber-900 to-yellow-900 rounded-full border border-amber-500 flex items-center justify-center">
                <div className="text-amber-300 text-2xl">⚜️</div>
              </div>
              
              {/* Outer Ring with Icons */}
              <div className="absolute inset-0 rounded-full">
                {characters.map((char, index) => {
                  const angle = (index * 60) * (Math.PI / 180)
                  const radius = 80
                  const x = Math.cos(angle) * radius + 96
                  const y = Math.sin(angle) * radius + 96
                  
                  return (
                    <div
                      key={index}
                      className="absolute w-8 h-8 bg-gradient-to-br from-amber-700 to-yellow-600 rounded-full border border-amber-500 flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2"
                      style={{ left: x, top: y }}
                    >
                      <span className="text-sm">{char.icon}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
          <button className="bg-gradient-to-r from-amber-800/90 to-yellow-800/90 border border-amber-600 rounded-lg px-6 py-3 text-amber-200 font-medium hover:from-amber-700/90 hover:to-yellow-700/90 transition-all duration-300">
            Trang Chủ
          </button>
          <button className="bg-gradient-to-r from-amber-800/90 to-yellow-800/90 border border-amber-600 rounded-lg px-6 py-3 text-amber-200 font-medium hover:from-amber-700/90 hover:to-yellow-700/90 transition-all duration-300">
            Túi Đồ
          </button>
          <button className="bg-gradient-to-r from-amber-800/90 to-yellow-800/90 border border-amber-600 rounded-lg px-6 py-3 text-amber-200 font-medium hover:from-amber-700/90 hover:to-yellow-700/90 transition-all duration-300">
            Lịch Sử
          </button>
        </div>
      </div>

      {/* Custom CSS for enhanced effects */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </section>
  )
}
