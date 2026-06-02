import TimelinePageClient from './TimelinePageClient';

export const dynamic = 'force-static';

export function generateStaticParams() {
  return [{ id: '__board__' }];
}

export default function TimelinePage() {
  return <TimelinePageClient />;
}
