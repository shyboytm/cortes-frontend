'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

type NavLink = {
  label: string
  href: string
  accent?: boolean
}

// Photos/Contact don't have real routes yet — pointing at "#" for now until
// those pages/sections exist.
const NAV_LINKS: NavLink[] = [
  { label: 'Work', href: '/work' },
  { label: 'Feed', href: '/feed' },
  { label: 'Blog', href: '/blog' },
  { label: 'Music', href: '/music' },
  { label: 'Photos', href: '#' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '#', accent: true },
]

export default function PrimaryNav() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  // Tracks the pathname the menu's open state was last computed for. When
  // the route changes, close the menu right during render rather than in an
  // effect — this is React's recommended way to "reset state when a prop
  // changes" and avoids an extra render pass.
  const [menuPathname, setMenuPathname] = useState(pathname)

  if (pathname !== menuPathname) {
    setMenuPathname(pathname)
    setIsOpen(false)
  }

  // Locks background scroll while the fullscreen mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // "/work" should read as active on both the index and its case-study
  // pages ("/work/foo"), same idea for "/blog" — anything without a real
  // route yet ("#") never counts as active.
  const isActive = (href: string) =>
    href !== '#' && (pathname === href || pathname.startsWith(`${href}/`))

  const linkClassName = (link: NavLink) =>
    cn(
      'link-underline uppercase transition-colors',
      isActive(link.href) && 'is-active',
      link.accent
        ? 'text-red-800 dark:text-red-500 hover:text-red-900 dark:hover:text-red-400'
        : 'text-black/80 dark:text-white/80 hover:text-black dark:hover:text-white'
    )

  return (
    <header>
      {/* Fixed positioning is relative to the viewport, so the nav needs its
          own max-w-7xl wrapper to line up with the (now width-capped)
          content underneath it on large screens. z-50 (higher than the
          fullscreen mobile menu below) keeps the hamburger/X clickable and
          visible above it regardless of DOM order. */}
      <div className="fixed inset-x-0 top-8 z-50 px-6">
        <div
          id="primary-nav"
          className="dot-font glass mx-auto flex max-w-7xl items-center justify-between gap-6 rounded-lg border border-black/10 dark:border-white/10 bg-white/80 dark:bg-black/80 px-6 py-3 font-doto text-black dark:text-white"
        >
          <Link
            href="/"
            className="text-sm tracking-widest uppercase whitespace-nowrap text-black/80 dark:text-white/80 hover:text-black dark:hover:text-white"
          >
            Dennis Cortes
          </Link>

          <nav className="hidden lg:block">
            <ul className="flex items-center gap-6 text-sm tracking-widest">
              {NAV_LINKS.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className={linkClassName(link)}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Hamburger / X toggle — tablet and mobile only. Three bars that
              morph into an X via transform/opacity rather than swapping
              icons, so the open/close motion feels intentional. */}
          <button
            type="button"
            onClick={() => setIsOpen((open) => !open)}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isOpen}
            className="relative flex h-8 w-8 shrink-0 flex-col items-center justify-center gap-1.5 lg:hidden"
          >
            <span
              className={cn(
                'h-0.5 w-6 bg-current transition-transform duration-300 ease-in-out',
                isOpen && 'translate-y-2 rotate-45'
              )}
            />
            <span
              className={cn(
                'h-0.5 w-6 bg-current transition-opacity duration-200 ease-in-out',
                isOpen && 'opacity-0'
              )}
            />
            <span
              className={cn(
                'h-0.5 w-6 bg-current transition-transform duration-300 ease-in-out',
                isOpen && '-translate-y-2 -rotate-45'
              )}
            />
          </button>
        </div>
      </div>

      {/* Fullscreen mobile menu — sits below the bar above (z-40 vs z-50) so
          the hamburger/X stays usable the whole time. */}
      <div
        className={cn(
          'dot-font fixed inset-0 z-40 flex flex-col items-center justify-center gap-8 bg-white font-doto text-black transition-all duration-300 ease-in-out dark:bg-black dark:text-white lg:hidden',
          isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        )}
      >
        <ul className="flex flex-col items-center gap-8 text-center text-2xl tracking-widest">
          {NAV_LINKS.map((link) => (
            <li key={link.label}>
              <Link href={link.href} className={linkClassName(link)}>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </header>
  )
}
