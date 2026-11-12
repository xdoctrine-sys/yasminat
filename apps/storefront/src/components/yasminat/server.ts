import 'server-only';
import {cookies} from 'next/headers';
import type {YasLanguage} from './Provider';

export async function yasLanguage(): Promise<YasLanguage> {
  return (await cookies()).get('yasminat-language')?.value === 'en' ? 'en' : 'ar';
}
