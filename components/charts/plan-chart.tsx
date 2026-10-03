'use client';
import { indicators, type ChartPlan, type Drawing } from '@/lib/chart-plans';
export function PlanChart({ plan, tool, onPoint }: { plan: ChartPlan; tool: Drawing['kind'] | 'inspect'; onPoint: (p: Drawing['a']) => void }) {
  const all = plan.dataset.candles; const start = Math.max(0, all.length-120); const rows = all.slice(start);
  const w=1000, left=75, right=970, top=30, bottom=350;
  const lower=Math.min(...rows.map(c=>c.low)), upper=Math.max(...rows.map(c=>c.high));
  const padding=Math.max((upper-lower)*0.08,upper*0.001); const lo=lower-padding, hi=upper+padding;
  const t0=rows[0].time, t1=rows[rows.length-1].time;
  const x=(time:number)=>left+(time-t0)/(t1-t0||1)*(right-left);
  const y=(price:number)=>bottom-(price-lo)/(hi-lo)*(bottom-top);
  const step=(right-left)/Math.max(1,rows.length-1);
  const priceLabel=(price:number)=>price.toLocaleString('en-US',{maximumFractionDigits:6});
  function path(values:(number|null)[], scale:(v:number)=>number) { return values.slice(start).map((value,i)=>value===null?'':`${i===0||values[start+i-1]===null?'M':'L'}${x(rows[i].time)},${scale(value)}`).join(' '); }
  const height=plan.indicators.rsi14?560:470;
  return <div className="overflow-x-auto rounded-xl border border-border bg-background"><svg viewBox={`0 0 ${w} ${height}`} className={`w-full min-w-[640px] ${tool==='inspect'?'':'cursor-crosshair'}`} role="img" aria-label={`${plan.market} ${plan.interval} chart in USDT. Use the drawing form for keyboard input.`} onClick={event=>{
    if(tool==='inspect')return; const box=event.currentTarget.getBoundingClientRect();
    const px=(event.clientX-box.left)/box.width*w, py=(event.clientY-box.top)/box.height*height;
    if(px<left||px>right||py<top||py>bottom)return;
    const index=Math.round((px-left)/(right-left)*(rows.length-1)); onPoint({time:rows[index].time,price:Number((hi-(py-top)/(bottom-top)*(hi-lo)).toPrecision(10))});
  }}>
    <defs><clipPath id="plan-price-clip"><rect x={left} y={top} width={right-left} height={bottom-top}/></clipPath></defs>
    {[0,1,2,3,4].map(i=>{const value=lo+(hi-lo)*i/4;return <g key={i}><line x1={left} x2={right} y1={y(value)} y2={y(value)} stroke="currentColor" opacity=".1"/><text x={left-8} y={y(value)+4} textAnchor="end" fill="currentColor" fontSize="11">{priceLabel(value)}</text></g>;})}
    <text x={left} y={18} fill="currentColor" fontSize="12">{plan.market} · {plan.interval} · USDT · closed candles</text>
    <g clipPath="url(#plan-price-clip)">
    {plan.style==='line'?<path d={rows.map((c,i)=>`${i?'L':'M'}${x(c.time)},${y(c.close)}`).join(' ')} fill="none" stroke="#38bdf8" strokeWidth="2"/>:rows.map(c=><g key={c.time} fill={c.close>=c.open?'#34d399':'#fb7185'} stroke={c.close>=c.open?'#34d399':'#fb7185'}><title>{new Date(c.time).toISOString()} O {c.open} H {c.high} L {c.low} C {c.close} · Volume {c.volume}</title><line x1={x(c.time)} x2={x(c.time)} y1={y(c.high)} y2={y(c.low)}/><rect x={x(c.time)-step*.3} y={Math.min(y(c.open),y(c.close))} width={Math.max(1,step*.6)} height={Math.max(1,Math.abs(y(c.open)-y(c.close)))}/></g>)}
    {([['sma50',50,'sma','#fbbf24'],['sma200',200,'sma','#a78bfa'],['ema50',50,'ema','#38bdf8']] as const).map(([key,period,kind,color])=>plan.indicators[key]&&<path key={key} d={path(indicators(all,period,kind),y)} fill="none" stroke={color} strokeWidth="1.6"/>)}
    {plan.drawings.map(d=><g key={d.id} stroke="#fb923c" fill="#fb923c">{d.kind==='level'?<line x1={left} x2={right} y1={y(d.a.price)} y2={y(d.a.price)} strokeDasharray="6 4"/>:d.kind==='trend'&&d.b?<line x1={x(d.a.time)} x2={x(d.b.time)} y1={y(d.a.price)} y2={y(d.b.price)} strokeWidth="2"/>:<circle cx={x(d.a.time)} cy={y(d.a.price)} r="4"/>}<text x={d.kind==='level'?left+8:x(d.a.time)+6} y={y(d.a.price)-7} fontSize="12" stroke="none">{d.label||d.kind}</text></g>)}
    </g>
    {[0,.25,.5,.75,1].map(f=>{const c=rows[Math.round(f*(rows.length-1))];return <text key={f} x={x(c.time)} y={375} textAnchor="middle" fill="currentColor" fontSize="10">{new Date(c.time).toISOString().slice(0,16).replace('T',' ')}</text>;})}
    {plan.indicators.volume&&<g><text x={left} y={398} fill="currentColor" fontSize="11">Volume · {plan.market.replace('USDT','')} units</text>{rows.map(c=><rect key={c.time} x={x(c.time)-step*.3} y={450-c.volume/Math.max(1,...rows.map(r=>r.volume))*45} width={Math.max(1,step*.6)} height={c.volume/Math.max(1,...rows.map(r=>r.volume))*45} fill={c.close>=c.open?'#34d399':'#fb7185'} opacity=".45"/>)}</g>}
    {plan.indicators.rsi14&&<g><text x={left} y={478} fill="currentColor" fontSize="11">RSI 14 · Wilder · 0–100</text>{[30,70].map(v=><line key={v} x1={left} x2={right} y1={545-v*.6} y2={545-v*.6} stroke="currentColor" opacity=".2" strokeDasharray="4 4"/>)}<path d={path(indicators(all,14,'rsi'),v=>545-v*.6)} fill="none" stroke="#a78bfa" strokeWidth="1.5"/></g>}
  </svg></div>;
}
