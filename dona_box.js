alert("Updated! 9");

initial();  

let re;
let re_id;
let burger_count;
const userAddress = await getHoldertoLowercase();
        
async function initial(){
        //alert("something.." );
try {       
        //const reid = prompt("Enter the RedEnvelope ID:");
        burger_count = await getreID();
        //alert("burger_count:"+burger_count);
        re_id = burger_count;
        //alert("re_id:"+ re_id);
        re = await getSpecificRE(burger_count);     
        await loadburgerBoxPage();  
    } catch (error) {
        console.error("Error:", error);
        alert("initial Error:"+error);
    }
}

let card;
let eligible;
let isactive;

// Load burgerBoxPage and Display a Single Result
async function loadburgerBoxPage() {
        isactive = re.isActive ;
        if(isactive){
             eligible  = await checkEgibility(re_id);
        }        
        //alert("eligible:" + eligible);
    try {    
        if (!re) {
            alert("目前沒有甜甜圈 ><");
            return;
        }
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
           //content.appendChild(row);              
            //const holder = await getHoldertoLowercase();
            const re_creator = item.creator.toLowerCase() ;
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
            re = await getSpecificRE(re_id); // 獲取下一個漢堡盒的數據

            if (re) {
                await loadburgerBoxPage(); // 加載頁面
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
            re = await getSpecificRE(re_id); // 獲取指定漢堡盒的數據

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
function open_edit() {  
      document.getElementById("edit_window").style.display = "block";  
      document.getElementById("_desc").value = re.desc;
      document.getElementById("_url").value = re.imgUrl;
}

// Close modal
function close_edit() {
      document.getElementById("edit_window").style.display = "none";
}     
             
document.getElementById("edit_form").addEventListener("submit", async (event) => {
        event.preventDefault(); // 防止表單默認提交行為
              await editDona(); // 確保執行智能合約的邏輯
});



    
