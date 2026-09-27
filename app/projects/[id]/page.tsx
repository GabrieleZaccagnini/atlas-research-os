import { ProjectWorkspace } from '@/components/projects/workspace';
export default function ProjectPage({ params }: { params: { id: string } }) { return <ProjectWorkspace id={params.id} />; }
