alert("Updated! 44");
let burger_count;
let re_id;
let re;
let card;
let eligible;
let isactive;
let userAddress;

async function initializePage() {
try {   
        burger_count = await getreID();
        re_id = burger_count;
        if(re_id > 0){
             re = await getSpecificDN(re_id);
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
        } else {
                eligible=false;
        }     
        //alert("eligible:" + eligible);
    try {  
         card = document.getElementById("card");
         //const content = document.getElementById("content");
         card.innerHTML = "";
         const row = document.createElement("div");
         //row.id = "slider";        
         const startTime = new Date(Number(re.startTime) * 1000).toLocaleString();        
         row.innerHTML = `
            <div>
                     <h2>${re.desc}</h2>
                     <p class="reward-item">【${re.eligiType}】 ${startTime} & ${re.claimedAmt} / ${re.subAmt} : ${re.claimCount} / ${re.maxClaims}</p>
                     <span class="progress">
                         <p class="css_back" onclick="_back()" id="click_back">Back</p>                         
                         <p class="css_back" style="margin-left:auto" onclick="_next()" id="click_next">Next</p>
                     </span>
            </div>
            <div  class="new-container" id="slider">
               <div class="image-container" onclick="claimDN()">
                  <img src="${re.imgUrl}" alt="photo">  
               </div>            
            </div>
            <span class="progress">
                         <p class="css_back" onclick="open_edit()" id="editable">Edit</p>
                         <p class="css_back" style="margin-left:auto" onclick="claimDN()" id="take">Take</p>
            </span>
            `;   
            //alert("here..");            
         card.innerHTML = row.innerHTML ; 
         if( re_id > 1){
                document.getElementById('click_back').textContent = `Back`;         
         } else {
                document.getElementById('click_back').textContent = `Home`; 
         }                             
        if(re_id < burger_count ){
                document.getElementById("click_next").style.display = "block";
        } else {
                document.getElementById("click_next").style.display = "none";
        }
        if(eligible){
                document.getElementById("take").style.display = "block";
        } else {
                document.getElementById("take").style.display = "none";
        }
        const re_creator = re.creator.toLowerCase() ;
        if( re_creator !== userAddress){ 
                document.getElementById("editable").style.display = "none";
         } else {
                //alert("It's editable！");  
                document.getElementById("editable").style.display = "block";
         }          
    } catch (err) {
        //console.error("Error loading content:", err);
        alert("Failed to display:" + err);            
    }
}

//讓手指滑動成有有用的動作
let startX = 0; // 起始觸點
let endX = 0;   // 結束觸點

const slider = document.getElementById("slider");

slider.addEventListener("touchstart", (event) => {
    startX = event.touches[0].clientX; // 紀錄觸摸開始的 X 座標
    alert("startX:"+startX);    
});

slider.addEventListener("touchmove", (event) => {
    event.preventDefault(); // 防止默認滾動
    endX = event.touches[0].clientX; // 更新滑動過程的 X 座標
    alert("endX:"+endX); 
});

slider.addEventListener("touchend", () => {
    if (startX - endX > 20) {
        // 往左滑
        _next();
    } else if (endX - startX > 20) {
        // 往右滑
        _back();
    }
});

function claimDN(){ 
        if(isactive){
              if(eligible){
                   if(confirm("準備吃個甜甜圈：" + re_id)){            
                            claimDona(re_id); 
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
            re = await getSpecificDN(re_id); // 獲取下一個漢堡盒的數據

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
            re = await getSpecificDN(re_id); // 獲取指定漢堡盒的數據
            if (re) {
                await loadburgerBoxPage(re); // 加載頁面
            } else {
                alert("未找到對應的甜甜圈數據！");
                re_id++; // 如果數據不存在，還原 re_id
            }           
        } else {
            location.reload();
        }
    } catch (error) {
        console.error("切換甜甜圈時出現錯誤：", error);
        alert("發生錯誤，請稍後再試！");
    }
}

function open_edit() {  
      document.getElementById("edit_window").style.display = "block";  
      //alert("re:"+ re.desc + "/" +  re.imgUrl);
      document.getElementById("edit_desc").value = re.desc;             
      document.getElementById("edit_url").value = re.imgUrl;
}

// Close modal
function close_edit() {
      document.getElementById("edit_window").style.display = "none";
}           
             
document.getElementById("edit_form").addEventListener("submit", async (event) => {
        event.preventDefault(); // 防止表單默認提交行為
              await editDona(); // 確保執行智能合約的邏輯
});

async function editDona(){
        //const userAddress = getHoldertoLowercase();
        // Get form data
        const edit_desc = document.getElementById("edit_desc").value;
        const edit_url = document.getElementById("edit_url").value;
        alert("editDona:"+ edit_desc  + "/" +  re.desc);
      try{
        // 呼叫智能合约的 setRE 函式
        if( edit_desc != re.desc || edit_url != re.imgUrl){                
        await contract.methods
            .updateMyDona(
                re_id,                   
                edit_desc,
                edit_url
            )
            .send({ from: userAddress });
        }
        //
        document.getElementById("edit_form").reset();

        // 關閉彈跳視窗
        close_edit();
        re = await getSpecificDN(re_id);
        loadburgerBoxPage();
        } catch (error) {
            //console.error("Error:", error);
            alert("edit Error:" + error);        
        }     
    }
