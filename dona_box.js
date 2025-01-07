alert("Updated! 17");

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
             userAddress = await getHoldertoLowercase();
             await loadburgerBoxPage();
        } else {
                alert("目前沒有甜甜圈 ><");
                return;
        }            
    } catch (error) {
        alert("initial Error:" + error);
    }  
}
//alert("here..");
initializePage();

// Load burgerBoxPage and Display a Single Result
async function loadburgerBoxPage() {
        isactive = re.isActive ;
        if(isactive){
             eligible  = await checkEgibility(re_id);
        }        
        //alert("eligible:" + eligible);
    try {  
         card  = document.getElementById("card");
         //const content = document.getElementById("content");
         card.innerHTML = "";
         const row = document.createElement("div");
         row.id = "burgerbox";        
         //row.classList.add("progress");
         const startTime = new Date(Number(re.startTime) * 1000).toLocaleString();        
         row.innerHTML = `
            <div>
                     <h2>${re.desc}</h2>
                     <p class="reward-item">【${re.eligiType}】 ${startTime} & ${re.claimedAmt} / ${re.subAmt} : ${re.claimCount} / ${re.maxClaims}</p>
                     <span class="progress">
                         <p class="css_back" onclick="_back()">Back</p>                         
                         <p class="css_back" style="margin-left:auto" onclick="_next()">Next</p>
                     </span>
            </div>
            <div  class="new-container">
               <div class="image-container" onclick="claim_re()">
                  <img src="${re.imgUrl}" alt="photo">  
               </div>            
            </div>
            <span class="progress">
                         <p class="css_back" onclick="open_edit()" id="editable">Edit</p>
            </span>
            `;   
            //alert("here..");            
            card.innerHTML = row.innerHTML ;  
            const re_creator = re.creator.toLowerCase() ;
            //alert("item.creator:\n"+item.creator+"\ngetHoldertoLowercase():\n"+holder);
            if( re_creator !== userAddress){
                  //alert("any problem?");  
                  document.getElementById("editable").style.display = "none";
                  alert("you're not creator.");  
            } else {
                  alert("It's editable！");  
                  document.getElementById("editable").style.display = "block";
            }          
    } catch (err) {
        //console.error("Error loading content:", err);
        alert("Failed to display:" + err);            
    }
}



