import Image from 'next/image'
import Link from 'next/link'

const Logo: React.FC = () => {
  return (
    <div className="flex justify-center items-center">
      <Link href='/' className='flex items-center gap-0'>
        <Image
          src='/images/Logo/icon.png'
          alt='logo'
          width={56}
          height={56}
          className='w-[56px] h-[56px]'
          quality={100}
        />
        <p className='text-secondary text-2xl font-semibold leading-tight'>
          Kỳ Vương Sưu Tầm
        </p>
      </Link>
    </div>
  )
}

export default Logo
