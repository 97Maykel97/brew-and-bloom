import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ChevronDown } from "lucide-react";

import Container from "@/components/common/Container";
import { languageOptions } from "@/i18n/languages";
import { createClient } from "@/lib/supabase/server";
import MobileMenu from "./MobileMenu";
import FavoritesModalButton from "./FavoritesModalButton";
import OrderModalButton from "./OrderModalButton";
import ProfileButton from "./ProfileButton";
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
  const searchLabel = t("search");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const profileHref = user
    ? `/${locale}/profile`
    : `/${locale}/auth/login`;

  return (
    <header className="sticky top-0 z-50 border-b border-[#4a3224]/8 bg-[rgba(248,243,236,0.94)] backdrop-blur-xl supports-[backdrop-filter]:bg-[rgba(248,243,236,0.82)]">
      <Container>
        <div className="grid h-20 min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center">
          <div className="xl:hidden">
            <MobileMenu
              locale={locale}
              items={translatedNavItems}
              isSignedIn={Boolean(user)}
              profileHref={profileHref}
              searchLabel={searchLabel}
            />
          </div>

          <Link
            className="hidden justify-self-start xl:block"
            href={`/${locale}`}
            aria-label="Brew & Bloom home"
          >
            <Image
              src="/brew-and-bloom-logo.png"
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


            <FavoritesModalButton
              isSignedIn={Boolean(user)}
              locale={locale}
            />

            <OrderModalButton
              isSignedIn={Boolean(user)}
              locale={locale}
            />

            <ProfileButton href={profileHref} />

            <details className="relative shrink-0">
              <summary className="flex h-10 cursor-pointer list-none items-center gap-1 px-1 text-sm font-medium text-[var(--foreground)] transition-transform duration-200 hover:scale-105 [&::-webkit-details-marker]:hidden">
                {locale.toUpperCase()}
                <ChevronDown size={13} strokeWidth={1.8} />
              </summary>
              <div
                className="absolute top-full z-50 w-40 min-w-40 max-w-[calc(100vw-1rem)] overflow-hidden rounded-xl bg-[var(--background)] p-1 shadow-md ring-1 ring-black/10"
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
