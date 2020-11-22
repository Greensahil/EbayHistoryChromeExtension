chrome.runtime.onMessage.addListener(
  function(message, sender, sendResponse) {
      switch(message.type) {
          case "getCount":
              sendResponse($(".filter-content").html().replace("See orders from",""));     //The filter year
              break;
          default:
              console.error("Unrecognised message: ", message);
      }
  }
);