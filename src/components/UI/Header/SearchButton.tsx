"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { Search, X } from "lucide-react";

type TSearchButtonProps = {
  locale: string;
  searchLabel: string;
  variant?: "header" | "menu";
};

function SearchButton({ searchLabel, variant = "header" }: TSearchButtonProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [query, setQuery] = useState<string>("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  function handleClose() {
    setIsOpen(false);
    setQuery("");
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        aria-label="Open search"
        aria-expanded={false}
        onClick={() => setIsOpen(true)}
        className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center text-[var(--foreground)] transition-transform duration-200 hover:scale-110 active:scale-95"
      >
        <Search size={18} strokeWidth={1.8} />
      </button>
    );
  }

  const formClassName =
    variant === "menu"
      ? "flex w-[min(18rem,calc(100vw-2rem))] min-w-0 items-center gap-3 rounded-xl bg-[var(--background)] p-3 shadow-md ring-1 ring-black/10"
      : "flex w-[min(20rem,calc(100vw-12rem))] min-w-0 items-center gap-2 sm:w-[min(24rem,calc(100vw-12rem))] xl:w-[min(28rem,24vw)] xl:gap-3 rounded-xl bg-[var(--background)] p-3 shadow-md ring-1 ring-black/10";

  return (
    <form onSubmit={handleSubmit} className={formClassName}>
      <Search size={18} strokeWidth={1.8} className="shrink-0 text-[var(--muted)]" />

      <input
        type="text" inputMode="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={searchLabel}
        autoFocus
        aria-label={searchLabel}
        className="min-w-0 flex-1 bg-transparent text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]"
      />

      <button
        type="button"
        aria-label="Close search"
        onClick={handleClose}
        className="shrink-0 cursor-pointer text-[var(--foreground)] transition-transform duration-200 hover:scale-110 active:scale-95"
      >
        <X size={18} strokeWidth={1.8} />
      </button>
    </form>
  );
}

export default SearchButton;
