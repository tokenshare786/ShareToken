alert("Updated! 11");

let re_id = 0;
let re;
let card;
let eligible;
let isactive;
let userAddress;

async function initializePage() {
try {   
        re_id = await getreID();
        if(re_id > 0){
             re = await getSpecificRE(re_id);
        } else {
                alert("目前沒有甜甜圈 ><");
                return;
        }  
        await loadburgerBoxPage();  
    } catch (error) {
        alert("initial Error:"+error);
    }
}
alert("here..");
userAddress = await getHoldertoLowercase();
initializePage();

