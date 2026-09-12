import { getRequestConfig } from "next-intl/server";

import { isSupportedLocale } from "./languages";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !isSupportedLocale(locale)) {
    locale = "ru";
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
