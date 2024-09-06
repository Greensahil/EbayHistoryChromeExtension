// https://itnext.io/all-youll-ever-need-to-know-about-chrome-extensions-ceede9c28836
// Things to note:
// when the popup is clicked the manifest.json files tells it to open popup.html.
// popup.html has popup.js script inside it
// The problem that needed to be solved in terms of communication is that the content.js
// has access to the entire page that the user is using but not the popup
// popup.js and popup.html has access to the popup only
// I do not need background.js for this project because I do not need to constantly listen
// So since popup.html is fired on popup open which in turn fires popup.js,
// the first thing it asks for to content.js is what is the time frame that
// the user has selected in the content.js as popup has no idea about that.
// content is listening for that message and when it reads it, it sends a
// response back to popup which it can use to do stuff

// debugging notes
// you can just save in vscode and hit update to update extension.
// Make sure you load and enable the extension to get this option
// You do not have to remove and re-add the extension
// You can do step debugging by looking at the console message and clicking on the line number
// I just let a line error out, and click on it to go to the place where the error is coming from

// Also, I had to disable the video speed controller extension
// that I had installed to make this extension work.
// Without doing that I was getting an error message:
// Unchecked runtime.lastError: Could not establish connection. Receiving end does not exist.

// MANIFEST.JSON NOTES
// COMMENTS ARE NOT PERMITTED IN MANIFEST.JSON SO ADDING IT HERE INSTEAD
// Note on pattern match:
// The second pattern match is for ebay.co.uk

// //  We should switch to manifest 3 soon

// eslint-disable-next-line no-undef
chrome.tabs.query({
  active: true,
  currentWindow: true,
}, (tabs) => {
  chrome.tabs.sendMessage(tabs[0].id, {
    type: 'getCount',
  }, (response) => {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
      $('.dynamicYear').html('Error: Could not connect to page');
    } else if (response) {
      $('.dynamicYear').html(response);
    } else {
      $('.dynamicYear').html('No date selected');
    }
  });
});
document.addEventListener('DOMContentLoaded', () => {
  // Populate year dropdowns
  const currentYear = new Date().getFullYear();
  for (let year = currentYear; year >= 2017; year -= 1) {
    $('#startYear').append(new Option(year, year));
    $('#endYear').append(new Option(year, year));
  }

  $('.yearItem').on('click', () => {
    const startYear = parseInt($('#startYear').val(), 10);
    const endYear = parseInt($('#endYear').val(), 10);
    const includeISBN = $('#includeISBN').is(':checked');
    // Iterate through each year in the range
    for (let year = startYear; year <= endYear; year += 1) {
      // Convert year to eBay specific term
      const dateFilterSelected = mapYearToEbayTerm(year);
      if (dateFilterSelected) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          // The chrome.scripting.executeScript method is a powerful API 
          // provided by Chrome that allows an extension to inject and execute a script in the context of a web page.

          // When you use chrome.scripting.executeScript, you're essentially telling Chrome to take the function you've 
          // specified (in this case, modifyDOM) and inject it into the web page's context, where it will then be executed.
          // Once injected, the modifyDOM function runs in the context of the web page, not in the context of 
          // our extension's popup. This is why it can make AJAX requests and interact with the page's 
          // DOM as if it were a script loaded by the page itself.
          chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            function: modifyDOM,
            args: [dateFilterSelected, includeISBN],
          });
        });
      } else {
        alert(`Year ${year} is not supported.`);
      }
    }

    window.close();
  });
});

function mapYearToEbayTerm(year) {
  const currentYear = 2024; // Set to current year
  const yearDiff = currentYear - year;
  switch (yearDiff) {
    case 0: return 'CURRENT_YEAR';
    case 1: return 'LAST_YEAR';
    case 2: return 'TWO_YEARS_AGO';
    case 3: return 'THREE_YEARS_AGO';
    case 4: return 'FOUR_YEARS_AGO';
    case 5: return 'FIVE_YEARS_AGO';
    case 6: return 'SIX_YEARS_AGO';
    case 7: return 'SEVEN_YEARS_AGO';
    case 8: return 'EIGHT_YEARS_AGO';
    case 9: return 'NINE_YEARS_AGO';
    case 10: return 'TEN_YEARS_AGO';
    case 11: return 'ELEVEN_YEARS_AGO';
    case 12: return 'TWELVE_YEARS_AGO';
    case 13: return 'THIRTEEN_YEARS_AGO';
    case 14: return 'FOURTEEN_YEARS_AGO';
    case 15: return 'FIFTEEN_YEARS_AGO';
    case 16: return 'SIXTEEN_YEARS_AGO';
    case 17: return 'SEVENTEEN_YEARS_AGO';
    case 18: return 'EIGHTEEN_YEARS_AGO';
    case 19: return 'NINETEEN_YEARS_AGO';
    case 20: return 'TWENTY_YEARS_AGO';
    case 21: return 'TWENTY_ONE_YEARS_AGO';
    case 22: return 'TWENTY_TWO_YEARS_AGO';
    default: return null;
  }
}

function modifyDOM(dateFilterSelected, includeISBN) {
  let typedArray = [];
  const orderNumber = [];
  const orderDate = [];
  const itemID = [];
  const sellerID = [];
  const itemName = [];
  const itemPrice = [];
  const itemCurrency = [];
  const orderTotal = [];
  const orderInfoURL = [];
  const orderNote = [];
  const trackingNumber = [];
  const itemISBN = [];
  const itemImageURL = [];
  const itemQuantity = [];

  async function downloadListing() {
    const maxNumberOfPages = 300;
    console.log('Ebay Purchase History Download Process begins :)');
    console.log('Date Selection Made');
    console.log(dateFilterSelected);

    for (let page = 0; page < maxNumberOfPages; page += 1) {
      const moduleIDString = '&moduleId=122164';

      const urlForDownload = `${window.location.origin}/mye/myebay/ajax/v2/purchase/mp/get?filter=year_filter:`
              + `${dateFilterSelected}&page=${page + 1}&modules=ALL_TRANSACTIONS${moduleIDString}&pg=purchase&mp=purchase-module-v2`;

      console.log(` BASE URL Detected ${window.location.origin}`);
      console.log(` URL CREATED FOR DOWNLOAD IS: ${urlForDownload}`);

      const purchaseObj = await sendRequestToObtainPurchaseHistory(urlForDownload);

      if (!purchaseObj.modules?.RIVER[0]?.data?.items) {
        break;
      }
      await processAllItemsForAPage(purchaseObj.modules.RIVER[0].data.items);
    }
    setupExcelFileForDownload(dateFilterSelected);
  }

  async function processAllItemsForAPage(arrayOfItems) {
    let isbnMap = {};
    if (includeISBN) {
      const isbnPromises = arrayOfItems.flatMap((item) => (item.itemCards
        ? item.itemCards.map((card) => ({
          id: card.listingId,
          promise: fetchISBN(card.listingId),
        })) : []));

      const isbnResults = await Promise.all(isbnPromises.map((p) => p.promise));
      isbnMap = isbnPromises.reduce((acc, cur, idx) => {
        acc[cur.id] = isbnResults[idx] || '';
        return acc;
      }, {});
    }

    for (const item of arrayOfItems) {
      const numberOfItemsInTheSameOrder = item.itemCards ? item.itemCards.length : 0;

      for (let j = 0; j < numberOfItemsInTheSameOrder; j += 1) {
        if (item.itemCards) {
          const itemIDVal = item?.itemCards?.[j]?.listingId;

          let isbn = '';
          if (includeISBN) {
            isbn = isbnMap[itemIDVal];
          }

        

          //console.log('herererererrrrrrrrrrrrrrrrrrrrrrrr')
          const itemNameVal = item?.itemCards?.[j]?.image?.title;
          const itemPriceVal = item?.itemCards?.[j]?.additionalPrice?.value?.value;
          const itemCurrencyVal = item?.itemCards?.[j]?.additionalPrice?.value?.currency;
          const orderIDVal = item?.itemCards?.[j]?.__myb?.orderId;
          const sellerIDVal = item?.itemCards?.[j]?.__myb?.sellerInfo?.[1]?.textSpans?.[0]?.text;
          // if (sellerIDVal === 'iclemartin') {
          //   console.log('Found item from seller iclemartin:', item.itemCards[j]);
          //   item.itemCards[j].__myb
          // }
          const orderDateVal = item?.secondaryMessage?.[1]?.textSpans?.[0]?.text;
          const orderTotalVal = item?.secondaryMessage?.[3]?.textSpans?.[0]?.text;
          const orderNoteVal = item?.itemCards?.[j]?.__myb?.addEditNote?.textSpans?.[0]?.text;
          const orderInfoURLVal = item?.itemCards?.[j]?.__myb?.actionList?.[0]?.action?.URL;
          const trackingNumberVal = item?.itemCards?.[j]?.__myb?.actionList?.[0]?.action?.params?.trackingNumber ?? '';
          const imageUrl = item?.itemCards?.[j]?.image?.URL || 'No Image Found';

          // Extract quantity
          // Slightly better than ?. method might want to improve others in the future
          let quantityVal = 1; // Default to 1 if not found
          const aspectValuesList = item.itemCards[j].aspectValuesList;
          if (aspectValuesList && aspectValuesList.length > 0) {
            const quantityAspect = aspectValuesList.find(aspect => 
              aspect.textSpans && 
              aspect.textSpans[0] && 
              aspect.textSpans[0].text && 
              aspect.textSpans[0].text.toLowerCase().startsWith('quantity :')
            );
            if (quantityAspect) {
              const quantityText = quantityAspect.textSpans[0].text;
              const quantityMatch = quantityText.match(/\d+/);
              if (quantityMatch) {
                quantityVal = parseInt(quantityMatch[0], 10);
              }
            }
          }

          orderNumber.push(orderIDVal);
          itemID.push(itemIDVal);
          itemName.push(itemNameVal);
          itemPrice.push(itemPriceVal);
          itemQuantity.push(quantityVal);
          itemCurrency.push(itemCurrencyVal);
          orderDate.push(orderDateVal);
          sellerID.push(sellerIDVal);
          orderTotal.push(orderTotalVal);
          orderNote.push(orderNoteVal);
          orderInfoURL.push(orderInfoURLVal);
          trackingNumber.push(trackingNumberVal);
          if (includeISBN) {
            itemISBN.push(isbn);
          }
          itemImageURL.push(imageUrl);
        }
      }
    }
  }

  async function sendRequestToObtainPurchaseHistory(getRequestURLForPurchaseHistory) {
    return new Promise((resolve, _reject) => {
      $.ajax({
        type: 'GET',
        url: getRequestURLForPurchaseHistory,
        success(data) {
          resolve(data);
        },
      });
    });
  }

  async function fetchISBN(itemID) {
    const itemPageUrl = `${window.location.origin}/itm/${itemID}`;
    return new Promise((resolve, reject) => {
      $.ajax({
        url: itemPageUrl,
        success(html) {
          const isbnElement = $(html).find('dl.ux-labels-values--isbn dd.ux-labels-values__values .ux-textspans').text();
          resolve(isbnElement || 'N/A');
        },
        error(err) {
          console.log('Error fetching ISBN for itemID:', itemID, err);
          resolve('');
        },
      });
    });
  }

  function setupExcelFileForDownload(_dateFilterSelected) {
    let tempArray = [];
    typedArray = [];
    // Set headers
    tempArray.push('OrderNumber');
    tempArray.push('OrderDate');
    tempArray.push('ItemID');
    tempArray.push('Seller');
    tempArray.push('ItemName');
    tempArray.push('ItemPrice');
    tempArray.push('Currency');
    tempArray.push('Quantity');
    tempArray.push('OrderTotal');
    tempArray.push('OrderNotes');
    tempArray.push('TrackingNumber');
    tempArray.push('Image URL');

    if (includeISBN) {
      tempArray.push('ISBN');
    }
    tempArray.push('View Order Detail');

    typedArray.push(tempArray);

    for (let i = 0; i < orderNumber.length; i += 1) {
      tempArray = [];
      tempArray.push(orderNumber[i]);
      tempArray.push(orderDate[i]);
      tempArray.push(itemID[i]);
      tempArray.push(sellerID[i]);
      tempArray.push(itemName[i]);
      tempArray.push(itemPrice[i]);
      tempArray.push(itemCurrency[i]);
      tempArray.push(itemQuantity[i]);
      tempArray.push(orderTotal[i]);
      tempArray.push(orderNote[i]);
      tempArray.push(trackingNumber[i]);
      tempArray.push(itemImageURL[i]);
      if (includeISBN) {
        tempArray.push(itemISBN[i]);
      }
      tempArray.push(orderInfoURL[i]);

      typedArray.push(tempArray);
    }

    downloadExcelFile(typedArray, dateFilterSelected);
    console.log('Ebay Purchase History Download Process ends :)');
  }

  downloadListing();

  function downloadExcelFile(typedArray, dateFilter) {
    const wb = XLSX.utils.book_new();

    wb.Props = {
      Title: 'Ebay Purchase History',
      Subject: 'Purchase History',
      Author: 'Green Coder',
    };

    const sheetName = getSheetNameFromDateFilter(dateFilter);

    wb.SheetNames.push(sheetName);
    const ws_data = typedArray;
    const ws = XLSX.utils.aoa_to_sheet(ws_data);

    wb.Sheets[sheetName] = ws;

    const fileName = `Ebay_Purchase_History_${sheetName}.xlsx`;
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
    saveAs(new Blob([s2ab(wbout)], { type: 'application/octet-stream' }), fileName);
  }

  function getSheetNameFromDateFilter(dateFilter) {
    const currentYear = new Date().getFullYear();
    const nameMap = {
      LAST_60_DAYS: 'Last_60_Days',
      CURRENT_YEAR: currentYear.toString(),
      LAST_YEAR: (currentYear - 1).toString(),
      TWO_YEARS_AGO: (currentYear - 2).toString(),
      THREE_YEARS_AGO: (currentYear - 3).toString(),
      FOUR_YEARS_AGO: (currentYear - 4).toString(),
      FIVE_YEARS_AGO: (currentYear - 5).toString(),
      SIX_YEARS_AGO: (currentYear - 6).toString(),
      SEVEN_YEARS_AGO: (currentYear - 7).toString(),
      EIGHT_YEARS_AGO: (currentYear - 8).toString(),
      NINE_YEARS_AGO: (currentYear - 9).toString(),
      TEN_YEARS_AGO: (currentYear - 10).toString(),
      ELEVEN_YEARS_AGO: (currentYear - 11).toString(),
      TWELVE_YEARS_AGO: (currentYear - 12).toString(),
      THIRTEEN_YEARS_AGO: (currentYear - 13).toString(),
      FOURTEEN_YEARS_AGO: (currentYear - 14).toString(),
      FIFTEEN_YEARS_AGO: (currentYear - 15).toString(),
      SIXTEEN_YEARS_AGO: (currentYear - 16).toString(),
      SEVENTEEN_YEARS_AGO: (currentYear - 17).toString(),
      EIGHTEEN_YEARS_AGO: (currentYear - 18).toString(),
      NINETEEN_YEARS_AGO: (currentYear - 19).toString(),
      TWENTY_YEARS_AGO: (currentYear - 20).toString(),
      TWENTY_ONE_YEARS_AGO: (currentYear - 21).toString(),
      TWENTY_TWO_YEARS_AGO: (currentYear - 22).toString(),
    };

    return nameMap[dateFilter] || dateFilter;
  }

  function s2ab(s) {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i += 1) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
  }

  return dateFilterSelected;
}
