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


//Also, I had to disable the video speed controller extension that I had installed to make this extension work. Without doing that I was getting an error message:
//Unchecked runtime.lastError: Could not establish connection. Receiving end does not exist.

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
    var modifiedElement
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
      
        var typedArray = []

        function downloadListing() {
            
            let orderNumber = []
            let orderDate = []
            let itemID = []
            let privateNotes = []
            let sellerID = []
            let sellerRating = []
            let title = []
            let shippedDate = []
            let deliveryDate = []
            let qtyPurchased = []
            let shippingCost = []
            let shippingType = []
            let totalPrice = []
            let shippingTrackingNumbers = []
            let transactionDetailsURL = []


            var allData = [];

            var dataURL = [];
            var allDataObj = {};

           
            //https://www.ebay.com/myb/PurchaseHistory?filter=year_filter%3ATWO_YEARS_AGO&displayState=UNHIDDEN&page=2&moduleId=2749&pg=purchase
            //https://www.ebay.com/myb//module_provider/purchase_activity?filter=year_filter:TWO_YEARS_AGO&displayState=UNHIDDEN&page=1&modules=ORDERS&moduleId=2749
            // $('.pagn .pg').each(function() {
            //     if ($(this).attr('data-url')) {
            //         dataURL.push("https://www.ebay.com/myb/" + $(this).attr('data-url'));
            //         // .replaceAt($(this).attr('data-url').indexOf("Page=")+5,page));
            //     }
            // })
            //https://www.ebay.com/myb/PurchaseHistory?filter=year_filter%3ATWO_YEARS_AGO&displayState=UNHIDDEN&page=5&moduleId=2749&pg=purchase
            //https://www.ebay.com/myb/PurchaseHistory?filter=year_filter:TWO_YEARS_AGO&displayState=UNHIDDEN&page=5&modules=ORDERS&moduleId=2749
            $('.pagination__item').each(function() {
                if ($(this).attr('data-href')) {
                    dataURL.push("https://www.ebay.com/myb/PurchaseHistory?" + $(this).attr('data-href').split("?")[1] + "&pg=purchase");
                    //.replaceAt($(this).attr('data-url').indexOf("Page=")+5,page));
                }
            })
            

            //https://www.ebay.com/mye/myebay/ajax/purchase/get?…N&page=1&modules=ORDERS&moduleId=2749&pg=purchase
            //https://www.ebay.com/mye/myebay/ajax/purchase/get?…N&page=1&modules=ORDERS&moduleId=2749&pg=purchase
            ///mye/myebay/ajax/purchase/get?filter=year_filter:T…=ORDERS&moduleId=2749&pg=purchase&_=1626221981067
            for (let i = 0; i < dataURL.length; i++) {
                console.log(dataURL)
                getAndPopulateData(dataURL[i], i)
            }
            //254320785974&transId=2537458400015
            function getAndPopulateData(url, currentIndex) {
                $.ajax({
                    type: "GET",
                    url: url,
                    success: function(htmlPage) {
                        //console.log($(htmlPage).find(".m-order-card").text())
                        allDataObj[`${currentIndex}`] = $(htmlPage).find(".m-order-card")
                        //allDataObj[`${currentIndex}`] = data.data.items
                        // allData.push(data)
                    }
                })
            }



            $(document).ajaxStop(function() {
                if (allDataObj) { //I will set allDataObj to undefined after finishing this. Without doing this multiple files were downloading
                    //If you downloaded 1 file it was working fine but if you then donwloaded another file it was downlaoding multiple files. I guessed this
                    //was because of ajax requests firing multiple times which meant ajax stop was firing multiple times as well. I am still not 100% sure what was causing it
                    //but this fixes it
                    for(let pageNumber in allDataObj){
                        //This is an array of jquery elements for the card ebay uses for each item
                        let allCardsInThisPage = allDataObj[pageNumber]
                        
                        for(let item of allCardsInThisPage){
                            orderNumber.push($(item).find(".ph-col__info-orderNumber").text().split("ORDER NUMBER")[1])
                            orderDate.push($(item).find(".ph-col__info-orderDate").text().split("ORDER DATE")[1])
                        }






                    }

                    let tempArray = []
                    typedArray = []
                    //Set headers
                    tempArray.push("OrderNumber")
                    tempArray.push("OrderDate")
                    // tempArray.push("ItemID")
                    // tempArray.push("PrivateNote")
                    // tempArray.push("Seller")
                    // tempArray.push("SellerRating%")
                    // tempArray.push("Title")
                    // tempArray.push("ShippedDate")
                    // //tempArray.push("DeliveryDate")
                    // tempArray.push("QtyPurchased")
                    // tempArray.push("ShippingCost")
                    // tempArray.push("ShippingType")
                    // tempArray.push("TotalPrice")
                    // tempArray.push("ShipTrackingNums")
                    // tempArray.push("TransDetailsURL")
                    typedArray.push(tempArray)



                    for (let i = 0; i < orderNumber.length; i++) {
                        tempArray = []
                        tempArray.push(orderNumber[i])
                        tempArray.push(orderDate[i])
                        // tempArray.push(itemID[i])
                        // tempArray.push(privateNotes[i])
                        // tempArray.push(sellerID[i])
                        // tempArray.push(sellerRating[i])
                        // tempArray.push(title[i])
                        // tempArray.push(shippedDate[i])
                        // //tempArray.push(deliveryDate[i])
                        // tempArray.push(qtyPurchased[i])
                        // tempArray.push(shippingCost[i])
                        // tempArray.push(shippingType[i])
                        // tempArray.push(totalPrice[i])
                        // tempArray.push(shippingTrackingNumbers[i])
                        // tempArray.push(transactionDetailsURL[i])


                        //Push each array as a row to typed array
                        typedArray.push(tempArray)
                    }

                    allDataObj = undefined
                    downloadExcelFile(typedArray)

                }

            });

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