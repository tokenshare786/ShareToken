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
        await loadRedEnvelopesPage(re);     
        
    } catch (error) {
        console.error("Error:", error);
        alert("Error:"+error);
    }
}

// Load Red Envelopes Page and Display a Single Result
async function loadRedEnvelopePage(item) {
    try {
        // 獲取 red_envelopes.html 的內容
        const response = await fetch("red_envelopes.html");
        const html = await response.text();

        // 替換 #content 區域的內容
        document.getElementById("content").innerHTML = html;

        // 載入 red_envelopes.js（假設裡面有動態互動邏輯）
        const script = document.createElement("script");
        script.src = "red_envelopes.js";
        document.body.appendChild(script);

        // 顯示查詢結果（假設 red_envelopes.html 有 #resultTable 和 #resultBody）
        const resultTable = document.getElementById("resultTable");
        const resultBody = document.getElementById("resultBody");

        // 清空之前的結果
        resultBody.innerHTML = "";

        if (!item) {
            alert("No red envelope found.");
            resultTable.hidden = true;
            return;
        }

        // 填充表格內容（只處理一個紅包）
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>1</td>
            <td>${item.creator}</td>
            <td>${web3.utils.hexToAscii(item.desc)}</td>
            <td>${item.subAmt}</td>
            <td>${item.claimedAmt}</td>
            <td>${item.maxClaims}</td>
            <td>${item.eligiType}</td>
        `;
        resultBody.appendChild(row);

        // 顯示表格
        resultTable.hidden = false;
    } catch (err) {
        console.error("Error loading content:", err);
        alert("Failed to load the red envelope page.");
    }
}

