import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Heart, UserRound } from "lucide-react";

import Container from "@/components/common/Container";
import MobileMenu from "./MobileMenu";
import SearchButton from "./SearchButton";
import NavLinks from "./NavLinks";

type THeaderProps = {
  locale: string;
};

type TNavItem = {
  key: "home" | "menu" | "about" | "events" | "contacts";
  href: string;
};

const navItems: TNavItem[] = [
  { key: "home", href: "/" },
  { key: "menu", href: "/menu" },
  { key: "about", href: "/about" },
  { key: "events", href: "/events" },
  { key: "contacts", href: "/contacts" },
];

async function Header({ locale }: THeaderProps) {
  const t = await getTranslations("nav");
  const translatedNavItems = navItems.map((item) => ({
    label: t(item.key),
    href: item.href,
  }));

  return (
    <header className="bg-[var(--background)]">
      <Container>
        <div className="grid h-20 min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center">
          <div className="xl:hidden">
            <MobileMenu locale={locale} items={translatedNavItems} />
          </div>

          <Link
            className="hidden justify-self-start xl:block"
            href={`/${locale}`}
            aria-label="Brew & Bloom home"
          >
            <Image
              src="/brand-logo.png"
              alt="Brew & Bloom"
              width={170}
              height={57}
              priority
            />
          </Link>

          <div className="flex min-w-0 w-full justify-center overflow-hidden">
            <NavLinks locale={locale} items={translatedNavItems} />
          </div>
          <div className="flex min-w-0 shrink-0 items-center justify-self-end gap-1">
            <SearchButton locale={locale} />


            <Link href={`/${locale}/favorites`} aria-label="Favorites" className="flex h-10 w-10 shrink-0 items-center justify-center">
              <Heart size={18} strokeWidth={1.8} />
            </Link>

            <Link href={`/${locale}/profile`} aria-label="Profile" className="flex h-10 w-10 shrink-0 items-center justify-center">
              <UserRound size={18} strokeWidth={1.8} />
            </Link>

            <Link
              href={locale === "ru" ? "/en" : "/ru"}
              aria-label="Switch language"
              className="flex h-10 w-10 shrink-0 items-center justify-center text-sm font-medium text-[var(--foreground)]"
            >
              {locale === "ru" ? "EN" : "RU"}
            </Link>
          </div>
        </div>
      </Container>
    </header>
  );
}

export default Header;
