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

function analyze(csvData, startDate) {
  const start = new Date(startDate);
  const day = start.getDay();
  const diff = (day + 7 - 2) % 7; // difference to Tuesday
  const weekStart = new Date(start);
  weekStart.setDate(start.getDate() - diff);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    days.push({
      date,
      prepay: 0,
      overtime: 0,
      payout: 0,
      tasks: 0,
    });
  }

  csvData.forEach(row => {
    const d = new Date(row.workDate);
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

  return { weekStart, days, today };
}

function renderTable(result) {
  if (!result) return;
  const table = document.createElement('table');
  const header = document.createElement('tr');
  ['Day', 'Prepay Time', 'Overtime', 'Combined', 'Payout (USD)', 'Payout (EGP)', 'Task Count']
    .forEach(text => {
      const th = document.createElement('th');
      th.textContent = text;
      header.appendChild(th);
    });
  table.appendChild(header);

  const totals = { prepay: 0, overtime: 0, payout: 0, tasks: 0 };

  result.days.forEach(d => {
    const tr = document.createElement('tr');
    const combined = d.prepay + d.overtime;
    if (d.date <= result.today) {
      totals.prepay += d.prepay;
      totals.overtime += d.overtime;
      totals.payout += d.payout;
      totals.tasks += d.tasks;
    } else {
      tr.classList.add('future-row');
    }

    const cells = [
      d.date.toDateString(),
      formatDuration(d.prepay),
      formatDuration(d.overtime),
      formatDuration(combined),
      formatCurrency(d.payout),
      formatCurrency(d.payout * 50),
      d.tasks,
    ];
    cells.forEach(c => {
      const td = document.createElement('td');
      td.textContent = c;
      tr.appendChild(td);
    });
    table.appendChild(tr);
  });

  const summary = document.createElement('tr');
  summary.className = 'summary-row';
  const combinedTotal = totals.prepay + totals.overtime;
  const cells = [
    'WEEK TOTAL',
    formatDuration(totals.prepay),
    formatDuration(totals.overtime),
    formatDuration(combinedTotal),
    formatCurrency(totals.payout),
    formatCurrency(totals.payout * 50),
    totals.tasks,
  ];
  cells.forEach(c => {
    const td = document.createElement('td');
    td.textContent = c;
    summary.appendChild(td);
  });
  table.appendChild(summary);

  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = '';
  resultsDiv.appendChild(table);
}

function handleAnalyze() {
  const fileInput = document.getElementById('csvFile');
  const dateInput = document.getElementById('startDate');
  if (!fileInput.files.length || !dateInput.value) return;

  Papa.parse(fileInput.files[0], {
    header: true,
    skipEmptyLines: true,
    complete: function(res) {
      const result = analyze(res.data, dateInput.value);
      renderTable(result);
    }
  });
}

document.getElementById('analyzeBtn').addEventListener('click', handleAnalyze);
