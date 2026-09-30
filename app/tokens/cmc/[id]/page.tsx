import { notFound } from 'next/navigation';
import { CmcTokenPage } from '@/components/tokens/cmc-token-page';

export default function Page({ params }: { params: { id: string } }) {
  if (!/^[1-9]\d{0,9}$/.test(params.id)) notFound();
  return <CmcTokenPage id={params.id} />;
}
