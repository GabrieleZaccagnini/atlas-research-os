import { buttonClass } from './fields';

/** Manual research destinations; these are not Atlas data-provider integrations. */
export function CapitalSourceLinks() {
  return <div className="rounded-xl border border-border bg-secondary/20 p-4">
    <h3 className="text-sm font-medium">ICO prices &amp; VC research</h3>
    <div className="mt-3 flex flex-wrap gap-2">
      <a href="https://icoanalytics.org/" target="_blank" rel="noopener noreferrer" className={`${buttonClass} text-xs`}>ICO Analytics ↗</a>
      <a href="https://icodrops.com/" target="_blank" rel="noopener noreferrer" className={`${buttonClass} text-xs`}>ICO Drops ↗</a>
    </div>
    <p className="mt-2 text-xs text-muted-foreground">Search by project name and check the original disclosure before saving a sale price or investor. These sites open externally; Atlas does not import or verify their records.</p>
  </div>;
}
