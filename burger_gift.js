_initial();  

async function _initial(){
try {
        // 獲取當前用戶地址
        const holder = await connectWallet();  
        const linkcode = getParameterByName('linkcode');       
        const burgerBox = getAvailableRE(linkcode);
        alert("BurgerBox[1]:"+ burgerBox );
    } catch (error) {
        console.error("Error:", error);
        alert("Error:"+error);
    }
}
