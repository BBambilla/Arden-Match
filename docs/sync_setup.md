
# Google Sheet Sync Setup Guide

To enable real-time synchronization of survey data to a Google Sheet, follow these steps:

### 1. Create a Google Sheet
Create a new Google Sheet where you want the data to arrive. You don't need to add headers; the script will append rows automatically.

### 2. Add the Apps Script
1.  In your Google Sheet, go to **Extensions** > **Apps Script**.
2.  Delete any existing code and paste the following:

```javascript
/**
 * Google Apps Script for Arden Match Sync
 */
function doPost(e) {
  try {
    // 1. Open the active sheet
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // 2. Parse incoming JSON data
    var data = JSON.parse(e.postData.contents);
    
    // 3. Extract and format values
    var timestamp = new Date();
    var name = data.name || "Unknown";
    var program = data.program || "Unknown";
    var passions = data.passions ? data.passions.join(", ") : "";
    var strength = data.strength || "";
    var happiness = data.happiness || "";
    var matches = data.matches ? data.matches.map(m => m.title).join(" | ") : "";
    var surveyJson = JSON.stringify(data.survey);
    
    // 4. Append to sheet
    sheet.appendRow([
      timestamp,
      name,
      program,
      passions,
      strength,
      happiness,
      matches,
      surveyJson
    ]);
    
    // 5. Return success
    return ContentService.createTextOutput("Success")
      .setMimeType(ContentService.MimeType.TEXT);
      
  } catch (err) {
    // Return error message for debugging
    return ContentService.createTextOutput("Error: " + err.toString())
      .setMimeType(ContentService.MimeType.TEXT);
  }
}

/**
 * TEST FUNCTION: Use this to check if your sheet is linked correctly.
 * Click 'Run' on THIS function, not doPost.
 */
function testSheetConnection() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  sheet.appendRow([new Date(), "Test User", "Test Program", "Test Passions", "Strength", "Happiness", "Matches", "{}"]);
  Logger.log("Test row added successfully!");
}
```

### 3. Deploy as a Web App
1.  Click the blue **Deploy** button at the top right.
2.  Select **New Deployment**.
3.  Click the **Select type** gear icon and choose **Web App**.
4.  Enter a description (e.g., "Arden Match Sync").
5.  **Execute as**: Me (your email).
6.  **Who has access**: Anyone.
7.  Click **Deploy**.
8.  You may be asked to **Authorize Access**. Click the button and follow the prompts. If you see "Google hasn't verified this app," click "Advanced" and then "Go to [Project Name] (unsafe)".
9.  **COPY the Web App URL** (it ends in `/exec`).

### 4. Update the App Code
Open `index.tsx` in your project and paste the URL into the `GOOGLE_SHEET_URL` constant:

```typescript
const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbzUltI1DYskM9_Mwq3FR9LTtLTYQem9j8cfuV4YzTqgSr53Y90PBTfyR2KJq0DNDNNu/exec';
```

---

## 🛠 Troubleshooting

### "TypeError: Cannot read properties of undefined (reading 'postData')"
**Reason:** You clicked the "Run" button in the Apps Script editor on the `doPost` function.
**Fix:** You cannot "Run" `doPost` manually. It is triggered automatically when the web app sends data. To test your connection, use the `testSheetConnection` function instead:
1. Select `testSheetConnection` from the dropdown at the top of the editor.
2. Click **Run**.
3. Check your Google Sheet for a new "Test User" row.

### Data not appearing after deployment?
1. Ensure you used the **Web App URL** (ending in `/exec`), not the Library or Deployment ID.
2. Every time you change your Google Script code, you **must** create a "New Deployment" or update the version to make sure the live URL uses your latest code.
3. Check that **Who has access** is set to **Anyone** (not "Anyone with a Google Account").
