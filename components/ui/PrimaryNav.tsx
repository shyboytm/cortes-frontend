'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'

type NavLink = {
  label: string
  href: string
  accent?: boolean
}

// Music/Photos/Contact don't have real routes yet — pointing at "#" for now
// until those pages/sections exist.
const NAV_LINKS: NavLink[] = [
  { label: 'Work', href: '/work' },
  { label: 'Feed', href: '/posts' },
  { label: 'Music', href: '#' },
  { label: 'Photos', href: '#' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '#', accent: true },
]

export default function PrimaryNav() {
  return (
    <header>
      <div
        id="primary-nav"
        className="dot-font fixed glass inset-x-6 top-8 z-40 flex items-center justify-between gap-6 rounded-lg border border-white/10 bg-black/90 px-6 py-3 font-doto text-white"
      >
        <span className="text-sm tracking-widest uppercase whitespace-nowrap">
          Dennis Cortes
        </span>

        <nav>
          <ul className="flex items-center gap-6 text-sm tracking-widest">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className={cn(
                    'uppercase transition-colors',
                    link.accent
                      ? 'text-red-500 hover:text-red-400'
                      : 'text-white/80 hover:text-white'
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}
