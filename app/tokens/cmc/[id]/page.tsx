import { notFound } from 'next/navigation';
import { CmcTokenPage } from '@/components/tokens/cmc-token-page';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[1-9]\d{0,9}$/.test(id)) notFound();
  return <CmcTokenPage id={id} />;
}
