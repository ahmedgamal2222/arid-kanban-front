import MindMapPageClient from './MindMapPageClient';

export default function MindMapPage() {
  return <MindMapPageClient />;
}

export const dynamic = 'force-static';
export function generateStaticParams() {
  return [{ locale: 'ar', id: 'placeholder' }, { locale: 'en', id: 'placeholder' }];
}
