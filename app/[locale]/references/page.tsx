import ReferencesPageClient from './ReferencesPageClient';

export const dynamic = 'force-static';

export function generateStaticParams() {
  return [{ locale: 'ar' }, { locale: 'en' }];
}

export default function ReferencesPage() {
  return <ReferencesPageClient />;
}
