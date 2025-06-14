# ChatGPT-test

This repository contains example HTML files.

## Portfolio
Open `portfolio.html` in a web browser to view the sample portfolio page.

## Weekly Earnings Analyzer
The `index.html` page now uses React to analyze weekly earnings from a CSV file.

### Running the analyzer

1. Prepare a CSV file (e.g. `Pending_Payouts.csv`) with the following columns:
   - `workDate` – date of the task (e.g. `Jun 13, 2025`)
   - `payType` – `prepay` or `overtimePay`
   - `duration` – time spent such as `1h 30m`
   - `payout` – amount in USD (e.g. `$7.50`)
2. Start a local server in this directory. With Node.js you can run:

   ```bash
   npx http-server
   ```

   Then visit `http://localhost:8080/index.html` (or the port shown in the output).
3. Upload your CSV, choose any date within the desired week, and click **Analyze**.
4. The app displays each day from Tuesday to Monday and a yellow `WEEK TOTAL` row summarizing the results.
