'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, Volume2, VolumeX, X } from 'lucide-react'
import { setEnabled as setCuelumeEnabled, play } from 'cuelume'
import { cn } from '@/lib/utils'
import NashvilleStatus from '@/components/ui/NashvilleStatus'
import { SOCIAL_LINKS } from '@/lib/social-links'
import { useLockBodyScroll } from '@/lib/hooks/useLockBodyScroll'
import { getStoredSoundEnabled, setStoredSoundEnabled } from '@/lib/sound-preference'

type NavLink = {
  label: string
  href: string
}

const NAV_LINKS: NavLink[] = [
  { label: 'Work', href: '/work' },
  { label: 'Music', href: '/music' },
  { label: 'Photos', href: '/photos' },
  { label: 'Writing', href: '/writing' },
  { label: 'Shop', href: '/shop' },
  { label: 'Recs', href: '/recs' },
  { label: 'About', href: '/about' },
]

export default function PrimaryNav() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [menuPathname, setMenuPathname] = useState(pathname)
  const [soundEnabled, setSoundEnabled] = useState(true)

  if (pathname !== menuPathname) {
    setMenuPathname(pathname)
    setIsOpen(false)
  }

  useEffect(() => {
    setSoundEnabled(getStoredSoundEnabled())
  }, [])

  const handleToggleSound = (event: React.MouseEvent) => {
    event.stopPropagation()
    const next = !soundEnabled
    setSoundEnabled(next)
    setStoredSoundEnabled(next)
    setCuelumeEnabled(next)
    if (next) play('toggle')
  }

  useLockBodyScroll(isOpen)

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : href !== '#' && (pathname === href || pathname.startsWith(`${href}/`))

  const linkClassName = (href: string) =>
    cn(
      'transition-colors',
      isActive(href)
        ? 'text-red-800 dark:text-red-500'
        : 'text-black/70 hover:text-black dark:text-white/70 dark:hover:text-white'
    )

  const renderLink = (link: NavLink, index: number) => (
    <li
      key={link.href}
      className={cn(
        'transition-all duration-300 ease-out',
        isOpen ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
      )}
      style={{ transitionDelay: isOpen ? `${index * 40}ms` : '0ms' }}
    >
      <Link
        href={link.href}
        onClick={() => setIsOpen(false)}
        data-cuelume-hover="tick"
        className={cn(linkClassName(link.href), 'inline-block w-fit transition-all duration-200 ease-out hover:translate-x-3')}
      >
        {link.label}
      </Link>
    </li>
  )

  return (
    <header>
      <div className="fixed inset-x-0 top-8 z-50 px-3 md:px-4 lg:px-6">
        <div
          id="primary-nav"
          className="glass relative mx-auto flex max-w-7xl items-center justify-between gap-6 rounded-lg border border-black/10 dark:border-white/10 bg-white/80 dark:bg-black/80 py-3 px-5 font-doto text-black dark:text-white"
        >

          <div className="relative z-10 flex items-center gap-4">

            <button
              type="button"
              onClick={() => setIsOpen((open) => !open)}
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isOpen}
              data-cuelume-hover="tick"
              data-cuelume-toggle
              className="relative flex h-6 w-5 shrink-0 cursor-pointer items-center justify-center text-black/80 transition-colors hover:text-black dark:text-white/80 dark:hover:text-white"
            >
              <Menu
                size={24}
                className={cn(
                  'absolute transition-all duration-300 ease-in-out',
                  isOpen ? 'scale-75 rotate-45 opacity-0' : 'scale-100 rotate-0 opacity-100'
                )}
              />
              <X
                size={24}
                className={cn(
                  'absolute transition-all duration-300 ease-in-out',
                  isOpen ? 'scale-100 rotate-0 opacity-100' : 'scale-75 -rotate-45 opacity-0'
                )}
              />
            </button>

            <Link
              href="/"
              className="font-sans text-xs font-medium tracking-widest uppercase whitespace-nowrap text-black/80 dark:text-white/80 hover:text-black dark:hover:text-white"
            >
              Dennis Cortes
            </Link>
          </div>

          <NashvilleStatus className="dot-font relative z-10 hidden font-doto text-xs tracking-widest text-black/80 uppercase sm:block dark:text-white/80" />
        </div>
      </div>

      <div
        onClick={() => setIsOpen(false)}
        className={cn(
          'dot-font glass fixed inset-0 z-[45] overflow-y-auto bg-white/80 font-doto text-black transition-all duration-300 ease-in-out dark:bg-black/80 dark:text-white',
          isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        )}
      >

        <div className="px-3 py-28 sm:py-32 md:px-4 lg:px-6">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6">
            <ul className="flex flex-col gap-4 font-sans font-normal text-3xl normal-case sm:text-5xl lg:text-4xl lg:gap-5 [text-shadow:none] dark:[text-shadow:0_0_5px_currentColor]">
              {NAV_LINKS.map(renderLink)}
            </ul>

            <Link
              href="mailto:hi@cortes.us"
              data-cuelume-hover="tick"
              className="w-fit font-sans text-base font-normal mt-3 text-black/70 transition-colors hover:text-black sm:text-2xl dark:text-white/70 dark:hover:text-white"
            >
              hi@cortes.us
            </Link>

            <div className="flex flex-wrap gap-5 mt-3 sm:mt-0">
              {SOCIAL_LINKS.map((social) => (
                <Link
                  key={social.href}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  data-cuelume-hover="tick"
                  data-cuelume-press
                  className="text-black/60 transition-colors hover:text-black dark:text-white/60 dark:hover:text-white"
                >
                  <social.icon size={20} className="svg-shadow" />
                </Link>
              ))}
            </div>

            <button
              type="button"
              onClick={handleToggleSound}
              aria-pressed={soundEnabled}
              aria-label={soundEnabled ? 'Turn sound off' : 'Turn sound on'}
              data-cuelume-hover="tick"
              className="flex w-fit items-center gap-3 text-sm font-normal text-black/70 transition-colors hover:text-black sm:text-base dark:text-white/70 dark:hover:text-white"
            >
              {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
              <span className="w-20 whitespace-nowrap text-xs tracking-widest uppercase sm:w-24 dark:[text-shadow:0_0_5px_currentColor]">
                Sound {soundEnabled ? 'On' : 'Off'}
              </span>
              <span
                aria-hidden
                className={cn(
                  'inline-flex h-5 w-9 shrink-0 items-center rounded-full border px-0.5 transition-colors duration-200',
                  soundEnabled
                    ? 'border-black bg-black dark:border-white dark:bg-white'
                    : 'border-black/20 bg-black/10 dark:border-white/20 dark:bg-white/10'
                )}
              >
                <span
                  className={cn(
                    'h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 dark:bg-black',
                    soundEnabled ? 'translate-x-4' : 'translate-x-0'
                  )}
                />
              </span>
            </button>

          </div>
        </div>
      </div>
    </header>
  )
}
