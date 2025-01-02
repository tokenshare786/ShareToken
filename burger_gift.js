_initial();  

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
           await getSpecificRE(reid);
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Error:"+error);
    }
}
