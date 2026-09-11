import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ChevronDown, Heart, UserRound } from "lucide-react";

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

const languageOptions = [
  { code: "ru", label: "RU", name: "Русский" },
  { code: "en", label: "EN", name: "English" },
  { code: "he", label: "HE", name: "עברית" },
];

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
  const searchLabel = t("search");

  return (
    <header className="bg-[var(--background)]">
      <Container>
        <div className="grid h-20 min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center">
          <div className="xl:hidden">
            <MobileMenu
              locale={locale}
              items={translatedNavItems}
              searchLabel={searchLabel}
            />
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
            <SearchButton locale={locale} searchLabel={searchLabel} />


            <Link href={`/${locale}/favorites`} aria-label="Favorites" className="group flex h-10 w-10 shrink-0 items-center justify-center text-[var(--foreground)] transition-all duration-300 ease-out hover:scale-105 hover:text-[#A65345] active:scale-95">
              <Heart className="transition-all duration-300 ease-out group-hover:fill-[#A65345] group-hover:stroke-[#A65345]" size={18} strokeWidth={1.8} />
            </Link>

            <Link href={`/${locale}/profile`} aria-label="Profile" className="flex h-10 w-10 shrink-0 items-center justify-center transition-transform duration-200 hover:scale-110 active:scale-95">
              <UserRound size={18} strokeWidth={1.8} />
            </Link>

            <details className="relative shrink-0">
              <summary className="flex h-10 cursor-pointer list-none items-center gap-1 px-1 text-sm font-medium text-[var(--foreground)] transition-transform duration-200 hover:scale-105 [&::-webkit-details-marker]:hidden">
                {locale.toUpperCase()}
                <ChevronDown size={13} strokeWidth={1.8} />
              </summary>
              <div
                className="absolute top-full z-30 min-w-40 max-w-[calc(100vw-1rem)] overflow-hidden rounded-xl bg-[var(--background)] p-1 shadow-md ring-1 ring-black/10"
                style={{
                  left: locale === "he" ? 0 : undefined,
                  right: locale === "he" ? undefined : 0,
                }}
              >
                {languageOptions
                  .filter((option) => option.code !== locale)
                  .map((option) => (
                    <Link
                      key={option.code}
                      href={`/${option.code}`}
                      className="flex min-h-9 items-center justify-between gap-3 whitespace-nowrap rounded-lg px-3 text-sm text-[var(--foreground)] transition-colors hover:bg-black/5"
                    >
                      <span>{option.label}</span>
                      <span className="text-xs text-[var(--muted)]">{option.name}</span>
                    </Link>
                  ))}
              </div>
            </details>
          </div>
        </div>
      </Container>
    </header>
  );
}

export default Header;
