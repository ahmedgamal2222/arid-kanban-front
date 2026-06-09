import ReferencesPageClient from './ReferencesPageClient';

export default function ReferencesPage() {
  return <ReferencesPageClient />;
}

export const dynamic = 'force-static';
export function generateStaticParams() {
  return [{ locale: 'ar' }, { locale: 'en' }];
}
