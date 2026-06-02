import DashboardPageClient from './DashboardPageClient';

// Server component — required for generateStaticParams with output: 'export'
export function generateStaticParams() {
  return [{ id: '__board__' }];
}

export default function DashboardPage() {
  return <DashboardPageClient />;
}
