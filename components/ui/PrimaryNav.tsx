'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import NavDotGrid from '@/components/ui/NavDotGrid'
import NashvilleStatus from '@/components/ui/NashvilleStatus'
import { SOCIAL_LINKS } from '@/lib/social-links'

type NavLink = {
  label: string
  href: string
}

// One flat, left-aligned column of every menu link, in display order.
const NAV_LINKS: NavLink[] = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Work', href: '/work' },
  { label: 'Music', href: '/music' },
  { label: 'Recs', href: '/recs' },
  { label: 'Shop', href: '/shop' },
  { label: 'Writing', href: '/writing' },
  { label: 'Photos', href: 'https://glass.photo/cortes' },
]

export default function PrimaryNav() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  // Tracks the pathname the menu's open state was last computed for. When
  // the route changes, the menu closes during render.
  const [menuPathname, setMenuPathname] = useState(pathname)

  if (pathname !== menuPathname) {
    setMenuPathname(pathname)
    setIsOpen(false)
  }

  // Locks background scroll while the fullscreen menu is open.
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Determines whether a nav link matches the current route. "/work" and
  // "/writing" match both their index page and any subpage under them
  // (e.g. "/work/foo"). Links without a real route ("#") are never active.
  // "/" matches only the exact homepage.
  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : href !== '#' && (pathname === href || pathname.startsWith(`${href}/`))

  // Applies a red accent color to whichever link matches the current route.
  const linkClassName = (href: string) =>
    cn(
      'transition-colors',
      isActive(href)
        ? 'text-red-800 dark:text-red-500'
        : 'text-black/70 hover:text-black dark:text-white/70 dark:hover:text-white'
    )

  // Shared between every link in the flat column. The label shifts right
  // on hover. Each item slides/fades in with a small per-index stagger when
  // the menu opens, and fades back out together (no stagger) on close.
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
        className={cn(linkClassName(link.href), 'inline-block w-fit transition-all duration-200 ease-out hover:translate-x-3')}
      >
        {link.label}
      </Link>
    </li>
  )

  return (
    <header>
      {/* Fixed positioning is relative to the viewport; this max-w-7xl
          wrapper lines the nav up with the content underneath it on large
          screens. z-50 keeps the hamburger/X above the fullscreen menu
          regardless of DOM order. */}
      <div className="fixed inset-x-0 top-8 z-50 px-3 md:px-4 lg:px-6">
        <div
          id="primary-nav"
          className="glass relative mx-auto flex max-w-7xl items-center justify-between gap-6 rounded-lg border border-black/10 dark:border-white/10 bg-white/80 dark:bg-black/80 py-3 px-5 font-doto text-black dark:text-white"
        >

          {/* Clips NavDotGrid's absolute, inset-0 shader canvas to the bar's
              rounded corners. */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg">
            <NavDotGrid />
          </div>

          <div className="relative z-10 flex items-center gap-4">

            <button
              type="button"
              onClick={() => setIsOpen((open) => !open)}
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isOpen}
              className="flex h-6 w-6 shrink-0 cursor-pointer flex-col items-center justify-center gap-1.5 text-black/80 transition-colors hover:text-black dark:text-white/80 dark:hover:text-white"
            >
              <span
                className={cn(
                  'h-[2.25] w-5 rounded-full bg-current transition-transform duration-300 ease-in-out',
                  isOpen && 'translate-y-1 rotate-45'
                )}
              />
              <span
                className={cn(
                  'h-0.5 w-5 rounded-full bg-current transition-transform duration-300 ease-in-out',
                  isOpen && '-translate-y-1 -rotate-45'
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
            <ul className="flex flex-col gap-3 font-sans font-normal text-4xl normal-case sm:text-5xl lg:text-4xl lg:gap-5 [text-shadow:none] dark:[text-shadow:0_0_5px_currentColor]">
              {NAV_LINKS.map(renderLink)}
            </ul>

            <Link
              href="mailto:hi@cortes.us"
              className="w-fit font-sans text-sm font-normal mt-3 text-black/70 transition-colors hover:text-black sm:text-2xl dark:text-white/70 dark:hover:text-white"
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
                  className="text-black/60 transition-colors hover:text-black dark:text-white/60 dark:hover:text-white"
                >
                  <social.icon size={20} className="svg-shadow" />
                </Link>
              ))}
            </div>

          </div>
        </div>
      </div>
    </header>
  )
}
