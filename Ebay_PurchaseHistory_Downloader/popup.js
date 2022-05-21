//https://itnext.io/all-youll-ever-need-to-know-about-chrome-extensions-ceede9c28836
//Things to note:
//when the popup is clicked the manifest.json files tells it to open popup.html. popup.html has popop.js script inside it
//The problem that needed to be solved in terms of communication is that the content.js has access to the entire page that the user is using but not the popup
//popup.js and popup.html has access to the popup only
//I do not need background.js for this project because I do not need to constantly listen
//So since popup.html is fired on popup open which in turn fires popup.js, the first thing it asks for to content.js is what is the timeframe that 
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
        $(".dynamicYear").html(downloadTimeFrame)
        
    });
});

// chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
//     sendResponse({
//         data: "I am fine, thank you. How is life in the background?"
//     }); 
// });

document.addEventListener('DOMContentLoaded', function() {
    let modifiedElement
    $(".yearItem").on("click", function() {
        modifiedElement = $(this)

        chrome.tabs.executeScript({
            code: '(' + modifyDOM + ')();' //argument here is a string but function.toString() returns function's code
        }, (results) => {
            //Here we have just the innerHTML and not DOM structure
        });

        window.close();
    });



    function modifyDOM() {
        let typedArray = []
        let orderNumber = []
        let orderDate = []
        let itemID = []
        let privateNotes = []
        let sellerID = []
        let sellerRating = []
        let itemName = []
        let trackingNumber= []
        let shippedDate = []
        let deliveryDate = []
        let qtyPurchased = []
        let shippingCost = []
        let shippingType = []
        let itemPrice = []
        let orderTotal = []
        let shippingInfoURL = []
        let orderNote = []
        let shippingTrackingNumbers = []
        let transactionDetailsURL = []

        var allData = [];

        let shippingObject = {}

        var dataURL = [];
        //let allHTMLPages = ``

        function downloadListing() {
            $('.pagination__item').each(function() {
                if ($(this).attr('data-href')) {
                    //not hardcoding https://www.ebay.com/myb/PurchaseHistory because based on which country it is, it might not be the same url
                    dataURL.push(`${location.href.split("purchase?")[0]}/purchase?` + $(this).attr('data-href').split("?")[1] + "&pg=purchase");
                    //.replaceAt($(this).attr('data-url').indexOf("Page=")+5,page));
                }
            })
            //This means that there are no page numbers in this page. So we can just use the current URL
            if(dataURL.length == 0){
                dataURL.push(location.href)
            }

            for (let i = 0; i < dataURL.length; i++) {
                getAndPopulateData(dataURL[i],i)
            }

            let ajaxCounterForAllPages = 0


            let objHistoryPages = {} //Using an object instead of a big HTML string
            //because assigning each page a page number is going to help me set them in ascending order
            function getAndPopulateData(url,pageNumber) {
                $.ajax({
                    type: "GET",
                    url: url,
                    success: function(htmlPage) {
                        //allHTMLPages = allHTMLPages + htmlPage
                        ajaxCounterForAllPages += 1
                        objHistoryPages[pageNumber] = htmlPage
                        if (ajaxCounterForAllPages == dataURL.length) {
                            parseDataForHTMLPage(objHistoryPages) //global var but still passing
                            setupExcelFileForDownload()
                        }
                    }
                })
            }

            //**NOTE: Multiple items can be ordered in the same order. So as you can see
            //down below, some info is taken from order card, and then it starts looping the item card for more info
            function parseDataForHTMLPage(objHistoryPages) {
                //Objects are automatically ordered based on the keys so now, we do not have to order them manually
                for(let key in objHistoryPages){
                    let allCardsItems = $(objHistoryPages[key]).find(".m-order-card")
                    for (let orderCard of allCardsItems) {
                        let orderNumberVal = $(orderCard).find(".ph-col__info-orderNumber").text().split("ORDER NUMBER")[1]
                        let currentShippingInfoURL = $(orderCard).find("[data-action=VIEW_ORDER_DETAILS]").attr('href')
                        let sellerIDVal = $(orderCard).find(".PSEUDOLINK").text().split(" ")[0]
                        let orderTotalVal = $(orderCard).find(".ph-col__info-orderTotal .DEFAULT").text()
                        

                        let itemCards = $(orderCard).find(".m-item-card")
                        for(let itemCard of itemCards){
                            let tempItemPrice = $(itemCard).find(".container-item-col__info-additionalPrice .BOLD").text()
                            orderNumber.push(orderNumberVal)                           
                            itemID.push($(itemCard).find(".container-item-col__info-item-info-listingId").text().replace("(", "").replace(")", ""))                            
                            itemName.push($(itemCard).find(".container-item-col__info-item-info-title .nav-link").text())
                            itemPrice.push(tempItemPrice)
                            orderDate.push($(orderCard).find(".ph-col__info-orderDate").text().split("ORDER DATE")[1])
                            sellerID.push(sellerIDVal)
                            orderTotal.push(orderTotalVal)
                            shippingInfoURL.push(currentShippingInfoURL)
                            trackingNumber.push($(itemCard).find(".section-notice__main span.PSEUDOLINK").text())
                            orderNote.push($(itemCard).find(".edit-note__text").text())
                        }


                        
                        
                        // 

                        // let ajaxCounterForShippingPages = 0
                        // let shippingHTMLPages = ``
                        // $.ajax({
                        //     type: "GET",
                        //     url: shippingInfoURL,
                        //     success: function(htmlPage) {
                        //         shippingHTMLPages = shippingHTMLPages + htmlPage
                        //         ajaxCounterForShippingPages += 1
                        //         if (ajaxCounterForAllPages == allCardsItems.length) {
                        //             parseDataForShippingPage(allHTMLPages, orderNumber) //global var but still passing, orderNumber is an array
                        //         }
                        //     }
                        // })
                    }
                }


                

                // function parseDataForShippingPage(allHTMLShippingPagesCombined, orderNumberArr) {
                //     let shippingCostArrOfElm = $(allHTMLShippingPagesCombined).find(".c-std") //c-std class is for all three cards rather than just one card in each page

                //     let orderNumberCounter = 0;
                //     for (let i = 0; i < shippingCostArrOfElm; i++) {
                //         if (i % 2 == 0) {
                //             let currentOrderNumber = orderNumberArr[orderNumberCounter]
                //             shippingObject[currentOrderNumber].shippingCost = shippingCostArrOfElm[i].find("#orderCostItemSubTotal").text();
                //             orderNumberCounter += 1
                //         }
                //     }

                //     setupExcelFileForDownload()
                //     // //:odd gives me every second element in the html which is what I want
                //     // $(allHTMLShippingPagesCombined).$(".c-std:odd").each(function(elm) {
                //     //     shippingObject[orderNumber].shippingCost = elm.find("#orderCostItemSubTotal").text()
                //     // })



                // }


            }


        }

        

        function setupExcelFileForDownload() {

            //Some information like order total, tracking number and order notes are only found on last 60 days
            //So basically saying if no orderTotal was found do not even show the column in excel
            let blnOrderTotalFound = orderTotal.find((total)=>{
                return total != ""
            })

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
            if(blnOrderTotalFound){
                tempArray.push("OrderTotal")
            }
            tempArray.push("ViewShippingInfo")

            if(blnOrderTotalFound){
                tempArray.push("TrackingNumber")
                tempArray.push("OrderNotes")
            }
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
                if(blnOrderTotalFound){
                    tempArray.push(orderTotal[i])
                }
                tempArray.push(shippingInfoURL[i])
                if(blnOrderTotalFound){
                    tempArray.push(trackingNumber[i])
                    tempArray.push(orderNote[i])
                }
                
                // tempArray.push(shippingTrackingNumbers[i])
                // tempArray.push(transactionDetailsURL[i])


                //Push each array as a row to typed array
                typedArray.push(tempArray)
            }

            downloadExcelFile(typedArray)
        }

        downloadListing()


        function downloadExcelFile(typedArray) {
            var wb = XLSX.utils.book_new();
            wb.Props = {
                Title: "Ebay Purchase History",
                Subject: "Purcahse History",
                Author: "Sahil Sharma"
            };

            wb.SheetNames.push("Purchase History");

            let ws_data = typedArray;

            let ws = XLSX.utils.aoa_to_sheet(ws_data);
            wb.Sheets["Purchase History"] = ws;
            let wbout = XLSX.write(wb, {
                bookType: 'xlsx',
                type: 'binary'
            });
            saveAs(new Blob([s2ab(wbout)], {
                type: "application/octet-stream"
            }), 'Purchase History.xlsx');

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