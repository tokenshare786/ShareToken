alert("What a wonderful burger！")
try {
        // 獲取當前用戶地址
        const accounts = await ethereum.request({ method: "eth_requestAccounts" });
        const userAddress = accounts[0];        
        alert("data processing"+ userAddress );
    } catch (error) {
        console.error("Error fetching available red envelopes:", error);
        alert("An error occurred while fetching available red envelopes.");
    }
