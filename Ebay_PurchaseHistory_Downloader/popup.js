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
//you can just save in vscode and hit update to update extension. 
//Make sure you load and enable the extension to get this option
//You do not have to remove and re-add the extension
//You can do step debugging by looking at the console message and clicking on the line number
//I just let a line error out, and click on it to go to the place where the error is coming from

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
    // Populate year dropdowns
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= 2017; year--) {
        $('#startYear').append(new Option(year, year));
        $('#endYear').append(new Option(year, year));
    }

    //let modifiedElement
    $(".yearItem").on("click", function() {
        const startYear = parseInt($('#startYear').val());
        const endYear = parseInt($('#endYear').val());
    
        // Iterate through each year in the range
        for (let year = startYear; year <= endYear; year++) {
            // Convert year to eBay specific term
            const dateFilterSelected = mapYearToEbayTerm(year);
            if (dateFilterSelected) {
                chrome.tabs.executeScript({
                    code: '(' + modifyDOM + `)('${dateFilterSelected}');`
                }, (results) => {
                    // Results from executed script for each year
                });
            } else {
                alert("Year " + year + " is not supported.");
            }
        }
    
        window.close();
    });
    function mapYearToEbayTerm(year) {
        const currentYear = 2024; // Set to current year
        const yearDiff = currentYear - year;
        switch (yearDiff) {
            case 0: return "CURRENT_YEAR";
            case 1: return "LAST_YEAR";
            case 2: return "TWO_YEARS_AGO";
            case 3: return "THREE_YEARS_AGO";
            case 4: return "FOUR_YEARS_AGO";
            case 5: return "FIVE_YEARS_AGO";
            case 6: return "SIX_YEARS_AGO";
            case 7: return "SEVEN_YEARS_AGO";
            case 8: return "EIGHT_YEARS_AGO";
            case 9: return "NINE_YEARS_AGO";
            case 10: return "TEN_YEARS_AGO";
            case 11: return "ELEVEN_YEARS_AGO";
            case 12: return "TWELVE_YEARS_AGO";
            case 13: return "THIRTEEN_YEARS_AGO";
            case 14: return "FOURTEEN_YEARS_AGO";
            case 15: return "FIFTEEN_YEARS_AGO";
            case 16: return "SIXTEEN_YEARS_AGO";
            case 17: return "SEVENTEEN_YEARS_AGO";
            case 18: return "EIGHTEEN_YEARS_AGO";
            case 19: return "NINETEEN_YEARS_AGO";
            case 20: return "TWENTY_YEARS_AGO";
            case 21: return "TWENTY_ONE_YEARS_AGO";
            case 22: return "TWENTY_TWO_YEARS_AGO";
            // Add more cases as needed
            default: return null;
        }
    }
    
    // Function to map selected year range to eBay specific terms
    

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
            // Since we are already breaking the loop when we hit the last page there is not reason to 
            // not support instances where a user has a large amount of history to download
            const maxNumberOfPages = 300
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

                await processAllItemsForAPage(purchaseObj.modules.RIVER[0].data.items)
                
            }
            setupExcelFileForDownload(dateFilterSelected)

        }

       

        async function processAllItemsForAPage(arrayOfItems){
            for(let item of arrayOfItems){


                const numberOfItemsInTheSameOrder = item.itemCards?item.itemCards.length:0;

                for(let j =0; j<numberOfItemsInTheSameOrder;j++){
                    // Each item of array is an object
                    if(item.itemCards){
                        
                        // Using optional chaining here so that I can access values that are deep within the chain
                        // The optional chaining operator (?.) enables you to read the value of a property located deep 
                        // within a chain of connected objects without having to check that each reference in the chain is valid
                        const itemIDVal = item?.itemCards?.[j]?.listingId
                        const itemNameVal = item?.itemCards?.[j]?.image?.title
                        const itemPriceVal = item?.itemCards?.[j]?.additionalPrice?.value?.value
                        const itemCurrencyVal = item?.itemCards?.[j]?.additionalPrice?.value?.currency
                        const orderIDVal = item?.itemCards?.[j]?.__myb?.orderId
                        const sellerIDVal = item?.itemCards?.[j]?.__myb?.sellerInfo?.[1]?.textSpans?.[0]?.text
                        const orderDateVal = item?.secondaryMessage?.[1]?.textSpans?.[0]?.text
                        const orderTotalVal = item?.secondaryMessage?.[3]?.textSpans?.[0]?.text
                        const orderNoteVal = item?.itemCards?.[j]?.__myb?.addEditNote?.textSpans?.[0]?.text
                        const orderInfoURLVal = item?.itemCards?.[j]?.__myb?.actionList?.[0]?.action?.URL

                        let trackingNumberVal
                        // We used to have tracking number here but eBay moved it to a different place
                        // So now this will be the first time where we will go to a different page to request additional info
                        // if(item?.itemCards[0]?.__myb?.deliveryEstimateMessage?.additionalText){
                        //     trackingNumberVal = item?.itemCards[0]?.__myb?.deliveryEstimateMessage?.additionalText[1]?.textSpans[1].text
                        // }
                        // else{
                        //     trackingNumberVal = ""
                        // }
                        //?itemid=184847054924&transid=2471475992008
                        const URLToAddionalInfo = "https://www.ebay.com/ship/trk/tracking-details"
                        const URLWithtransactionID = item?.itemCards?.[j]?.__myb?.overflowActionsGroup?.entries[2]?.action?.URL
                        // In the above URL Get value after transactionId
                        // Make it case insensitive
                        let transactionID
                        if(URLWithtransactionID){
                            transactionID = URLWithtransactionID?.match(/transactionId=(.*)/i)
                            if(transactionID){
                                transactionID = transactionID[1]
                            }
                            
                        }
                        
                        const arrayOfPromisesAdditionalInfo = []
                        const arrayOfMatchingItemIDs = []
                        // FIX ME: This section is required for tracking number
                        // if(itemIDVal && transactionID){
                        //     // Do not await we want to array of promises
                        //     const additionalInfo = sendRuestToGetAdditionalInfo(URLToAddionalInfo, itemIDVal, transactionID)
                        //     arrayOfPromisesAdditionalInfo.push(additionalInfo)
                        //     arrayOfMatchingItemIDs.push(itemIDVal)
                            
                        // }
                        // if(orderIDVal == "03-06203-49647"){
                        //     debugger;
                        // }                        

                        const arrayOfAdditionalInfo = await Promise.all(arrayOfPromisesAdditionalInfo)
                        


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

        


        function downloadExcelFile(typedArray, dateFilter) {
            var wb = XLSX.utils.book_new();
            wb.Props = {
                Title: "Ebay Purchase History",
                Subject: "Purchase History",
                Author: "Green Coder"
            };
        
            let sheetName = getSheetNameFromDateFilter(dateFilter);
        
            wb.SheetNames.push(sheetName);
            let ws_data = typedArray;
            let ws = XLSX.utils.aoa_to_sheet(ws_data);
            wb.Sheets[sheetName] = ws;
        
            let fileName = `Ebay_Purchase_History_${sheetName}.xlsx`;
            let wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
            saveAs(new Blob([s2ab(wbout)], { type: "application/octet-stream" }), fileName);
        }

        function getSheetNameFromDateFilter(dateFilter) {
            const currentYear = new Date().getFullYear();
            const nameMap = {
                "LAST_60_DAYS": "Last_60_Days",
                "CURRENT_YEAR": currentYear.toString(),
                "LAST_YEAR": (currentYear - 1).toString(),
                "TWO_YEARS_AGO": (currentYear - 2).toString(),
                "THREE_YEARS_AGO": (currentYear - 3).toString(),
                "FOUR_YEARS_AGO": (currentYear - 4).toString(),
                "FIVE_YEARS_AGO": (currentYear - 5).toString(),
                "SIX_YEARS_AGO": (currentYear - 6).toString(),
                "SEVEN_YEARS_AGO": (currentYear - 7).toString(),
                "EIGHT_YEARS_AGO": (currentYear - 8).toString(),
                "NINE_YEARS_AGO": (currentYear - 9).toString(),
                "TEN_YEARS_AGO": (currentYear - 10).toString(),
                "ELEVEN_YEARS_AGO": (currentYear - 11).toString(),
                "TWELVE_YEARS_AGO": (currentYear - 12).toString(),
                "THIRTEEN_YEARS_AGO": (currentYear - 13).toString(),
                "FOURTEEN_YEARS_AGO": (currentYear - 14).toString(),
                "FIFTEEN_YEARS_AGO": (currentYear - 15).toString(),
                "SIXTEEN_YEARS_AGO": (currentYear - 16).toString(),
                "SEVENTEEN_YEARS_AGO": (currentYear - 17).toString(),
                "EIGHTEEN_YEARS_AGO": (currentYear - 18).toString(),
                "NINETEEN_YEARS_AGO": (currentYear - 19).toString(),
                "TWENTY_YEARS_AGO": (currentYear - 20).toString(),
                "TWENTY_ONE_YEARS_AGO": (currentYear - 21).toString(),
                "TWENTY_TWO_YEARS_AGO": (currentYear - 22).toString()
            };
        
            return nameMap[dateFilter] || dateFilter;
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


