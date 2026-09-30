'use client';
import { Card } from '@/components/shared';
import { newDetail, reviewStatuses, type DetailSection, type ProjectDetails } from '@/lib/project-details';
import { buttonClass, Field, inputClass } from './fields';

type Input = { key: string; label: string; placeholder?: string; type?: 'date' | 'url'; multiline?: boolean };
const sections: Record<DetailSection, { title: string; description: string; limit: number; fields: Input[] }> = {
  links: { title: 'Official links', description: 'Website, documentation, X, Discord, Telegram, GitHub and explorers. Confirm that each link belongs to the project.', limit: 50, fields: [
    { key: 'label', label: 'Link type', placeholder: 'Website, GitHub, X…' }, { key: 'url', label: 'URL', type: 'url', placeholder: 'https://…' },
  ] },
  team: { title: 'Team & leadership', description: 'Record people, roles and the evidence behind their involvement.', limit: 100, fields: [
    { key: 'name', label: 'Name' }, { key: 'role', label: 'Role' }, { key: 'profileUrl', label: 'Public profile URL', type: 'url' },
  ] },
  funding: { title: 'Funding, investors & token sales', description: 'Add one record per round or public sale. Blank prices and amounts mean unknown. Sale prices do not establish investor profits.', limit: 100, fields: [
    { key: 'round', label: 'Round / sale', placeholder: 'Seed, Series A, ICO, presale…' }, { key: 'announcedOn', label: 'Announced date', type: 'date' },
    { key: 'amountRaised', label: 'Amount raised', placeholder: 'Number without commas; blank if unknown' }, { key: 'currency', label: 'Currency for amount and price', placeholder: 'USD' },
    { key: 'tokenPrice', label: 'Sale price per token', placeholder: 'e.g. 0.025; blank if undisclosed' }, { key: 'investors', label: 'Investors', multiline: true, placeholder: 'Names; distinguish lead investors where known' },
  ] },
  tokenomics: { title: 'Tokenomics & unlock evidence', description: 'Record utility, supply, allocations, vesting and unlocks as dated research. Use separate entries for different metrics or sources.', limit: 100, fields: [
    { key: 'metric', label: 'Metric / topic', placeholder: 'Max supply, team allocation, next unlock, utility…' },
    { key: 'value', label: 'Value / description', multiline: true }, { key: 'unit', label: 'Unit', placeholder: 'Tokens, %, USD, or blank for descriptive research' }, { key: 'asOf', label: 'Data as of', type: 'date' },
  ] },
};
export function ProjectDetailsEditor({ section, details, onChange }: { section: DetailSection; details: ProjectDetails; onChange: (details: ProjectDetails) => void }) {
  const config = sections[section];
  const rows = details[section];
  function change(id: string, key: string, value: string) {
    onChange({ ...details, [section]: rows.map(row => row.id === id ? { ...row, [key]: value } : row) });
  }
  return <Card className="space-y-4 p-5">
    <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-semibold">{config.title}</h2><button type="button" className={buttonClass} disabled={rows.length >= config.limit} onClick={() => onChange({ ...details, [section]: [...rows, newDetail(section)] })}>Add entry</button></div>
    <p className="text-sm text-muted-foreground">{config.description}</p>
    {!rows.length && <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">Not researched yet. Add an entry when you have information to record.</p>}
    {rows.map((row, index) => <fieldset key={row.id} className="space-y-4 rounded-lg border p-4">
      <legend className="px-2 text-sm">{config.title} · {index + 1}</legend>
      <div className="grid gap-4 sm:grid-cols-2">{config.fields.map(field => <Field key={field.key} label={field.label}>
        {field.multiline ? <textarea className={inputClass} rows={3} maxLength={5000} value={(row as Record<string, string>)[field.key]} placeholder={field.placeholder} onChange={e => change(row.id, field.key, e.target.value)} /> : <input className={inputClass} type={field.type ?? 'text'} maxLength={field.type === 'url' ? 2000 : 500} value={(row as Record<string, string>)[field.key]} placeholder={field.placeholder} onChange={e => change(row.id, field.key, e.target.value)} />}
      </Field>)}</div>
      <details className="rounded-md bg-secondary/30 p-3"><summary className="cursor-pointer text-sm">Evidence · {row.reviewStatus}{row.reviewedOn ? ` · ${row.reviewedOn}` : ''}</summary>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Source URL"><input type="url" className={inputClass} maxLength={2000} placeholder="https://…" value={row.sourceUrl} onChange={e => change(row.id, 'sourceUrl', e.target.value)} /></Field>
          <Field label="Reviewed on"><input type="date" className={inputClass} value={row.reviewedOn} onChange={e => change(row.id, 'reviewedOn', e.target.value)} /></Field>
          <Field label="Your review status"><select className={inputClass} value={row.reviewStatus} onChange={e => change(row.id, 'reviewStatus', e.target.value)}>{reviewStatuses.map(status => <option key={status}>{status}</option>)}</select></Field>
          <Field label="Evidence notes / uncertainty"><textarea className={inputClass} rows={3} maxLength={5000} value={row.notes} onChange={e => change(row.id, 'notes', e.target.value)} /></Field>
        </div><p className="mt-3 text-xs text-muted-foreground">Verified means you reviewed the cited source on the recorded date. Atlas has not independently verified this entry.</p>
      </details>
      <button type="button" className="text-xs text-muted-foreground hover:text-foreground hover:underline" onClick={() => { if (window.confirm('Remove this research entry? The removal takes effect when you save.')) onChange({ ...details, [section]: rows.filter(item => item.id !== row.id) }); }}>Remove entry {index + 1}</button>
    </fieldset>)}
  </Card>;
}
