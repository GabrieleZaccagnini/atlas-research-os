import { ChartingWorkspace } from '@/components/dashboard/charting-workspace';
export default async function Page({ searchParams }: { searchParams: Promise<{ project?: string }> }) {
  const { project } = await searchParams;
  return <ChartingWorkspace initialProject={project ?? ''} />;
}
