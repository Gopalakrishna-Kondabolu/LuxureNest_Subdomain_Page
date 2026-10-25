/**
 * ============================================================================
 * LUXURE NEST - LEAD GENERATION GOOGLE APPS SCRIPT WEB APP
 * ============================================================================
 * 
 * Version: 2.0.0 (Production Ready)
 * 
 * This script connects your Luxure Nest landing page lead form directly to
 * this Google Sheet. It safely captures and appends every lead submission.
 * 
 * KEY FEATURES:
 * 1. Automatic Column Header Matching: Automatically matches existing column
 *    headers in Row 1 (e.g. Name, Date of Site Visit, Time of Site Visit, etc.).
 * 2. Automatic Header Initialization: If the sheet is empty, it creates and
 *    styles all required headers automatically.
 * 3. Zero Concurrency Collisions: Uses LockService to safely queue and handle
 *    simultaneous lead submissions without dropping or corrupting rows.
 * 4. Complete Data Preservation: Records both the 7 primary business columns
 *    and contact/context data (Phone, Email, Team Size, Decision Maker, City, etc.).
 * 5. CORS & Web App Friendly: Works seamlessly with browser fetch.
 */

// Name of the tab in your spreadsheet where leads will be recorded.
// If this tab doesn't exist, the first sheet tab will be used automatically.
var SHEET_TAB_NAME = 'Leads';

// Default column headers created if the sheet is completely blank.
var DEFAULT_HEADERS = [
  'Name',
  'Date of Site Visit',
  'Time of Site Visit',
  'Requirement',
  'Company Name',
  'Assigned To',
  'Status',
  'Phone Number',
  'Work Email',
  'Team Size',
  'Decision Maker',
  'Preferred Micro-Market',
  'City',
  'Landing Micro-Market',
  'Attribution',
  'Submitted At'
];

/**
 * Health check / Verification endpoint.
 * Opening the deployed Web App URL in a browser tab will test if it is online.
 */
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'online',
    message: 'Luxure Nest Lead Capture Web App is running successfully.',
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Main Webhook: Handles incoming POST requests from the lead generation form.
 */
function doPost(e) {
  // Use ScriptLock to prevent simultaneous submissions from colliding
  var lock = LockService.getScriptLock();
  
  try {
    // Wait up to 30 seconds for concurrent requests to complete
    lock.waitLock(30000);
  } catch (lockErr) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: 'Server is busy processing incoming requests. Please retry in a few seconds.'
    })).setMimeType(ContentService.MimeType.JSON);
  }

  try {
    // 1. Verify payload exists
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error('Empty request body. Expected JSON lead payload.');
    }

    // 2. Parse incoming payload
    var payload;
    try {
      payload = JSON.parse(e.postData.contents);
    } catch (parseError) {
      if (e.parameter && Object.keys(e.parameter).length > 0) {
        payload = { completeLeadRecord: e.parameter };
      } else {
        throw new Error('Malformed JSON payload: ' + parseError.message);
      }
    }

    var lead = payload.completeLeadRecord || payload;
    var sheetRow = payload.googleSheetRow || {};

    // 3. Resolve active spreadsheet and target tab
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_TAB_NAME);
    if (!sheet) {
      sheet = ss.getSheets()[0]; // Fall back to the first sheet tab
    }

    // 4. Resolve headers
    var headers = [];
    var lastRow = sheet.getLastRow();
    var lastCol = sheet.getLastColumn();

    if (lastRow === 0 || lastCol === 0) {
      // Sheet is completely empty: initialize default headers
      headers = DEFAULT_HEADERS;
      sheet.appendRow(headers);

      // Apply luxury dark header styling
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#111827');
      headerRange.setFontColor('#FFFFFF');
      headerRange.setFontFamily('Arial');
      headerRange.setFontSize(10);
      sheet.setFrozenRows(1);
    } else {
      // Read existing headers from Row 1
      headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(function (h) {
        return String(h).trim();
      });
    }

    // 5. Build normalized data lookup dictionary (supports exact names and common variations/typos)
    var visitDateValue = sheetRow['Date of Site Visit'] || lead.dateOfSiteVisit || '';
    var assignedToValue = sheetRow['Assigned To'] || lead.assignedTo || '';

    var normalizedData = {
      // 1. Name
      'name': sheetRow['Name'] || lead.fullName || lead.name || '',
      'full name': sheetRow['Name'] || lead.fullName || lead.name || '',

      // 2. Date of Site Visit (including "Date of Site Vist" typo in sheet)
      'date of site visit': visitDateValue,
      'date of site vist': visitDateValue,
      'visit date': visitDateValue,

      // 3. Time of Site Visit
      'time of site visit': sheetRow['Time of Site Visit'] || lead.timeOfSiteVisit || '',
      'visit time': sheetRow['Time of Site Visit'] || lead.timeOfSiteVisit || '',

      // 4. Requirement
      'requirement': sheetRow['Requirement'] || lead.service || lead.requirement || '',
      'service': sheetRow['Requirement'] || lead.service || lead.requirement || '',

      // 5. Company Name
      'company name': sheetRow['Company Name'] || lead.companyName || lead.company || '',
      'company': sheetRow['Company Name'] || lead.companyName || lead.company || '',

      // 6. Assigned To (including "Asigned To" typo in sheet)
      'assigned to': assignedToValue,
      'asigned to': assignedToValue,

      // 7. Status
      'status': sheetRow['Status'] || lead.status || 'New Lead',

      // 8. Phone Number
      'phone number': lead.phone || lead.phoneNumber || '',
      'phone': lead.phone || lead.phoneNumber || '',
      'contact number': lead.phone || lead.phoneNumber || '',
      'mobile': lead.phone || lead.phoneNumber || '',

      // 9. Work Email
      'work email': lead.workEmail || lead.email || '',
      'email': lead.workEmail || lead.email || '',
      'email address': lead.workEmail || lead.email || '',

      // 10. Team Size
      'team size': lead.teamSize || lead.teamsize || '',
      'seats': lead.teamSize || lead.teamsize || '',
      'team': lead.teamSize || lead.teamsize || '',

      // 11. Decision Maker
      'decision maker': lead.isDecisionMaker || lead.decisionMaker || '',
      'are you a decision maker?': lead.isDecisionMaker || lead.decisionMaker || '',
      'decision maker?': lead.isDecisionMaker || lead.decisionMaker || '',

      // 12. Preferred Micro-Market
      'preferred micro-market': lead.preferredMicroMarket || lead.micromarket || '',
      'preferred micromarket': lead.preferredMicroMarket || lead.micromarket || '',
      'micro-market': lead.preferredMicroMarket || lead.micromarket || '',
      'micromarket': lead.preferredMicroMarket || lead.micromarket || '',
      'location': lead.preferredMicroMarket || lead.micromarket || '',

      // 13. City & Additional Context
      'city': lead.city || '',
      'landing micro-market': lead.landingMicroMarket || '',
      'attribution': typeof lead.attribution === 'object' ? JSON.stringify(lead.attribution) : (lead.attribution || ''),
      'submitted at': lead.submittedAt || Utilities.formatDate(new Date(), 'GMT+5:30', 'yyyy-MM-dd HH:mm:ss'),
      'timestamp': lead.submittedAt || Utilities.formatDate(new Date(), 'GMT+5:30', 'yyyy-MM-dd HH:mm:ss')
    };

    // 6. Map values into new row in the exact order of existing sheet headers
    var newRow = headers.map(function (header) {
      var key = header.toLowerCase().trim();
      return normalizedData[key] !== undefined ? normalizedData[key] : '';
    });

    // 7. Append lead row to sheet
    sheet.appendRow(newRow);

    // 8. Generate unique confirmation reference ID
    var leadId = 'LN-' + Utilities.formatDate(new Date(), 'GMT+5:30', 'yyyyMMdd-HHmmss') + '-' + Math.floor(Math.random() * 899 + 100);

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      leadId: leadId,
      message: 'Lead recorded successfully in Google Sheet'
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.message || 'Unknown error occurred while processing lead.'
    })).setMimeType(ContentService.MimeType.JSON);

  } finally {
    // Always release the lock
    lock.releaseLock();
  }
}
