import { getRequestConfig } from 'next-intl/server';
import { locales } from '../lib/navigation';

export default getRequestConfig(async ({ requestLocale }) => {
    let locale = await requestLocale;

    if (!locale || !locales.includes(locale as any)) {
        locale = 'es';
    }

    return {
        locale,
        messages: (await import(`../../locales/${locale}.json`)).default
    };
});
