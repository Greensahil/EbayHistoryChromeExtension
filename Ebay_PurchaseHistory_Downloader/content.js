// contet.js is on manifest json file .The message sent
// from content.js to popup.js will only be received,
// when your Popup is active (=open)
// https://stackoverflow.com/questions/48620183/chrome-extension-how-to-send-message-from-content-js-to-popup-js-page-action

/*
Current Flow of eBay Purchase History Downloader:
    A[User opens extension popup] --> B[Popup script loads]
    B --> C{User selects date range}
    C --> D[User clicks 'Download' button]
    D --> E[Popup sends message to content script]
    E --> F[Content script receives message]
    F --> G[modifyDOM function starts]
    G --> H[downloadListing function called]
    H --> I[Loop through pages]
    I --> J[sendRequestToObtainPurchaseHistory]
    J --> K[processAllItemsForAPage]
    K --> L{More pages?}
    L -->|Yes| I
    L -->|No| M[setupExcelFileForDownload]
    K --> N[Extract item details]
    N --> O[Fetch ISBN if enabled]
    O --> P[Extract quantity information]
    M --> Q[Prepare data for Excel]
    Q --> R[downloadExcelFile]
    R --> S[User receives Excel file]
*/

console.log('Ebay Purchase History Downloader content script loaded');
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'getCount') {
    getDateFilter().then(dateFilter => {
      console.log(`Extension: Ebay Purchase History Downloader: DETECTED DATE ${dateFilter}`);
      sendResponse(dateFilter);
    }).catch(error => {
      console.error('Error getting date filter:', error);
      sendResponse('Error: ' + error.message);
    });
    return true; // Indicates that the response is sent asynchronously
  } else {
    console.error('Unrecognized message: ', message);
  }
});

function getDateFilter() {
  return new Promise((resolve, reject) => {
    const dateFilterElement = document.querySelector('.expand-btn__cell');
    if (dateFilterElement) {
      let dateFilter = dateFilterElement.textContent.split('AllMore')[0].replace('Not hidden', '').trim();
      resolve(dateFilter || 'No date detected');
    } else {
      reject(new Error('Date filter element not found'));
    }
  });
}
