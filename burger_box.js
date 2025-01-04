alert("Haha");
initial();  

let re;
let re_id;
let burger_count;

function initial(){
        alert("Hi..What's good");
}

async function _initial(){
        alert("something...");
try {       
        //const reid = prompt("Enter the RedEnvelope ID:");
        burger_count = await getreID();
        re_id = burger_count;
        alert("re_id:"+_re_id);
        re = await getSpecificRE(burger_count);     
        //await loadburgerBoxPage(re);  
    } catch (error) {
        console.error("Error:", error);
        alert("Error:"+error);
    }
}
