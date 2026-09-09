"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type TNavLinkItem = {
  label: string;
  href: string;
};

type TNavLinksProps = {
  locale: string;
  items: TNavLinkItem[];
};

function NavLinks({ locale, items }: TNavLinksProps) {
  const pathname = usePathname();

  return (
    <nav className="hidden min-w-0 max-w-full flex-nowrap items-center gap-4 overflow-hidden xl:flex 2xl:gap-6">
      {items.map((item) => {
        const href = `/${locale}${item.href === "/" ? "" : item.href}`;
        const isActive = pathname === href;

        return (
          <Link
            key={item.href}
            href={href}
            aria-current={isActive ? "page" : undefined}
            title={item.label}
            className={`min-w-0 max-w-36 shrink truncate whitespace-nowrap border-b pb-2 text-center text-sm transition-colors ${
              isActive
                ? "border-[var(--foreground)] text-[var(--foreground)]"
                : "border-transparent text-[var(--muted)] hover:border-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export default NavLinks;