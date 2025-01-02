_initial();  
let re;
async function _initial(){
try {
       
        const reid = prompt("Enter the RedEnvelope ID:");
        if (reid) {
           re = await getSpecificRE(reid);
        }
        await loadburgerBoxPage(re);     
        
    } catch (error) {
        console.error("Error:", error);
        alert("Error:"+error);
    }
}

// Load burgerBoxPage and Display a Single Result
async function loadburgerBoxPage(item) {
    try {      
        // 清空之前的結果
        //resultBody.innerHTML = "";
        if (!item) {
            alert("No red envelope found.");
            //resultTable.hidden = true;
            return;
        }
         const content = document.getElementById("content");
         content.innerHTML = ""
        // 填充表格內容（只處理一個紅包）
        const row = document.createElement("div class='container'");
        row.innerHTML = `
            <div class="text-container">
                 <h2 class="main-title">${web3.utils.hexToAscii(item.desc)}</h2>
                     <p class="reward-item">${item.claimedAmt} / ${item.subAmt}</p>
                     <p class="reward-item">${item.maxClaims} / ${item.claimCount} / ${item.eligiType}</p>
            </div>
            <div class="image-container">
               <img src="${item.imgUrl}" alt="photo">  
            </div>
            </div>
          `;
           content.appendChild(row);
           // 顯示表格

    } catch (err) {
        console.error("Error loading content:", err);
        alert("Failed to display Burgerbox." + err);            
    }
}

