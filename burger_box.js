alert("Haha");
initial();  

let re;
let re_id;
let burger_count;

async function initial(){
        alert("something...");
try {       
        //const reid = prompt("Enter the RedEnvelope ID:");
        burger_count = await getreID();
        alert("burger_count:"+burger_count);
        //
        re_id = burger_count;
        alert("re_id:"+ re_id);
        re = await getSpecificRE(burger_count);     
        //await loadburgerBoxPage(re);  
    } catch (error) {
        console.error("Error:", error);
        alert("Error:"+error);
    }
}
