_initial();  
let re;
let re_id;

async function _initial(){
try {       
        //const reid = prompt("Enter the RedEnvelope ID:");
        re_id = await getreID();
        re = await getSpecificRE(re_id);     
        await loadburgerBoxPage(re);  
    } catch (error) {
        console.error("Error:", error);
        alert("Error:"+error);
    }
}
let card;

// Load burgerBoxPage and Display a Single Result
async function loadburgerBoxPage(item) {
    try {    
        if (!item) {
            alert("No red envelope found.");
            //resultTable.hidden = true;
            return;
        }
         card  = document.getElementById("card");
         //const content = document.getElementById("content");
         //card_html = card.innerHTML ;
         card.innerHTML = "";
         //card_html.style.display= "invisible";           
         const row = document.createElement("div");
         row.id = "burgerbox";        
         //row.classList.add("progress");
         const startTime = new Date(Number(item.startTime) * 1000).toLocaleString();        
         row.innerHTML = `
            <div>
                     <h2>${web3.utils.hexToAscii(item.desc)}</h2>
                     <p class="reward-item">【${item.eligiType}】 ${startTime} & ${item.claimedAmt} / ${item.subAmt} : ${item.claimCount} / ${item.maxClaims}</p>
                     <span class="progress">
                         <p class="css_back" onclick="reset()">Back</p>
                         <p class="css_back" style="margin-left:auto" onclick="next()">Next</p>
                     <span>
            </div>
            <div  class="new-container">
               <div class="image-container" onclick="claim_re()";>
                  <img src="${item.imgUrl}" alt="photo">  
               </div>            
            </div>
            `;
           card.innerHTML = row.innerHTML ; 
           //content.appendChild(row);           
           
    } catch (err) {
        console.error("Error loading content:", err);
        alert("Failed to display Burgerbox." + err);            
    }
}
function claim_re(){   
    alert("Claiming RE.." + reid);
    claimRE(re_id);
}

function reset(){
       location.reload();
}

