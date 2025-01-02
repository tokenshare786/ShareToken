//alert("What a wonderful burger！");
_initial();

async function _initial(){
try {
        // 獲取當前用戶地址
        const holder = await connectWallet();                
        
        // 調用智能合約的 getSpecificRE 函數
        const burgerBox = await contract.methods
            .getSpecificRE(1)
            .call();
        alert("BurgerBox[1]:"+ burgerBox );
    } catch (error) {
        console.error("Error:", error);
        alert("Error:"+error);
    }
}
