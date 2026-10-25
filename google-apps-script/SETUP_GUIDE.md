# Luxure Nest - Google Sheet Integration Guide

Follow these 5 simple steps to connect your Google Sheet with the Luxure Nest landing page lead form.

---

## Step 1: Open Your Google Sheet
1. Open your Google Sheet in your browser.
2. In the top navigation menu, click **Extensions** &rarr; **Apps Script**.
3. A new tab will open with the Apps Script code editor.

---

## Step 2: Paste the Code
1. In the Apps Script editor, you will see a file named `Code.gs`.
2. Delete everything inside `Code.gs`.
3. Open [`google-apps-script/Code.gs`](./Code.gs) from this project folder, copy all the code, and paste it into the editor.
4. Click the **Save** icon (disk icon or `Ctrl + S` / `Cmd + S`).

---

## Step 3: Deploy as a Web App
1. In the top-right corner of the Apps Script window, click the blue **Deploy** button &rarr; **New deployment**.
2. Click the gear icon next to "Select type" and select **Web app**.
3. Configure these exact settings:
   - **Description**: `Luxure Nest Lead Webhook`
   - **Execute as**: `Me (<your-email@gmail.com>)`
   - **Who has access**: **`Anyone`** *(CRITICAL: This allows the website form to submit leads)*
4. Click **Deploy**.

---

## Step 4: Authorize Access (One-Time Google Security Prompt)
1. Google will show an **Authorize access** button. Click it.
2. Choose your Google Account.
3. If Google displays *"Google hasn't verified this app"*:
   - Click **Advanced** (at the bottom-left of the modal).
   - Click **Go to Untitled project (unsafe)**.
   - Click **Allow**.

---

## Step 5: Copy the Web App URL & Connect It
1. Once deployed, Google will display a **Web app URL**:
   It looks like this:
   ```text
   https://script.google.com/macros/s/AKfycbx.../exec
   ```
2. Copy this URL.
3. Open [`js/config.js`](../js/config.js) in this project.
4. Update `SUBMISSION_ENDPOINT` on line 29:
   ```javascript
   const SUBMISSION_ENDPOINT = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec';
   ```
   *(Or simply paste the URL in the chat and I will connect and test it for you!)*

---

## What Happens When a Lead Submits?
- If your Google Sheet already has headers in Row 1, the script automatically matches each column (`Name`, `Date of Site Visit`, `Time of Site Visit`, `Requirement`, `Company Name`, `Assigned To`, `Status`, `Phone Number`, `Work Email`, `Team Size`, `Decision Maker`, `Preferred Micro-Market`, `City`).
- If your sheet is completely blank, the script automatically creates and formats Row 1 with headers and dark theme styling on the very first submission.
- Every lead is locked with `LockService` to prevent simultaneous submission data loss.
- Once submitted, the visitor is smoothly redirected to `/thank-you`.
