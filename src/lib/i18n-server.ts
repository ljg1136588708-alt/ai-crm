import { cookies } from 'next/headers';
import { getT, type Locale } from './i18n';

export async function getServerT() {
  const cookieStore = await cookies();
  const locale = (cookieStore.get('locale')?.value ?? 'en') as Locale;
  return getT(locale);
}
