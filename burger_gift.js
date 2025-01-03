_initial();  
let re;
async function _initial(){
try {
       
        //const reid = prompt("Enter the RedEnvelope ID:");
        //if (reid) {
           re = await getLastRE();
        //}
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
            <div class="new-container">
                 <h2>${web3.utils.hexToAscii(item.desc)}</h2>
                     <p class="reward-item">${startTime} & ${item.claimedAmt} / ${item.subAmt} 【${item.eligiType}】: ${item.claimCount} /  ${item.maxClaims}</p>
                     <span class="progress">
                         <p class="css_back" onclick="reset()">Back</p>
                         <p class="css_back" style="margin-left:auto" onclick="next()">Next</p>
                     <span>
            </div>
            <div class="image-container">
                  <img src="${item.imgUrl}" alt="photo">  
            </div>            
            `;
           card.innerHTML = row.innerHTML ; 
           //content.appendChild(row);           
           
    } catch (err) {
        console.error("Error loading content:", err);
        alert("Failed to display Burgerbox." + err);            
    }
}

function reset(){
       location.reload();
}

