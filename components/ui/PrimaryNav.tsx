'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Instagram, Linkedin, ArrowRight } from 'lucide-react'
import { SiX, SiDribbble, SiYoutube, SiBuymeacoffee } from '@icons-pack/react-simple-icons'
import { cn } from '@/lib/utils'
import NavDotGrid from '@/components/ui/NavDotGrid'
import NashvilleStatus from '@/components/ui/NashvilleStatus'

type NavLink = {
  label: string
  href: string
}

// One flat, left-aligned column of every menu link, in display order —
// previously split into an ungrouped "top" set plus categorized groups
// (Work/Shop, Thoughts, Creative) each under their own "/ Label" header,
// but that grouping/heading treatment was removed in favor of a single
// uniform list.
const NAV_LINKS: NavLink[] = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Work', href: '/work' },
  { label: 'Shop', href: '/shop' },
  { label: 'Writing', href: '/writing' },
  { label: 'Recs', href: '/recs' },
  { label: 'Music', href: '/music' },
  { label: 'Photos', href: 'https://glass.photo/cortes' },
]

// Same real socials as PrimaryFooter's SOCIAL_LINKS and the About page's
// CONTACT_LINKS — kept in sync by hand since this is now a third place
// that needs them.
const SOCIAL_LINKS = [
  { label: 'Instagram', href: 'https://www.instagram.com/shyboytm/', icon: Instagram },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/fromcortes/', icon: Linkedin },
  { label: 'X', href: 'https://x.com/shyboytm', icon: SiX },
  { label: 'Dribbble', href: 'https://dribbble.com/shyboytm', icon: SiDribbble },
  { label: 'YouTube', href: 'https://www.youtube.com/cortesarts', icon: SiYoutube },
  { label: 'Buy Me a Coffee', href: 'https://buymeacoffee.com/cortes', icon: SiBuymeacoffee },
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

  // Locks background scroll while the fullscreen menu is open.
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // "/work" should read as active on both the index and its case-study
  // pages ("/work/foo"), same idea for "/writing" — anything without a real
  // route yet ("#") never counts as active. "/" only matches the exact
  // homepage, otherwise every other page would also read "Home" as active.
  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : href !== '#' && (pathname === href || pathname.startsWith(`${href}/`))

  // Active item gets the same red "accent" treatment the old dropdown-era
  // nav used specifically for the Info/About link — now applied to
  // whichever link matches the current route instead of one hardcoded item.
  const linkClassName = (href: string) =>
    cn(
      'transition-colors',
      isActive(href)
        ? 'text-red-800 dark:text-red-500'
        : 'text-black/70 hover:text-black dark:text-white/70 dark:hover:text-white'
    )

  // Shared between every link in the flat column. A circular arrow badge
  // (same treatment WorkRow uses on its project thumbnails) fades/scales in
  // next to the label on hover as a "go here" affordance — the glow lives on
  // the circle itself (a box-shadow) rather than the arrow glyph, so it
  // reads as the badge lighting up instead of the icon glowing in isolation.
  // Each item also slides/fades in with a small per-index stagger when the
  // menu opens, and fades back out together (no stagger) on close.
  const renderLink = (link: NavLink, index: number) => (
    <li
      key={link.href}
      className={cn(
        'transition-all duration-300 ease-out',
        isOpen ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
      )}
      style={{ transitionDelay: isOpen ? `${index * 40}ms` : '0ms' }}
    >
      <Link href={link.href} className={cn(linkClassName(link.href), 'group inline-flex w-fit items-center gap-4')}>
        <span>{link.label}</span>
        <span className="flex h-8 w-8 shrink-0 scale-75 items-center justify-center rounded-full bg-black/70 text-white opacity-0 backdrop-blur-sm transition-all duration-200 group-hover:scale-100 group-hover:opacity-100 dark:bg-white/80 dark:text-black dark:shadow-[0_0_8px_rgba(255,255,255,0.6)]">
          <ArrowRight size={16} />
        </span>
      </Link>
    </li>
  )

  return (
    <header>
      {/* Fixed positioning is relative to the viewport, so the nav needs its
          own max-w-7xl wrapper to line up with the (now width-capped)
          content underneath it on large screens. z-50 (higher than the
          fullscreen menu below) keeps the hamburger/X clickable and visible
          above it regardless of DOM order. */}
      <div className="fixed inset-x-0 top-8 z-50 px-3 md:px-4 lg:px-6">
        <div
          id="primary-nav"
          className="dot-font glass relative mx-auto flex max-w-7xl items-center justify-between gap-6 rounded-lg border border-black/10 dark:border-white/10 bg-white/80 dark:bg-black/80 px-6 py-3 font-doto text-black dark:text-white"
        >

          {/* NavDotGrid's shader canvas is absolute+inset-0 and would
              otherwise spill past the bar's rounded corners — clip it to
              its own wrapper rather than putting overflow-hidden on the bar
              itself. */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg">
            <NavDotGrid />
          </div>

          <div className="relative z-10 flex items-center gap-4">
            {/* Hamburger / X toggle — now the only way into the nav at every
                breakpoint, not just mobile/tablet. Two bars that morph into
                an X via transform/rotate rather than swapping icons, so the
                open/close motion feels intentional. cursor-pointer + a color
                transition give it the same hover/pointer affordance as every
                other clickable control on the site. Sits left of the
                wordmark now — the right side of the bar is Nashville's
                live time/weather instead. */}
            <button
              type="button"
              onClick={() => setIsOpen((open) => !open)}
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isOpen}
              className="flex h-6 w-6 shrink-0 cursor-pointer flex-col items-center justify-center gap-1.5 text-black/80 transition-colors hover:text-black dark:text-white/80 dark:hover:text-white"
            >
              <span
                className={cn(
                  'h-0.5 w-5 rounded-full bg-current transition-transform duration-300 ease-in-out',
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
              className="text-sm tracking-widest uppercase whitespace-nowrap text-black/80 dark:text-white/80 hover:text-black dark:hover:text-white"
            >
              Dennis Cortes
            </Link>
          </div>

          {/* Same live Nashville time + weather as the footer, now also
              surfaced up here in the spot the hamburger used to occupy.
              Hidden below sm — not enough room next to the logo/hamburger
              on phones. */}
          <NashvilleStatus className="dot-font relative z-10 hidden font-doto text-xs tracking-widest text-black/80 uppercase sm:block dark:text-white/80" />
        </div>
      </div>

      {/* Fullscreen menu — sits below the bar above (z-40 vs z-50) so the
          hamburger/X stays usable the whole time. Shared by every
          breakpoint now: one flat, left-aligned column of links (no more
          section headers/groups), then email + social links at the bottom
          — modeled on the reference menu Dennis sent. 80%-opacity + glass
          blur rather than a fully solid background. Top-anchored (not
          vertically centered) since with this many links this menu can
          still run taller than the viewport and needs to scroll from the
          top rather than opening already off-screen-center. */}
      <div
        onClick={() => setIsOpen(false)}
        className={cn(
          'dot-font glass fixed inset-0 z-40 overflow-y-auto bg-white/80 font-doto text-black transition-all duration-300 ease-in-out dark:bg-black/80 dark:text-white',
          isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        )}
      >
        {/* Two-level padding here deliberately mirrors the bar above's own
            structure (outer full-width px-3/md:px-4/lg:px-6, then an inner
            mx-auto max-w-7xl block with its own px-6) instead of one flat,
            hand-summed padding value — that way this column's left edge is
            structurally guaranteed to line up with the hamburger's position
            at every breakpoint/viewport width, rather than relying on
            arithmetic that's easy to get subtly wrong. Clicking the
            backdrop above closes the menu — clicking a link or icon does
            too, but that's just piggybacking on the same handler since
            navigating away closes it regardless. */}
        <div className="px-3 py-28 sm:py-32 md:px-4 lg:px-6">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6">
            <ul className="flex flex-col gap-3 font-sans text-4xl normal-case sm:text-5xl lg:text-4xl lg:gap-5 [text-shadow:none] dark:[text-shadow:0_0_5px_currentColor]">
              {NAV_LINKS.map(renderLink)}
            </ul>

            <Link
              href="mailto:hi@cortes.us"
              className="w-fit font-sans text-xl text-black/70 transition-colors hover:text-black sm:text-2xl dark:text-white/70 dark:hover:text-white"
            >
              hi@cortes.us
            </Link>

            <div className="flex flex-wrap gap-5">
              {SOCIAL_LINKS.map((social) => (
                <Link
                  key={social.href}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="text-black/60 transition-colors hover:text-black dark:text-white/60 dark:hover:text-white"
                >
                  <social.icon size={20} />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
