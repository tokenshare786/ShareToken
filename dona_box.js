alert("Updated! 11");

var re_id = await getreID();
var re = await getSpecificRE(re_id);
const userAddress = await getHoldertoLowercase();

async function initializePage() {
try {   
        if (!re) {
            alert("目前沒有甜甜圈 ><");
            return;
        }
        await loadburgerBoxPage();  
    } catch (error) {
        alert("initial Error:"+error);
    }
}
let card;
let eligible;
let isactive;
alert("here..");

initializePage();

