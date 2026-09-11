import { getRequestConfig } from "next-intl/server";

const locales = ["ru", "en", "he"] as const;

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !locales.includes(locale as (typeof locales)[number])) {
    locale = "ru";
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
