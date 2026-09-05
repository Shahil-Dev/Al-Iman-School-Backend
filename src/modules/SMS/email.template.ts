// ১. অনুপস্থিতির নোটিশের জন্য সুন্দর HTML টেমপ্লেট
export const getAbsenceEmailTemplate = (
  studentName: string,
  className: string,
  dateStr: string,
) => {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Student Absence Notification — Al-Iman School</title>
    <style>
      :root {
        --navy-900: #0A1628;
        --navy-800: #112240;
        --navy-700: #1B3A5C;
        --gold-500: #C9A227;
        --gold-400: #D4AF37;
        --stone-50: #FAFAF9;
        --stone-100: #F5F5F4;
        --stone-200: #E7E5E4;
        --stone-300: #D6D3D1;
        --stone-500: #78716C;
        --stone-700: #44403C;
        --stone-900: #1C1917;
        --red-50: #FEF2F2;
        --red-100: #FEE2E2;
        --red-600: #DC2626;
        --red-700: #B91C1C;
        --radius-lg: 14px;
        --radius-md: 8px;
        --radius-sm: 4px;
        --spacing-xs: 4px;
        --spacing-sm: 8px;
        --spacing-md: 16px;
        --spacing-lg: 24px;
        --spacing-xl: 32px;
        --spacing-2xl: 40px;
        --font-body: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        --font-heading: Georgia, 'Times New Roman', serif;
      }

      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        background-color: var(--stone-100);
        font-family: var(--font-body);
        color: var(--stone-900);
        line-height: 1.6;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }

      .container {
        max-width: 560px;
        margin: var(--spacing-xl) auto;
        background: #ffffff;
        border-radius: var(--radius-lg);
        overflow: hidden;
        box-shadow: 0 1px 2px rgba(10, 22, 40, 0.04), 0 4px 16px rgba(10, 22, 40, 0.06);
      }

      /* ---- Header ---- */
      .header {
        background: var(--navy-900);
        padding: var(--spacing-xl) var(--spacing-lg);
        text-align: center;
        position: relative;
      }

      .header::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: linear-gradient(90deg, var(--gold-500) 0%, var(--gold-400) 50%, var(--gold-500) 100%);
        opacity: 0.9;
      }

      .header h1 {
        font-family: var(--font-heading);
        font-size: 26px;
        font-weight: 700;
        color: #ffffff;
        letter-spacing: 0.5px;
        margin-bottom: var(--spacing-xs);
      }

      .header p {
        font-size: 13px;
        color: rgba(255, 255, 255, 0.75);
        letter-spacing: 2px;
        text-transform: uppercase;
        font-weight: 400;
      }

      /* ---- Content ---- */
      .content {
        padding: var(--spacing-2xl) var(--spacing-xl);
      }

      .greeting {
        font-family: var(--font-heading);
        font-size: 19px;
        font-weight: 600;
        color: var(--stone-900);
        margin-bottom: var(--spacing-md);
        line-height: 1.4;
      }

      .paragraph {
        font-size: 15px;
        color: var(--stone-700);
        line-height: 1.7;
        margin-bottom: var(--spacing-lg);
        max-width: 52ch;
      }

      /* ---- Alert Box (Absence Specific) ---- */
      .alert-box {
        background: var(--red-50);
        border: 1px solid var(--red-100);
        border-left: 4px solid var(--red-600);
        border-radius: var(--radius-md);
        padding: var(--spacing-lg);
        margin-bottom: var(--spacing-xl);
      }

      .alert-title {
        font-size: 15px;
        font-weight: 700;
        color: var(--red-700);
        margin-bottom: var(--spacing-md);
        letter-spacing: 0.3px;
        text-transform: uppercase;
        font-size: 12px;
      }

      .info-row {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        padding: var(--spacing-sm) 0;
        border-bottom: 1px solid var(--red-100);
        font-size: 14px;
      }

      .info-row:last-child {
        border-bottom: none;
      }

      .info-label {
        color: var(--stone-500);
        font-weight: 500;
        font-size: 13px;
        letter-spacing: 0.2px;
      }

      .info-value {
        color: var(--stone-900);
        font-weight: 600;
        text-align: right;
      }

      .status-badge {
        display: inline-block;
        background: var(--red-600);
        color: #ffffff;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 1px;
        text-transform: uppercase;
        padding: 4px 12px;
        border-radius: 20px;
        margin-top: var(--spacing-xs);
      }

      /* ---- Footer ---- */
      .footer {
        background: var(--stone-50);
        padding: var(--spacing-lg);
        text-align: center;
        border-top: 1px solid var(--stone-200);
      }

      .footer p {
        font-size: 12px;
        color: var(--stone-500);
        line-height: 1.5;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Al-Iman School</h1>
        <p>Excellence in Education &amp; Character</p>
      </div>
      <div class="content">
        <p class="greeting">Dear Parent/Guardian,</p>
        <p class="paragraph">We are writing to inform you of your child&rsquo;s attendance status at Al-Iman School for the following date.</p>

        <div class="alert-box">
          <h2 class="alert-title">Student Absence Notification</h2>
          <div class="info-row">
            <span class="info-label">Student Name</span>
            <span class="info-value">${studentName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Class</span>
            <span class="info-value">${className}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Date</span>
            <span class="info-value">${dateStr}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Status</span>
            <span class="status-badge">Absent</span>
          </div>
        </div>

        <p class="paragraph">If this absence was unexpected, please contact the administration office at your earliest convenience.</p>
      </div>
      <div class="footer">
        <p>This is an automated operational notification from the Al-Iman School ERP System.</p>
      </div>
    </div>
  </body>
  </html>
  `;
};

// ২. বকেয়া ফি রিমাইন্ডারের জন্য সুন্দর HTML টেমপ্লেট
export const getFeeReminderEmailTemplate = (
  studentName: string,
  invoiceNo: string,
  dueAmount: number,
  dueDateStr: string,
) => {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pending Fee Reminder — Al-Iman School</title>
    <style>
      :root {
        --navy-900: #0A1628;
        --navy-800: #112240;
        --navy-700: #1B3A5C;
        --gold-500: #C9A227;
        --gold-400: #D4AF37;
        --stone-50: #FAFAF9;
        --stone-100: #F5F5F4;
        --stone-200: #E7E5E4;
        --stone-300: #D6D3D1;
        --stone-500: #78716C;
        --stone-700: #44403C;
        --stone-900: #1C1917;
        --blue-50: #F0F6FA;
        --blue-100: #DCE8F2;
        --blue-700: #1B4D6E;
        --blue-800: #153D59;
        --radius-lg: 14px;
        --radius-md: 8px;
        --radius-sm: 4px;
        --spacing-xs: 4px;
        --spacing-sm: 8px;
        --spacing-md: 16px;
        --spacing-lg: 24px;
        --spacing-xl: 32px;
        --spacing-2xl: 40px;
        --font-body: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        --font-heading: Georgia, 'Times New Roman', serif;
      }

      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        background-color: var(--stone-100);
        font-family: var(--font-body);
        color: var(--stone-900);
        line-height: 1.6;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }

      .container {
        max-width: 560px;
        margin: var(--spacing-xl) auto;
        background: #ffffff;
        border-radius: var(--radius-lg);
        overflow: hidden;
        box-shadow: 0 1px 2px rgba(10, 22, 40, 0.04), 0 4px 16px rgba(10, 22, 40, 0.06);
      }

      /* ---- Header ---- */
      .header {
        background: var(--navy-900);
        padding: var(--spacing-xl) var(--spacing-lg);
        text-align: center;
        position: relative;
      }

      .header::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: linear-gradient(90deg, var(--gold-500) 0%, var(--gold-400) 50%, var(--gold-500) 100%);
        opacity: 0.9;
      }

      .header h1 {
        font-family: var(--font-heading);
        font-size: 26px;
        font-weight: 700;
        color: #ffffff;
        letter-spacing: 0.5px;
        margin-bottom: var(--spacing-xs);
      }

      .header p {
        font-size: 13px;
        color: rgba(255, 255, 255, 0.75);
        letter-spacing: 2px;
        text-transform: uppercase;
        font-weight: 400;
      }

      /* ---- Content ---- */
      .content {
        padding: var(--spacing-2xl) var(--spacing-xl);
      }

      .greeting {
        font-family: var(--font-heading);
        font-size: 19px;
        font-weight: 600;
        color: var(--stone-900);
        margin-bottom: var(--spacing-md);
        line-height: 1.4;
      }

      .paragraph {
        font-size: 15px;
        color: var(--stone-700);
        line-height: 1.7;
        margin-bottom: var(--spacing-lg);
        max-width: 52ch;
      }

      /* ---- Alert Box (Fee Specific) ---- */
      .alert-box {
        background: var(--blue-50);
        border: 1px solid var(--blue-100);
        border-left: 4px solid var(--blue-700);
        border-radius: var(--radius-md);
        padding: var(--spacing-lg);
        margin-bottom: var(--spacing-xl);
      }

      .alert-title {
        font-size: 15px;
        font-weight: 700;
        color: var(--blue-800);
        margin-bottom: var(--spacing-md);
        letter-spacing: 0.3px;
        text-transform: uppercase;
        font-size: 12px;
      }

      .info-row {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        padding: var(--spacing-sm) 0;
        border-bottom: 1px solid var(--blue-100);
        font-size: 14px;
      }

      .info-row:last-child {
        border-bottom: none;
      }

      .info-label {
        color: var(--stone-500);
        font-weight: 500;
        font-size: 13px;
        letter-spacing: 0.2px;
      }

      .info-value {
        color: var(--stone-900);
        font-weight: 600;
        text-align: right;
      }

      .amount-value {
        font-size: 18px;
        font-weight: 700;
        color: var(--blue-800);
        letter-spacing: 0.3px;
      }

      .status-badge {
        display: inline-block;
        background: var(--blue-700);
        color: #ffffff;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 1px;
        text-transform: uppercase;
        padding: 4px 12px;
        border-radius: 20px;
        margin-top: var(--spacing-xs);
      }

      /* ---- Footer ---- */
      .footer {
        background: var(--stone-50);
        padding: var(--spacing-lg);
        text-align: center;
        border-top: 1px solid var(--stone-200);
      }

      .footer p {
        font-size: 12px;
        color: var(--stone-500);
        line-height: 1.5;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Al-Iman School</h1>
        <p>Excellence in Education &amp; Character</p>
      </div>
      <div class="content">
        <p class="greeting">Dear Parent/Guardian,</p>
        <p class="paragraph">This is a gentle reminder regarding the pending tuition fee for your child at Al-Iman School.</p>

        <div class="alert-box">
          <h2 class="alert-title">Pending Fee Notice</h2>
          <div class="info-row">
            <span class="info-label">Student Name</span>
            <span class="info-value">${studentName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Invoice No</span>
            <span class="info-value">${invoiceNo}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Total Due Amount</span>
            <span class="amount-value">BDT ${dueAmount}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Due Date</span>
            <span class="info-value">${dueDateStr}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Status</span>
            <span class="status-badge">Pending</span>
          </div>
        </div>

        <p class="paragraph">Please complete the fee payment through your parent dashboard or at the school accounts department.</p>
      </div>
      <div class="footer">
        <p>This is an automated operational notification from the Al-Iman School ERP System.</p>
      </div>
    </div>
  </body>
  </html>
  `;
};
