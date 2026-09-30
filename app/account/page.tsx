'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkspaceMode } from '@/components/auth/workspace-mode';
import { useAuth } from '@/components/auth/provider';
import { useProjects } from '@/components/projects/store';
import { Card, PageHeader } from '@/components/shared';
import { Field, inputClass, buttonClass } from '@/components/projects/fields';
export default function AccountPage() {
  const mode = useWorkspaceMode(); const router = useRouter();
  const { client, session } = useAuth(); const store = useProjects();
  const [email, setEmail] = useState(''); const [message, setMessage] = useState(''); const [working, setWorking] = useState(false);
  return <div className="max-w-2xl space-y-5"><PageHeader title="Account & storage" description="Keep your research private and available across devices." />
    {!client ? <Card className="space-y-3 p-5"><h2 className="font-semibold">Browser storage is active</h2><p className="text-sm text-muted-foreground">Cloud setup is not connected yet. Your existing projects remain in this browser. Export a backup while setup is completed.</p><button className={buttonClass} onClick={store.exportBrowser}>Export browser backup</button></Card>
    : !session ? <Card className="p-5"><form className="space-y-4" onSubmit={async e => {
      e.preventDefault(); setWorking(true); setMessage('');
      try { const { error } = await client.auth.signInWithOtp({ email: email.trim(), options: { emailRedirectTo: `${window.location.origin}/account` } }); if (error) throw error; setMessage('Check your email for a sign-in link. It will return you to Atlas.'); }
      catch { setMessage('The sign-in email could not be sent. Check your address, wait a minute and retry. The Supabase email and redirect settings may also need setup.'); }
      finally { setWorking(false); }
    }}><h2 className="font-semibold">Sign in to Atlas</h2><Field label="Email address"><input className={inputClass} type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} /></Field><button className={buttonClass} disabled={working}>Email me a sign-in link</button></form><div className="mt-5 border-t pt-4"><button className={buttonClass} onClick={() => { mode.useBrowser(); router.push('/'); }}>Continue in this browser</button><p className="mt-2 text-xs text-muted-foreground">A separate local workspace, with no automatic cloud transfer. Export regularly.</p></div></Card>
    : <><Card className="space-y-4 p-5"><h2 className="font-semibold">{session.user.email}</h2><p className="text-sm text-muted-foreground">{store.ready ? `${store.projects.length} projects loaded from your private cloud workspace.` : 'Cloud research is not loaded yet.'}</p><div className="flex flex-wrap gap-3"><button className={buttonClass} disabled={store.busy || working} onClick={() => void store.reload()}>Reload cloud research</button><button className={buttonClass} disabled={!store.ready || store.busy} onClick={store.exportFile}>Export cloud backup</button><button className={buttonClass} disabled={store.busy || working} onClick={async () => { setWorking(true); try { const { error } = await client.auth.signOut({ scope: 'local' }); if (error) throw error; } catch { setMessage('Sign-out failed. Please retry.'); } finally { setWorking(false); } }}>Sign out</button></div></Card>
      <Card className="space-y-4 p-5"><h2 className="font-semibold">Bring over your browser research</h2><p className="text-sm text-muted-foreground">Copy projects from this browser into the account shown above. Existing cloud projects with the same ID are kept unchanged. Your browser copy stays intact. Use the same browser and address where you created your research.</p><div className="flex flex-wrap gap-3"><button className={buttonClass} onClick={store.exportBrowser}>Export browser backup</button><button className={buttonClass} disabled={!store.ready || store.busy || working} onClick={async () => { setWorking(true); try { const added = await store.migrateBrowser(); setMessage(`${added} projects copied. Existing cloud records and your browser backup were kept.`); } catch (e) { setMessage(e instanceof Error ? e.message : 'Transfer failed.'); } finally { setWorking(false); } }}>Copy browser research to this account</button></div></Card></>}
    {(message || store.error) && <p role="status" className="rounded-md border p-4 text-sm">{message || store.error}</p>}
  </div>;
}
