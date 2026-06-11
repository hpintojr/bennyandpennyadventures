"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useCart } from "./CartProvider";

const links = [
  { label: "Home", href: "/" },
  { label: "About", href: "/#author" },
  { label: "Our Characters", href: "/#family" },
  { label: "Books", href: "/books" },
  { label: "For Parents", href: "/for-parents" },
  { label: "Contact", href: "/contact" }
];

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
    </svg>
  );
}

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { count } = useCart();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href.replace(/#.*$/, ""));
  };

  return (
    <header className="wrap py-5 sm:py-6">
      <div className="relative flex items-start justify-between gap-3 lg:items-center">
        <Link href="/" className="min-w-0 flex-1 text-center leading-none lg:flex-none lg:text-left" aria-label="Benny and Penny's Adventures home">
          <div className="font-serif text-[26px] font-bold text-teal sm:text-[42px] md:text-[46px]">Benny &amp; Penny&rsquo;s</div>
          <div className="text-center font-serif text-[26px] italic text-coral sm:text-[42px] md:text-[46px]">
            <span className="align-middle text-[.85em]">♥</span> Adventures <span className="align-middle text-[.85em]">♥</span>
          </div>
          <p className="mt-2 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#6b5d4f] sm:text-[11px]">Medical Books for Brave Little Hearts</p>
        </Link>

        <nav className="hidden items-center gap-5 text-sm font-bold text-[#102f35] lg:flex xl:gap-7">
          {links.map((link) => (
            <Link key={link.label} href={link.href} className={isActive(link.href) ? "text-coral" : "transition hover:text-coral"}>
              {link.label}
            </Link>
          ))}
        </nav>

        <Link href="/#community" className="hidden rounded-full bg-coral px-6 py-3 font-serif text-lg text-white shadow-sm transition hover:bg-[#d95660] lg:inline-flex">
          Join Our Journey ♥
        </Link>

        <Link href="/cart" aria-label="Cart" className="absolute right-[60px] top-7 inline-flex text-teal transition hover:text-coral lg:static lg:right-auto lg:top-auto">
          <CartIcon />
          {count > 0 && <span className="absolute -right-3 -top-2 grid min-h-[18px] min-w-[18px] place-items-center rounded-full bg-coral px-1 text-[11px] font-extrabold leading-none text-white">{count}</span>}
        </Link>

        <button
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-label="Toggle menu"
          className="absolute right-[5px] top-6 grid h-11 w-11 shrink-0 place-items-center rounded-full border border-tan bg-white/70 text-xl leading-none text-teal lg:hidden"
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {open && (
        <nav className="mt-4 flex flex-col gap-1 rounded-2xl border border-tan bg-white/70 p-3 text-center lg:hidden">
          {links.map((link) => (
            <Link key={link.label} href={link.href} onClick={() => setOpen(false)} className="rounded-lg px-4 py-2 font-bold text-[#102f35] hover:bg-blush hover:text-coral">
              {link.label}
            </Link>
          ))}
          <Link href="/cart" onClick={() => setOpen(false)} className="rounded-lg px-4 py-2 font-bold text-[#102f35] hover:bg-blush hover:text-coral">
            Cart{count ? ` (${count})` : ""}
          </Link>
          <Link href="/#community" onClick={() => setOpen(false)} className="mt-2 rounded-full bg-coral px-6 py-3 font-serif text-lg text-white">
            Join Our Journey ♥
          </Link>
        </nav>
      )}
    </header>
  );
}
