'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter, locales } from '@/lib/navigation';
import { Languages } from 'lucide-react';

export function LanguageSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();

    function onSelectChange(nextLocale: string) {
        router.replace(pathname, { locale: nextLocale });
    }

    return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-sky-50 border border-sky-100">
            <Languages className="w-4 h-4 text-sky-600" />
            <select
                defaultValue={locale}
                onChange={(e) => onSelectChange(e.target.value)}
                className="bg-transparent text-sm font-medium text-sky-700 focus:outline-none cursor-pointer"
            >
                {locales.map((cur) => (
                    <option key={cur} value={cur}>
                        {cur.toUpperCase()}
                    </option>
                ))}
            </select>
        </div>
    );
}
