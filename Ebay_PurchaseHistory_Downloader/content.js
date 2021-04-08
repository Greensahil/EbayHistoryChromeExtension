chrome.runtime.onMessage.addListener(
  function(message, sender, sendResponse) {
      switch(message.type) {
          case "getCount":
              let dateFilter = $('div:contains("See orders from")').find(".expand-btn__cell:first-child").first().text()
              
               if(!dateFilter || dateFilter == ""){
                  dateFilter = "2021"
               } 

              sendResponse(dateFilter);     //The filter year
              break;
          default:
              console.error("Unrecognised message: ", message);
      }
  }
);