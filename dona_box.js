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

function claim_re(){ 
        if(isactive){
              if(eligible){
                   if(confirm("準備吃個甜甜圈：" + re_id)){            
                            claimRE(re_id); 
                   } else{
                           alert("Why not?"); 
                   }  
             } else {
                         alert("這個甜甜圈你吃不了：" + re_id);
             }   
        } else {
                  alert("這個甜甜圈沒了：" + re_id);
        }          
}

async function _next() {
    try {
        if (re_id < burger_count) {
            re_id++; // 增加 re_id
            const re = await getSpecificRE(re_id); // 獲取下一個漢堡盒的數據

            if (re) {
                await loadburgerBoxPage(re); // 加載頁面
            } else {
                alert("未找到對應的甜甜圈！");
                re_id--; // 如果數據不存在，還原 re_id
            }
        } else {
            alert("後面沒有甜甜圈了！"); // 提示訊息
        }
    } catch (error) {
        //console.error("烘焙甜甜圈時出現錯誤：", error);
        alert("烘焙甜甜圈時出現怪事，稍等！");
    }
}

async function _back() {
    try {
        if (re_id > 1) {
            re_id--; // 減少 re_id
            const re = await getSpecificRE(re_id); // 獲取指定漢堡盒的數據

            if (re) {
                await loadburgerBoxPage(re); // 加載頁面
            } else {
                alert("未找到對應的甜甜圈數據！");
                re_id++; // 如果數據不存在，還原 re_id
            }
        } else {
            alert("前面沒有甜甜圈了！"); // 提示
        }
    } catch (error) {
        console.error("切換甜甜圈時出現錯誤：", error);
        alert("發生錯誤，請稍後再試！");
    }
}
