_initial();  

async function _initial(){
try {
        // 獲取當前用戶地址
        //const holder = await connectWallet();  
        const linkcode = await getParameterByName('linkcode');       
        //const burgerBox = getAvailableRE(linkcode);
        alert("BurgerBox[1]:"+ linkcode );
    } catch (error) {
        console.error("Error:", error);
        alert("Error:"+error);
    }
}
