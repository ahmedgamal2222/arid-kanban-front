import MindMapPageClient from './MindMapPageClient';

export const dynamic = 'force-static';

export function generateStaticParams() {
  return [{ id: '__board__' }];
}

export default function MindMapPage() {
  return <MindMapPageClient />;
}
