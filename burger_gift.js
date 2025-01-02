alert("What a wonderful burger！")
try {
        // 獲取當前用戶地址
        const accounts = await ethereum.request({ method: "eth_requestAccounts" });
        const userAddress = accounts[0];

        // 將輸入的 linkcode 轉換為十六進制
        //const linkcodeHex = web3.utils.asciiToHex(linkcode);

        // 調用智能合約的 getSpecificRE 函數
        const specificR = await contract.methods
            .getSpecificRE(1)
            .call({ from: userAddress });

        // 載入結果頁面並顯示查詢結果
        //await loadRedEnvelopesPage(availableRE);
        alert("data process loading"+ specificR );
    } catch (error) {
        console.error("Error fetching available red envelopes:", error);
        alert("An error occurred while fetching available red envelopes.");
    }
