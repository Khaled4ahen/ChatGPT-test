const { useState } = React;

function parseDuration(str) {
  if (!str) return 0;
  let total = 0;
  const h = str.match(/(\d+)h/);
  const m = str.match(/(\d+)m/);
  const s = str.match(/(\d+)s/);
  if (h) total += parseInt(h[1], 10) * 3600;
  if (m) total += parseInt(m[1], 10) * 60;
  if (s) total += parseInt(s[1], 10);
  return total;
}

function formatDuration(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return `${h}h ${m}m`;
}

function formatCurrency(num) {
  return `$${num.toFixed(2)}`;
}

function parseWorkDate(str) {
  if (!str) return null;
  const [day, mon, year] = str.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const idx = months.findIndex(m => m.toLowerCase() === mon.toLowerCase());
  if (idx === -1) return new Date(str); // fallback
  const yr = parseInt(year, 10);
  const fullYear = yr < 100 ? 2000 + yr : yr;
  return new Date(Date.UTC(fullYear, idx, parseInt(day, 10)));
}

function analyze(csvData, startDate) {
  const start = new Date(startDate + 'T00:00:00Z');
  const day = start.getUTCDay();
  const diff = (day + 7 - 2) % 7; // difference to Tuesday
  const weekStart = new Date(start);
  weekStart.setUTCDate(start.getUTCDate() - diff);

  const days = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setUTCDate(weekStart.getUTCDate() + i);
    days.push({
      date,
      prepay: 0,
      overtime: 0,
      payout: 0,
      tasks: 0,
    });
  }

  csvData.forEach(row => {
    const d = parseWorkDate(row.workDate);
    const idx = Math.floor((d - weekStart) / (24 * 3600 * 1000));
    if (idx >= 0 && idx < 7) {
      const dayObj = days[idx];
      const duration = parseDuration(row.duration);
      if (row.payType === 'prepay') {
        dayObj.prepay += duration;
        dayObj.tasks += 1;
      } else if (row.payType === 'overtimePay') {
        dayObj.overtime += duration;
      }
      const payout = parseFloat(row.payout.replace(/[$]/g, ''));
      if (!isNaN(payout)) dayObj.payout += payout;
    }
  });

  return { weekStart, days };
}

function ResultsTable({ result }) {
  if (!result) return null;
  const totals = { prepay: 0, overtime: 0, payout: 0, tasks: 0 };

  const rows = result.days.map(d => {
    const combined = d.prepay + d.overtime;
    totals.prepay += d.prepay;
    totals.overtime += d.overtime;
    totals.payout += d.payout;
    totals.tasks += d.tasks;

    return (
      <tr key={d.date.toDateString()}>
        <td>{d.date.toDateString()}</td>
        <td>{formatDuration(d.prepay)}</td>
        <td>{formatDuration(d.overtime)}</td>
        <td>{formatDuration(combined)}</td>
        <td>{formatCurrency(d.payout)}</td>
        <td>{formatCurrency(d.payout * 50)}</td>
        <td>{d.tasks}</td>
      </tr>
    );
  });

  const combinedTotal = totals.prepay + totals.overtime;

  return (
    <table>
      <thead>
        <tr>
          {['Day', 'Prepay Time', 'Overtime', 'Combined', 'Payout (USD)', 'Payout (EGP)', 'Task Count'].map(h => <th key={h}>{h}</th>)}
        </tr>
      </thead>
      <tbody>
        {rows}
        <tr className="summary-row">
          <td>WEEK TOTAL</td>
          <td>{formatDuration(totals.prepay)}</td>
          <td>{formatDuration(totals.overtime)}</td>
          <td>{formatDuration(combinedTotal)}</td>
          <td>{formatCurrency(totals.payout)}</td>
          <td>{formatCurrency(totals.payout * 50)}</td>
          <td>{totals.tasks}</td>
        </tr>
      </tbody>
    </table>
  );
}

function App() {
  const [file, setFile] = useState(null);
  const [date, setDate] = useState('');
  const [result, setResult] = useState(null);

  const handleAnalyze = () => {
    if (!file || !date) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: function(res) {
        const r = analyze(res.data, date);
        setResult(r);
      }
    });
  };

  return (
    <div className="container">
      <h1>Weekly Earnings Analyzer</h1>
      <div className="controls">
        <label htmlFor="csvFile">Upload CSV:</label>
        <input type="file" id="csvFile" accept=".csv" onChange={e => setFile(e.target.files[0])} />

        <label htmlFor="startDate">Select starting date:</label>
        <input type="date" id="startDate" value={date} onChange={e => setDate(e.target.value)} />

        <button onClick={handleAnalyze}>Analyze</button>
      </div>
      <div id="results">
        <ResultsTable result={result} />
      </div>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
