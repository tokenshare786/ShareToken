alert("What a wonderful burger！");
_initial();

async function _initial(){
try {
        // 獲取當前用戶地址
        const holder = await connectWallet();                
        alert("data processing:"+ holder );
        // 調用智能合約的 getSpecificRE 函數
        const availableRE = await contract.methods
            .getSpecificRE(1)
            .call();
    } catch (error) {
        console.error("Error:", error);
        alert("Error:"+error);
    }
}
