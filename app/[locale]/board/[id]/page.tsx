import BoardPageClient from './BoardPageClient';

export const dynamic = 'force-static';

// Server component — required for generateStaticParams with output: 'export'
// Actual board ID is resolved client-side via useParams
export function generateStaticParams() {
  return [{ id: '__board__' }];
}

export default function BoardPage() {
  return <BoardPageClient />;
}

