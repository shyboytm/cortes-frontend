'use client'

import Link from 'next/link'
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
  { label: 'Feed', href: '/posts' },
  { label: 'Music', href: '/music' },
  { label: 'Photos', href: '#' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '#', accent: true },
]

export default function PrimaryNav() {
  return (
    <header>
      {/* Fixed positioning is relative to the viewport, so the nav needs its
          own max-w-7xl wrapper to line up with the (now width-capped)
          content underneath it on large screens. */}
      <div className="fixed inset-x-0 top-8 z-40 px-6">
        <div
          id="primary-nav"
          className="dot-font glass mx-auto flex max-w-7xl items-center justify-between gap-6 rounded-lg border border-black/10 dark:border-white/10 bg-white/80 dark:bg-black/80 px-6 py-3 font-doto text-black dark:text-white"
        >
        <Link href="/" className="text-sm tracking-widest uppercase whitespace-nowrap text-black/80 dark:text-white/80 hover:text-black dark:hover:text-white">
          Dennis Cortes
        </Link>

        <nav>
          <ul className="flex items-center gap-6 text-sm tracking-widest">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className={cn(
                    'link-underline uppercase transition-colors',
                    link.accent
                      ? 'text-red-800 dark:text-red-500 hover:text-red-900 dark:hover:text-red-400'
                      : 'text-black/80 dark:text-white/80 hover:text-black dark:hover:text-white'
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        </div>
      </div>
    </header>
  )
}
