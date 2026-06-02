import DashboardPageClient from './DashboardPageClient';

export const dynamic = 'force-static';

// Server component — required for generateStaticParams with output: 'export'
export function generateStaticParams() {
  return [{ id: '__board__' }];
}

export default function DashboardPage() {
  return <DashboardPageClient />;
}
