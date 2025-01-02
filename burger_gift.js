alert("What a wonderful burger！");
_initial();

async function _initial(){
try {
        // 獲取當前用戶地址
        const holder = await connectWallet();                
        alert("data processing:"+ holder );
    } catch (error) {
        console.error("Error:", error);
        alert("Error:"+error);
    }
}
