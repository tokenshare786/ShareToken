alert("Updated! 16");

let re_id;
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
             await loadburgerBoxPage();
        } else {
                alert("目前沒有甜甜圈 ><");
                return;
        }            
    } catch (error) {
        alert("initial Error:" + error);
    }  
}
alert("here..");
initializePage();



