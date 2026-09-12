import { defineRouting } from "next-intl/routing";

import { locales } from "./languages";

export const routing = defineRouting({
  locales,
  defaultLocale: "ru",
});
