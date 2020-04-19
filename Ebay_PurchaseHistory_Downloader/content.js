var count = 0;
var content = $(".filter-content").html();

chrome.runtime.onMessage.addListener(
  function(message, sender, sendResponse) {
      switch(message.type) {
          case "getCount":
              sendResponse($(".filter-content").html());
              break;
          default:
              console.error("Unrecognised message: ", message);
      }
  }
);