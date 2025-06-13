# ChatGPT-test

This repository contains example HTML files.

## Portfolio
Open `portfolio.html` in a web browser to view the sample portfolio page.

## Weekly Earnings Analyzer
4. The app shows each day from Tuesday to Monday. Any days beyond today are greyed out and excluded from the summary. A yellow "WEEK TOTAL" row summarizes the results.
The `index.html` page lets you upload a CSV and generate a weekly report.

### Running the analyzer

1. Prepare a CSV file (e.g. `Pending_Payouts.csv`) with the following columns:
   - `workDate` – date of the task (e.g. `Jun 13, 2025`)
   - `payType` – `prepay` or `overtimePay`
   - `duration` – time spent such as `1h 30m`
   - `payout` – amount in USD (e.g. `$7.50`)
2. Open `index.html` in a web browser. If your browser restricts local files, you can start a quick server:

   ```bash
   python3 -m http.server
   ```

   Then visit `http://localhost:8000/index.html`.
3. Upload your CSV, choose any date within the desired week, and click **Analyze**.
4. The app displays each day from Tuesday to Monday and a yellow "WEEK TOTAL" row summarizing the results.

Open `index.html` in a browser to analyze weekly earnings from a CSV file. Upload your `Pending_Payouts.csv`, select a starting date, and click **Analyze** to see the report.
 master
