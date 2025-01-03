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
        // 清空之前的結果
        //resultBody.innerHTML = "";
        if (!item) {
            alert("No red envelope found.");
            //resultTable.hidden = true;
            return;
        }
         const card  = document.getElementById("card");
         //const content = document.getElementById("content");
         //card_html = card.innerHTML ;
         card.innerHTML = "";
         //card_html.style.display= "invisible";           
         const row = document.createElement("div");
         row.id = "burgerbox";        
         row.classList.add("progress");
         const startTime = new Date(Number(item.startTime) * 1000).toLocaleString();        
         row.innerHTML = `
            <div>
                 <h2>${web3.utils.hexToAscii(item.desc)}</h2>
                     <p class="reward-item">${item.claimedAmt} / ${item.subAmt}</p>
                     <p class="reward-item">${item.eligiType} : ${item.claimCount} /  ${item.maxClaims}</p>
                     <p class="reward-item">${startTime}</p>
                     <p class="css_back" onclick="reset()">Back</p>
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
       card.innerHTML = "";
       card.innerHTML = `
            <div class="progress" id="content">
               <div>
                   <h2 id="notice_ad" style="display: none;"></h2>
                   <h2 id="notice_title">AirDrop</h2>   
                   <p class="reward-item" id="linetext_1">Holder reward: 3%</p>
                   <p class="reward-item" id="linetext_2">Referal reward: 1%</p>
                </div>
                <div class="claim_button" id="claim_button">Get</div>
                <div class="re_button" id="re_button">Get</div>
             </div>
            <div class="buttons">
                 <button class="buttons button.active" id="airdrop_btn">Get Airdrop</button>
                 <button class="buttons button" id="activities_btn">Activities</button>
            </div>        
            `;
}

