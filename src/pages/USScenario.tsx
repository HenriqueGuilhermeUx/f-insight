import { useMemo, useState } from 'react';
import './USScenario.css';

type Bucket = 'Stocks' | 'Bonds' | 'Cash';
const categories: Bucket[] = ['Stocks', 'Bonds', 'Cash'];
const formatUsd = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n);

export default function USScenario() {
  const [budget, setBudget] = useState('10000');
  const [allocations, setAllocations] = useState<Record<Bucket, string>>({ Stocks: '50', Bonds: '30', Cash: '20' });
  const [reviewed, setReviewed] = useState<Record<string, boolean>>({});
  const [copyMessage, setCopyMessage] = useState('');
  const values = useMemo(() => categories.map(category => ({
    category,
    percent: Number(allocations[category] || 0),
  })), [allocations]);
  const total = values.reduce((sum, row) => sum + (Number.isFinite(row.percent) ? row.percent : 0), 0);
  const amount = Number(budget);
  const valid = Number.isFinite(amount) && amount >= 0 && amount <= 100000000 && values.every(v => Number.isFinite(v.percent) && v.percent >= 0 && v.percent <= 100) && total <= 100;
  const remaining = 100 - total;

  const questions = [
    'Does this scenario fit a defined time horizon?',
    'Did I review liquidity needs and possible losses?',
    'Are there concentrated exposures to review?',
    'Are fees, taxes and individual circumstances considered?',
  ];
  const summary = [
    'F-Insight USA - hypothetical asset allocation worksheet',
    'Illustrative budget: ' + (valid ? formatUsd(amount) : 'INVALID INPUT'),
    ...values.map(row => row.category + ': ' + row.percent + '% / ' + (valid ? formatUsd(amount * row.percent / 100) : 'INVALID INPUT')),
    'Unallocated: ' + remaining + '%',
    ...questions.map(q => q + ': ' + (reviewed[q] ? 'Reviewed' : 'Pending')),
    'No securities, live prices, projected returns or recommendations are provided.',
  ].join('\n');

  return <section className="avfi" aria-label="Hypothetical portfolio allocation worksheet">
    <div className="avfi-head">
      <p className="avus-eyebrow">Interactive research tool · USA preview</p>
      <h2>Build a hypothetical allocation scenario.</h2>
      <p>Experiment with a fictional USD budget and asset-class percentages. These are user-entered assumptions, not live market prices or an investment recommendation. No data is sent to a server.</p>
    </div>
    <div className="avfi-grid">
      <div className="avfi-card">
        <label>Illustrative budget (USD)
          <input type="number" min="0" max="100000000" step="100" value={budget} onChange={e => setBudget(e.target.value)} />
        </label>
        {values.map(({ category, percent }) => <label key={category}>{category} allocation (%)
          <input type="number" min="0" max="100" step="1" value={allocations[category]} onChange={e => setAllocations(old => ({ ...old, [category]: e.target.value }))} />
          <div className="avfi-track" aria-hidden="true"><span style={{ width: Math.max(0, Math.min(100, percent || 0)) + '%' }} /></div>
        </label>)}
        <p className={valid ? 'avfi-good' : 'avfi-error'} role="status">{valid ? 'Remaining unallocated: ' + remaining.toFixed(0) + '%' : 'Enter a nonnegative budget and allocations totaling no more than 100%.'}</p>
        <button type="button" onClick={() => { setBudget('10000'); setAllocations({ Stocks: '50', Bonds: '30', Cash: '20' }); setReviewed({}); setCopyMessage(''); }}>Reset scenario</button>
      </div>
      <div className="avfi-card">
        <h3>Illustrative dollar amounts</h3>
        {valid ? values.map(row => <div className="avfi-result" key={row.category}><span>{row.category} · {row.percent}%</span><strong>{formatUsd(amount * row.percent / 100)}</strong></div>) : <p>Correct the inputs to display your scenario.</p>}
        {valid && <div className="avfi-result"><span>Unallocated · {remaining}%</span><strong>{formatUsd(amount * remaining / 100)}</strong></div>}
        <h3>Research review</h3>
        {questions.map(question => <label className="avfi-check" key={question}>
          <input type="checkbox" checked={Boolean(reviewed[question])} onChange={e => setReviewed(old => ({ ...old, [question]: e.target.checked }))} />
          <span>{question}</span>
        </label>)}
        <button type="button" disabled={!valid} onClick={async () => {
          try { await navigator.clipboard.writeText(summary); setCopyMessage('Worksheet copied locally.'); }
          catch { setCopyMessage('Copy unavailable. Please review the visible inputs.'); }
        }}>Copy worksheet summary</button>
        <p role="status">{copyMessage}</p>
      </div>
    </div>
    <p className="avfi-foot">Educational scenario only. Asset categories are generic; securities, expected performance, US data feeds, brokerage accounts and personalized investment advice are not available here.</p>
  </section>;
}
