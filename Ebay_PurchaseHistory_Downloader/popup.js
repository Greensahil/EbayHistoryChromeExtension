//https://itnext.io/all-youll-ever-need-to-know-about-chrome-extensions-ceede9c28836
//Things to note:
//when the popup is clicked the manifest.json files tells it to open popup.html. popup.html has popup.js script inside it
//The problem that needed to be solved in terms of communication is that the content.js has access to the entire page that the user is using but not the popup
//popup.js and popup.html has access to the popup only
//I do not need background.js for this project because I do not need to constantly listen
//So since popup.html is fired on popup open which in turn fires popup.js, the first thing it asks for to content.js is what is the time frame that 
//the user has selected in the content.js as popup has no idea about that. content is listening for that message and when it reads it, it sends a 
//response back to popup which it can use to do stuff


//debugging notes
//you can just save in vscode and hit update to update extension. You do not have to remove and re-add the extension
//You can do step debugging by going to the sources top >> www.ebay.com>> myb > purchaseHistory

//Also, I had to disable the video speed controller extension that I had installed to make this extension work. 
//Without doing that I was getting an error message:
//Unchecked runtime.lastError: Could not establish connection. Receiving end does not exist.


// MANIFEST.JSON NOTES
// COMMENTS ARE NOT PERMITTED IN MANIFEST.JSON SO ADDING IT HERE INSTEAD
//Note on pattern match:
//The second pattern match is for ebay.co.uk

// //  We should switch to manifest 3 soon

chrome.tabs.query({
    active: true,
    currentWindow: true
}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {
        type: "getCount"
    }, function(downloadTimeFrame) {
        //$(".dynamicYear").html(downloadTimeFrame)
        // I wanted to show the dates dynamically but sometimes this does not work for no reason
        // This date here has no value anyway except confirmation anyway so just saying selected date instead
        $(".dynamicYear").html(" Selected Date")
    });
});

// chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
//     sendResponse({
//         data: "I am fine, thank you. How is life in the background?"
//     }); 
// });

document.addEventListener('DOMContentLoaded', function() {
    //let modifiedElement
    $(".yearItem").on("click", function() {
        //modifiedElement = $(this)
        const dateFilterSelected = $("#dateFilterForDownload").val()
        console.log(dateFilterSelected)
        chrome.tabs.executeScript({
            code: '(' + modifyDOM + `)('${dateFilterSelected}');` //argument here is a string but function.toString() returns function's code
        }, (results) => {
            //Here we have just the innerHTML and not DOM structure
        });

        window.close();
    });


    // You cannot attach a debugger to this function because 
    // Execute script runs on the open page
    // see this link for more info: https://stackoverflow.com/questions/28760463/how-to-use-console-log-when-debugging-tabs-executescript
    // So debug this screen we need to use the open page. I have been logging to the console, opening the line where it says its printing from
    function modifyDOM(dateFilterSelected) {
        let typedArray = []
        let orderNumber = []
        let orderDate = []
        let itemID = []
        let privateNotes = []
        let sellerID = []
        let sellerRating = []
        let itemName = []
        //let trackingNumber= []
        let shippedDate = []
        let deliveryDate = []
        let qtyPurchased = []
        let shippingCost = []
        let shippingType = []
        let itemPrice = []
        let itemCurrency = []
        let orderTotal = []
        let orderInfoURL = []
        let orderNote = []
        let trackingNumber = []
        let shippingTrackingNumbers = []
        let transactionDetailsURL = []

        var allData = [];

        let shippingObject = {}

        var dataURL = [];
        //let allHTMLPages = ``

        async function downloadListing() {
            
            //const numberOfPages = $('.pagination__item').length
            // Setting max number of pages so that we do not enter an infinite loop
            const maxNumberOfPages = 24
            //const dateFilterSelected = $("#dateFilterForDownload").val()
            console.log("Ebay Purchase History Download Process begins :)")
            console.log("Date Selection Made")
            console.log(dateFilterSelected)
            

            for(let page = 0; page < maxNumberOfPages; page++){

                // https://www.ebay.com/mye/myebay/ajax/purchase/get?filter=year_filter%3ALAST_YEAR&displayState=UNHIDDEN&page=1&moduleId=2749&pg=purchase

                //https://www.ebay.com/mye/myebay/ajax/purchase/get?filter=year_filter:TWO_YEARS_AGO&displayState=UNHIDDEN&page=1&modules=ORDERS&pg=purchase

                //  "https://www.ebay.com/mye/myebay/ajax/v2/purchase/mp/get?filter=year_filter:" +
                //  `${dateFilterSelected}&page=${page+1}&modules=ALL_TRANSACTIONS&pg=purchase&mp=purchase-module-v2`

                // "https://www.ebay.com/mye/myebay/ajax/v2/purchase/mp/get?filter=year_filter:" +
                // `${dateFilterSelected}&page=${page+1}&modules=ALL_TRANSACTIONS&pg=purchase&mp=purchase-module-v2`

                let  moduleIDString = "&moduleId=122164"

                // if(dateFilterSelected == "LAST_60_DAYS"){
                //     // For last 60 days filter when we send an incorrect page number
                //     // it still returns repeated result
                //     // so for this filter we will check if orderID is repeating an then stop 
                //     moduleIDString = ""
                    
                // }
                // else{
                //     // Through testing I have found that this remains constant
                //     moduleIDString = "&moduleId=122164"
                // }

                const urlForDownload = `${window.location.origin}/mye/myebay/ajax/v2/purchase/mp/get?filter=year_filter:`+
                `${dateFilterSelected}&page=${page+1}&modules=ALL_TRANSACTIONS${moduleIDString}&pg=purchase&mp=purchase-module-v2`

                console.log(` BASE URL Detected ${window.location.origin}`)
                console.log(` URL CREATED FOR DOWNLOAD IS: `  + urlForDownload)

                const purchaseObj= await sendRequestToObtainPurchaseHistory(urlForDownload)

                // if(dateFilterSelected == "LAST_60_DAYS"){
                //     // For last 60 days filter when we send an incorrect page number
                //     // it still returns repeated result
                //     // so for this filter we will check if orderID is repeating an then stop                
                //     const firstOrderIDInThisPage = purchaseObj.modules.RIVER[0].data.items[0]?.itemCards[0]?.__myb?.orderId
                //     // Check if our global array already contains this orderID
                //     if(orderNumber.includes(firstOrderIDInThisPage)){
                //         // Ok it is repeating now
                //         debugger;
                //         break;
                //     }
                // }
                //const purchaseObject = JSON.parse(purchaseJSON)
                //console.log(purchaseObj.modules.RIVER[0].data.items)

                // So we will keep going until we find no data or we hit the max that we have specified
                // user messaged me about an error here "Cannot read properties of undefined (reading 'data')"
                // So using ?.
                if(!purchaseObj.modules?.RIVER[0]?.data?.items){
                    break;
                }

                processAllItemsForAPage(purchaseObj.modules.RIVER[0].data.items)
                
            }
            setupExcelFileForDownload(dateFilterSelected)

        }

        function processAllItemsForAPage(arrayOfItems){
            for(let item of arrayOfItems){
                // Each item of array is an object
                if(item.itemCards){
                    
                    // Using optional chaining here so that I can access values that are deep within the chain
                    // The optional chaining operator (?.) enables you to read the value of a property located deep 
                    // within a chain of connected objects without having to check that each reference in the chain is valid
                    const itemIDVal = item?.itemCards[0]?.listingId
                    const itemNameVal = item?.itemCards[0]?.image?.title
                    const itemPriceVal = item?.itemCards[0]?.additionalPrice?.value?.value
                    const itemCurrencyVal = item?.itemCards[0]?.additionalPrice?.value?.currency
                    const orderIDVal = item?.itemCards[0]?.__myb?.orderId
                    const sellerIDVal = item?.itemCards[0]?.__myb?.sellerInfo[1]?.textSpans[0]?.text
                    const orderDateVal = item?.secondaryMessage[1]?.textSpans[0]?.text
                    const orderTotalVal = item?.secondaryMessage[3]?.textSpans[0]?.text
                    const orderNoteVal = item?.itemCards[0]?.__myb?.addEditNote?.textSpans[0]?.text
                    const orderInfoURLVal = item?.itemCards[0]?.__myb?.actionList[0]?.action?.URL

                    let trackingNumberVal

                    if(item?.itemCards[0]?.__myb?.deliveryEstimateMessage?.additionalText){
                        trackingNumberVal = item?.itemCards[0]?.__myb?.deliveryEstimateMessage?.additionalText[1]?.textSpans[1].text
                    }
                    else{
                        trackingNumberVal = ""
                    }
                    

                    

                    orderNumber.push(orderIDVal)                           
                    itemID.push(itemIDVal)                            
                    itemName.push(itemNameVal)
                    itemPrice.push(itemPriceVal)
                    itemCurrency.push(itemCurrencyVal)
                    orderDate.push(orderDateVal)
                    sellerID.push(sellerIDVal)
                    orderTotal.push(orderTotalVal)
                    
                    //trackingNumber.push('')
                    orderNote.push(orderNoteVal)

                    orderInfoURL.push(orderInfoURLVal)
                    trackingNumber.push(trackingNumberVal)
                }
                
            }
        }

        async function sendRequestToObtainPurchaseHistory(getRequestURLForPurchaseHistory){
            return new Promise((resolve, reject)=>{
                $.ajax({
                    type:"GET",
                    url: getRequestURLForPurchaseHistory,
                    success: function(data){
                        resolve(data)
                    }
                })
            })
        }
        

        function setupExcelFileForDownload(dateFilterSelected) {

            // //Some information like order total, tracking number and order notes are only found on last 60 days
            // //So basically saying if no orderTotal was found do not even show the column in excel
            // let blnOrderTotalFound = orderTotal.find((total)=>{
            //     return total != ""
            // })

            let tempArray = []
            typedArray = []
            //Set headers
            tempArray.push("OrderNumber")
            tempArray.push("OrderDate")
            tempArray.push("ItemID")
            // tempArray.push("PrivateNote")
            tempArray.push("Seller")
            // tempArray.push("SellerRating%")
            tempArray.push("ItemName")
            // tempArray.push("ShippedDate")
            // //tempArray.push("DeliveryDate")
            // tempArray.push("QtyPurchased")
            // tempArray.push("ShippingCost")
            // tempArray.push("ShippingType")
            tempArray.push("ItemPrice")
            tempArray.push("Currency")
            // if(blnOrderTotalFound){
                
            // }
            tempArray.push("OrderTotal")
            tempArray.push("OrderNotes")
            tempArray.push("TrackingNumber")
            tempArray.push("View Order Detail")

            // if(blnOrderTotalFound){
            //     tempArray.push("TrackingNumber")
            //     tempArray.push("OrderNotes")
            // }
            //tempArray.push("TrackingNumber")
            
            // tempArray.push("ShipTrackingNums")
            // tempArray.push("TransDetailsURL")
            typedArray.push(tempArray)



            for (let i = 0; i < orderNumber.length; i++) {
                tempArray = []
                tempArray.push(orderNumber[i])
                tempArray.push(orderDate[i])
                tempArray.push(itemID[i])
                // tempArray.push(privateNotes[i])
                tempArray.push(sellerID[i])
                // tempArray.push(sellerRating[i])
                tempArray.push(itemName[i])
                // tempArray.push(shippedDate[i])
                // //tempArray.push(deliveryDate[i])
                // tempArray.push(qtyPurchased[i])
                // tempArray.push(shippingCost[i])
                // tempArray.push(shippingType[i])
                tempArray.push(itemPrice[i])
                tempArray.push(itemCurrency[i])
                // if(blnOrderTotalFound){
                //     tempArray.push(orderTotal[i])
                // }
                tempArray.push(orderTotal[i])
                // if(blnOrderTotalFound){
                //     tempArray.push(trackingNumber[i])
                //     tempArray.push(orderNote[i])
                // }
                //
                //tempArray.push(trackingNumber[i])
                tempArray.push(orderNote[i])
                tempArray.push(trackingNumber[i])
                tempArray.push(orderInfoURL[i])
                // tempArray.push(shippingTrackingNumbers[i])
                // tempArray.push(transactionDetailsURL[i])


                //Push each array as a row to typed array
                typedArray.push(tempArray)
            }

            downloadExcelFile(typedArray, dateFilterSelected)
            console.log("Ebay Purchase History Download Process ends :)")
        }

        downloadListing()


        function downloadExcelFile(typedArray, dateFilterSelected) {
            var wb = XLSX.utils.book_new();
            wb.Props = {
                Title: "Ebay Purchase History",
                Subject: "Purchase History",
                Author: "Sahil Sharma"
            };

            wb.SheetNames.push(`Purchase History ${dateFilterSelected}`);

            let ws_data = typedArray;

            let ws = XLSX.utils.aoa_to_sheet(ws_data);
            wb.Sheets[`Purchase History ${dateFilterSelected}`] = ws;
            let wbout = XLSX.write(wb, {
                bookType: 'xlsx',
                type: 'binary'
            });
            saveAs(new Blob([s2ab(wbout)], {
                type: "application/octet-stream"
            }), `Purchase History ${dateFilterSelected}.xlsx`);

        }

        function s2ab(s) {
            var buf = new ArrayBuffer(s.length); //convert s to arrayBuffer
            var view = new Uint8Array(buf); //create uint8array as viewer
            for (var i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF; //convert to octet
            return buf;
        }

        dateFilter = "2021"
        return dateFilter


    }
})


