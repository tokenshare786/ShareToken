_initial();  
let re;
async function _initial(){
try {
        // 獲取當前用戶地址
        //const holder = await connectWallet();
        //alert("holder:"+ holder );
        //const output = await getBalance(holder);
        //const linkcode = await getParameterByName('linkcode');
        //const output = await getAvailableRE(linkcode);
        //alert("BurgerBox[1]:"+ output );
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
        //const resultTable = document.getElementById("resultTable");
        //const resultBody = document.getElementById("resultBody");

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
        const row = document.createElement("span");
        row.innerHTML = `
         <div>          
            <h2 >${web3.utils.hexToAscii(item.desc)}</h2>   
            <p class="reward-item">${item.claimedAmt} / ${item.subAmt}</p>
            <p class="reward-item">${item.maxClaims} / ${item.claimCount} / ${item.eligiType}</p>
          </div>
          <div>
               <img src="${item.imgUrl}" alt="這是一張美麗的圖片">
          </div>
          `;
        content.appendChild(row);

        // 顯示表格
        //resultTable.hidden = false;
    } catch (err) {
        console.error("Error loading content:", err);
        alert("Failed to load the red envelope page." + err);            
    }
}

