alert("What a wonderful burger！");
_initial();

async function _initial(){
try {
        // 獲取當前用戶地址
        const accounts = await ethereum.request({ method: "eth_requestAccounts" });
        const userAddress = accounts[0];        
        alert("data processing:"+ userAddress );
    } catch (error) {
        console.error("Error:", error);
        alert("Error:"+error);
    }
}
