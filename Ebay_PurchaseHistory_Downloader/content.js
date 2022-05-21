//contet.js is on manifest json file .The message sent from content.js to popup.js will only be received, when your Popup is active (=open) 
//https://stackoverflow.com/questions/48620183/chrome-extension-how-to-send-message-from-content-js-to-popup-js-page-action
chrome.runtime.onMessage.addListener(
  function(message, sender, sendResponse) {
      switch(message.type) {
          case "getCount":
            let dateFilter = $(".expand-btn__cell").text().split("AllMore")[0].replace("Not hidden","")
            console.log("Extension: Ebay Purchase History Downloader: DETECTED DATE " + dateFilter)
            if(!dateFilter || dateFilter == ""){
                dateFilter = "2021"
            }
            sendResponse(dateFilter);     //The filter year
            break;
          default:
              console.error("Unrecognized message: ", message);
      }
  }
);

