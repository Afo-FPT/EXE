import { Merienda  } from 'next/font/google'
import './globals.css'
import Header from '@/app/components/Layout/Header'
import Footer from '@/app/components/Layout/Footer'
import ScrollToTop from '@/app/components/ScrollToTop'
import { AuthProvider } from '@/contexts/AuthContext'
import { CartProvider } from '@/contexts/CartContext'
import ErrorBoundary from '@/components/ErrorBoundary'
const font = Merienda ({
  subsets: ['vietnamese'],
  weight: ['400'],
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
             <body className={`${font.className}`}>
         <ErrorBoundary>
           <AuthProvider>
             <CartProvider>
               <Header />
               {children}
               <Footer />
               <ScrollToTop />
             </CartProvider>
           </AuthProvider>
         </ErrorBoundary>
       </body>
    </html>
  )
}
