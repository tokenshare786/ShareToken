// Helper Function to Get URL Parameter
function getParameterByName(name, url = window.location.href) {
    name = name.replace(/[[]]/g, "\\$&");
    const regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

// Fetch Available Red Envelopes
async function getAvailableRE(linkcode) {
    try {
        // 獲取當前用戶地址
        const accounts = await ethereum.request({ method: "eth_requestAccounts" });
        const userAddress = accounts[0];

        // 將輸入的 linkcode 轉換為十六進制
        const linkcodeHex = web3.utils.asciiToHex(linkcode);

        // 調用智能合約的 getAvailableRE 函數
        const availableRE = await contract.methods
            .getAvailableRE(linkcodeHex)
            .call({ from: userAddress });

        // 載入結果頁面並顯示查詢結果
        await loadRedEnvelopesPage(availableRE);
    } catch (error) {
        console.error("Error fetching available red envelopes:", error);
        alert("An error occurred while fetching available red envelopes.");
    }
}

// Load Red Envelopes Page and Display Results
async function loadRedEnvelopesPage(data) {
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

        if (data.length === 0) {
            alert("No available red envelopes found.");
            resultTable.hidden = true;
            return;
        }

        // 填充表格內容
        data.forEach((item, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${item.creator}</td>
                <td>${web3.utils.hexToAscii(item.desc)}</td>
                <td>${item.subAmt}</td>
                <td>${item.claimedAmt}</td>
                <td>${item.maxClaims}</td>
                <td>${item.eligiType}</td>
            `;
            resultBody.appendChild(row);
        });

        // 顯示表格
        resultTable.hidden = false;
    } catch (err) {
        console.error("Error loading content:", err);
        alert("Failed to load the red envelope page.");
    }
}

// 主流程：獲取 linkcode 並執行查詢
window.onload = async function () {
    const linkcode = getParameterByName('linkcode');
    if (linkcode == null) {
        linkcode ="";
    }    
        await getAvailableRE(linkcode); // 如果 linkcode 存在，直接查詢紅包     
};
