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
    var divs = document.querySelectorAll('div');
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
        let qtyPurchased = []
        let totalPrice = []


        //Total number of pages
        let totalNumberOfPages = 0;
        $(".pagination .pg").each(function(data){
          totalNumberOfPages ++
        })

        $(".pagination .pagn a").each(function(data){
          el = $(this)
        //   $('.ajax-wrap').on(function(){el.click() });
        $(".order-date").find(".row-value").each(function() {
            orderDate.push($(this).html());
        })
        // Item ID
        $(".display-item-id").each(function() {
            itemID.push($(this).html().replace(/[{()}]/g, ''));
        })
        //Private Notes
        $(".ntxt").each(function() {
            privateNotes.push($(this).html().replace(/[{()}]/g, ''));
        })
        //Seller ID
        $(".seller-id").each(function() {
            sellerID.push($(this).html().replace(/[{()}]/g, ''));
        })
        //Title 
        $(".item-title").each(function() {
            title.push($(this).html().replace(/[{()}]/g, ''));
        })

        // //Paid Date ???
        // //Shipped Date ???

        // Qty Purchased
        $(".seller-id").parent().find("span").each(function() {
            qtyPurchased.push($(this).html().replace(/[{()}]/g, ''))
        })

        //Trans Price???
        //Shipping Cost??

        //Total price
        $(".cost-label").each(function() {
            totalPrice.push($(this).html());
        })
        el.click() 
        })

        console.log(`Total number of pages ${totalNumberOfPages - 1}`)

        //Order Date
 





        let tempArray = []
        let typedArray = []

        //Set headers
        tempArray.push("Date")
        tempArray.push("ItemID")
        tempArray.push("PrivateNote")
        tempArray.push("Seller")
        tempArray.push("Title")
        tempArray.push("QtyPurchased")
        tempArray.push("TotalPrice")
        typedArray.push(tempArray)

        // console.log(tempArray)
        // console.log(typedArray)

        for (let i = 0; i < orderDate.length; i++) {
            tempArray = []
            tempArray.push(orderDate[i])
            tempArray.push(itemID[i])
            tempArray.push(privateNotes[i])
            tempArray.push(sellerID[i])
            tempArray.push(title[i])
            tempArray.push(qtyPurchased[i])
            tempArray.push(totalPrice[i])

            //Push each array as a row to typed array
            typedArray.push(tempArray)
        }
        console.log(typedArray)
        downloadExcelFile(typedArray)



        // let notifOptions = {
        //     type: 'basic',
        //     iconUrl: 'icon_128.png',
        //     title: 'File Downloaded',
        //     message: 'Excel File has been downloaded'
        // }
        //chrome.notifications.create('limitNotif', notifOptions)
    }

    function downloadExcelFile(typedArray) {
        console.log(typedArray)
        var wb = XLSX.utils.book_new();
        wb.Props = {
            Title: "Ebay Purchase History",
            Subject: "Purcahse History",
            Author: "Sahil Sharma",
            CreatedDate: getCurrentDate()
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

    function getCurrentDate() {
        let today = new Date();
        let dd = String(today.getDate()).padStart(2, '0');
        let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        let yyyy = today.getFullYear();

        return today = mm + '/' + dd + '/' + yyyy;
    }

    console.log('Tab script:');
    console.log(document.body);
    console.log($("#question-header").html())
    downloadListing();
    return document.body.innerHTML;

}