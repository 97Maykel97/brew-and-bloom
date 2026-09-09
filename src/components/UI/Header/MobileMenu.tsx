"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Menu, UserRound, X } from "lucide-react";
import SearchButton from "./SearchButton";

type TMobileNavItem = {
  label: string;
  href: string;
};

type TMobileMenuProps = {
  locale: string;
  items: TMobileNavItem[];
};

function MobileMenu({ locale, items }: TMobileMenuProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <>
      <button
        type="button"
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className="relative z-50 flex h-10 w-10 items-center justify-center text-[var(--foreground)]"
      >
        {isOpen ? <X size={24} strokeWidth={1.8} /> : <Menu size={24} strokeWidth={1.8} />}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-40 overflow-x-hidden overflow-y-auto bg-[var(--background)] px-4 py-6 sm:px-6">
          <div className="flex min-h-full min-w-0 flex-col">
            <div className="flex items-center justify-center">
              <Link href={`/${locale}`} onClick={() => setIsOpen(false)}>
                <Image
                  src="/brand-logo.png"
                  alt="Brew & Bloom"
                  width={170}
                  height={57}
                  priority
                />
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
              <SearchButton locale={locale} variant="menu" />

              <Link href={`/${locale}/favorites`} aria-label="Favorites" onClick={() => setIsOpen(false)} className="flex h-10 w-10 shrink-0 items-center justify-center">
                <Heart size={18} strokeWidth={1.8} />
              </Link>
              <Link href={`/${locale}/profile`} aria-label="Profile" onClick={() => setIsOpen(false)} className="flex h-10 w-10 shrink-0 items-center justify-center">
                <UserRound size={18} strokeWidth={1.8} />
              </Link>
            </div>

            <nav className="mt-16 flex w-full min-w-0 flex-1 flex-col items-center gap-8">
              {items.map((item) => (
                <Link
                  key={item.href}
                  href={`/${locale}${item.href === "/" ? "" : item.href}`}
                  onClick={() => setIsOpen(false)}
                  title={item.label}
                  className="line-clamp-2 w-full max-w-md overflow-hidden px-4 text-center font-serif text-3xl text-ellipsis [overflow-wrap:anywhere] text-[var(--foreground)] transition-opacity hover:opacity-60"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}

export default MobileMenu;