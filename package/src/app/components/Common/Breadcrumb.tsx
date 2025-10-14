'use client'
import Link from 'next/link'
import { Icon } from '@iconify/react'

interface BreadcrumbProps {
  items: Array<{
    label: string
    href?: string
  }>
}

const Breadcrumb = ({ items }: BreadcrumbProps) => {
  return (
    <nav className="bg-gray-50 py-4">
      <div className="container mx-auto px-4">
        <ol className="flex items-center space-x-2 text-sm">
          <li>
            <Link href="/" className="text-gray-500 hover:text-gray-700 transition-colors">
              <Icon icon="solar:home-bold" className="w-4 h-4" />
            </Link>
          </li>
          
          {items.map((item, index) => (
            <li key={index} className="flex items-center space-x-2">
              <Icon icon="solar:arrow-right-bold" className="w-4 h-4 text-gray-400" />
              {item.href ? (
                <Link
                  href={item.href}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-gray-900 font-medium">{item.label}</span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  )
}

export default Breadcrumb