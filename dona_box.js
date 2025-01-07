alert("Wa ha!");

initial();  

//let re;
let re_id;
let burger_count;

async function initial(){
        //alert("something.." );
try {       
        //const reid = prompt("Enter the RedEnvelope ID:");
        burger_count = await getreID();
        //alert("burger_count:"+burger_count);
        re_id = burger_count;
        //alert("re_id:"+ re_id);
        const re = await getSpecificRE(burger_count);     
        await loadburgerBoxPage(re);  
    } catch (error) {
        console.error("Error:", error);
        alert("initial Error:"+error);
    }
}

let card;
let eligible;
let isactive;

// Load burgerBoxPage and Display a Single Result
async function loadburgerBoxPage(item) {
        isactive = item.isActive ;
        if(isactive){
             eligible  = await checkEgibility(re_id);
        }        
        //alert("eligible:" + eligible);
    try {    
        if (!item) {
            alert("目前沒有甜甜圈 ><");
            return;
        }
         card  = document.getElementById("card");
         //const content = document.getElementById("content");
         card.innerHTML = "";
         const row = document.createElement("div");
         row.id = "burgerbox";        
         //row.classList.add("progress");
         const startTime = new Date(Number(item.startTime) * 1000).toLocaleString();        
         row.innerHTML = `
            <div>
                     <h2>${item.desc}</h2>
                     <p class="reward-item">【${item.eligiType}】 ${startTime} & ${item.claimedAmt} / ${item.subAmt} : ${item.claimCount} / ${item.maxClaims}</p>
                     <span class="progress">
                         <p class="css_back" onclick="_back()">Back</p>                         
                         <p class="css_back" style="margin-left:auto" onclick="_next()">Next</p>
                     <span>
            </div>
            <div  class="new-container">
               <div class="image-container" onclick="claim_re()">
                  <img src="${item.imgUrl}" alt="photo">  
               </div>            
            </div>
            <div class="css_back" onclick="open_edit()" style="margin-bottom:10px" id="editable">Edit</div>
            `;   
            //alert("here..");            
           card.innerHTML = row.innerHTML ; 
           //content.appendChild(row);              
            const holder = await getHoldertoLowercase();
            const re_creator = item.creator.toLowerCase() ;
            //alert("item.creator:\n"+item.creator+"\ngetHoldertoLowercase():\n"+holder);
            if( re_creator !== holder){
                  //alert("any problem?");  
                  document.getElementById("editable").style.display = "none";
                  alert("you're not creator.");  
            } else {
                  alert("It's editable！");  
                  document.getElementById("editable").style.display = "none";

            }          
    } catch (err) {
        console.error("Error loading content:", err);
        alert("Failed to display Burgerbox." + err);            
    }
}
