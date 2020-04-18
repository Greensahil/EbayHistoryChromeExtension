// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

function click(e) {
    chrome.tabs.executeScript({
        code: '(' + modifyDOM + ')();' //argument here is a string but function.toString() returns function's code
    }, (results) => {
        //Here we have just the innerHTML and not DOM structure
        console.log('Popup script:')
        console.log(results[0]);
    });
    window.close();
}

// function modifyDOM() {
//   //You can play with your DOM here or check URL against your regex
//   console.log('Tab script:');
//   console.log(document.body);
//   return document.body.innerHTML;
// }

//"document.body.style.backgroundColor='" + e.target.id + "'"
document.addEventListener('DOMContentLoaded', function() {
    var divs = document.querySelectorAll('.yearItem');
    for (var i = 0; i < divs.length; i++) {
        divs[i].addEventListener('click', click);
    }
});


function modifyDOM() {

  
        let typedArray = []
        //You can play with your DOM here or check URL against your regex
        function downloadListing() {
            let orderDate = []
            let itemID = []
            let privateNotes = []
            let sellerID = []
            let title = []
            let paidDate = []
            let shippedDate = []
            let deliveryDate = []
            let qtyPurchased = []
            let shippingCost = []
            let totalPrice = []
            let shippingTrackingNumbers =[]
            let transactionDetailsURL = []
            let currentURL
    
            var allData = [];
    
            var dataURL = [];
            var allDataObj = {};
    
            $('.pagn .pg').each(function(){
                if($(this).attr('data-url')){
                    dataURL.push("https://www.ebay.com/myb/" + $(this).attr('data-url'));
                }
            })
    
            //dataURL.shift() //Remove first item from array
            dataURL.splice(dataURL.length-1,1); //Remove last item from array
            for(let i = 0;i<dataURL.length;i++){
                getAndPopulateData(dataURL[i],i)
            }

            function getAndPopulateData(url,currentIndex){
                $.ajax({
                    type:"GET",
                    url:url,
                    success:function(data){
                        allDataObj[`${currentIndex}`] = data.data.items
                        allData.push(data)
                    }
                })
            }

            $(document).ajaxStop(function () {
                allDataObj = Object.values(allDataObj)
                console.log(allData)
                for(let key in allDataObj){
                    
                    let arr = allDataObj[key]
                    let shippedDateVal 
                    let deliveryDateVal
                    for(let item of arr){
                        shippedDateVal = ""
                        deliveryDateVal = ""
                        if(item.data.items[0].data.itemInfo.lineItemStates.shipped){
                            shippedDateVal =item.data.items[0].data.itemInfo.lineItemStates.shipped.params.date
                        }
                        if(item.data.items[0].data.itemInfo.lineItemStates.fundingStatus){
                            deliveryDateVal = item.data.items[0].data.itemInfo.lineItemStates.fundingStatus.params.date
                        }

                        itemID.push(String(item.data.items[0].data.itemInfo.itemId))
                        orderDate.push(item.data.orderInfo.orderDate)
                        privateNotes.push(item.data.items[0].data.itemInfo.noteInfo.note)
                        console.log(item.data.orderInfo)
                        sellerID.push(item.data.orderInfo.sellerInfo.login)
                        title.push(item.data.orderInfo.orderItemsTitle)
                        shippedDate.push(shippedDateVal)
                        deliveryDate.push(deliveryDateVal)
                        paidDate.push(deliveryDateVal)
                        qtyPurchased.push(item.data.items[0].data.itemInfo.quantity)
                        shippingCost.push(item.data.items[0].data.buyingInfo.shippingPrice)
                        totalPrice.push(item.data.items[0].data.buyingInfo.price)
                        shippingTrackingNumbers.push(item.data.orderInfo.shippingTrackingNumbers.toString())
                        transactionDetailsURL.push(item.data.items[0].actions[0].actionParam.url)
                        // currentURL.push(item.data.orderInfo.orderDate)
                    }
                }

                    let tempArray = []
                    typedArray = []
                    //Set headers
                    tempArray.push("OrderDate")
                    tempArray.push("ItemID")
                    tempArray.push("PrivateNote")
                    tempArray.push("Seller")
                    tempArray.push("Title")
                    tempArray.push("PaidDate")
                    tempArray.push("ShippedDate")
                    tempArray.push("DeliveryDate")
                    tempArray.push("QtyPurchased")
                    tempArray.push("ShippingCost")
                    tempArray.push("TotalPrice")
                    tempArray.push("ShipTrackingNums")
                    tempArray.push("TransDetailsURL")
                    typedArray.push(tempArray)
                
                for (let i = 0; i < orderDate.length; i++) {
                    tempArray = []
                    tempArray.push(orderDate[i])
                    tempArray.push(itemID[i])
                    tempArray.push(privateNotes[i])
                    tempArray.push(sellerID[i])
                    tempArray.push(title[i])
                    tempArray.push(paidDate[i])
                    tempArray.push(shippedDate[i])
                    tempArray.push(deliveryDate[i])
                    tempArray.push(qtyPurchased[i])
                    tempArray.push(shippingCost[i])
                    tempArray.push(totalPrice[i])
                    tempArray.push(shippingTrackingNumbers[i])
                    tempArray.push(transactionDetailsURL[i])

        
                    //Push each array as a row to typed array
                    typedArray.push(tempArray)
                }

                   
                    downloadExcelFile(typedArray)

                    // console.log(itemID)
                    //console.log(orderDate)
                    //console.log(sellerID)
                    //console.log(title)
                    //console.log(qtyPurchased)
                    //console.log(totalPrice)
            });

            // function populateTypedArray(){
            //     for(let i =0;i<allData.length;i++){
            //         console.log(allData[i])
            //     }
            // }
        }
    

        downloadListing()


        function downloadExcelFile(typedArray) {
            console.log(typedArray)
            var wb = XLSX.utils.book_new();
            wb.Props = {
                Title: "Ebay Purchase History",
                Subject: "Purcahse History",
                Author: "Sahil Sharma"
            };
    
            wb.SheetNames.push("Purchase History");
    
            let ws_data = typedArray;
            // let ws_data = [
            //               ['Date' , 'ItemID','PrivateNote','Seller','Title','QtyPurchased','TotalPrice'],
            //               ['Date2' , 'ItemID2','PrivateNote2','Seller2','Title2','QtyPurchased2','TotalPrice2'],
            //               typedArray.values()
            //               ];
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
    
        // function getCurrentDate() {
        //     let today = new Date();
        //     let dd = String(today.getDate()).padStart(2, '0');
        //     let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        //     let yyyy = today.getFullYear();
    
        //     return today = mm + '/' + dd + '/' + yyyy;
        // }

}