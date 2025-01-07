alert("Updated! 29");
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
      //alert("re:"+ re.desc + "/" +  re.imgUrl);
      const get_desc = document.getElementById("_desc");
        if(get_desc){
                get_desc.value = re.desc;
        } else {
              alert("get_desc:null");  
        }              
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

async function editDona(){
        //const userAddress = getHoldertoLowercase();
        // Get form data
        const _desc = document.getElementById("_desc").value;
        const _url = document.getElementById("_url").value;
        alert("editDona:"+ _desc + "/" +  re.desc);
      try{
        // 呼叫智能合约的 setRE 函式
        if( _desc != re.desc){                
        await contract.methods
            .setRE(
                re_id,                   
                true,
                _desc
            )
            .send({ from: userAddress });
        }
        //
        if( _url != re.imgUrl){  
        //isdesc= false;
        await contract.methods
            .setRE(
                re_id,                   
                false,
                _url
            )
            .send({ from: userAddress });
        }
        //
        document.getElementById("edit_form").reset();

        // 關閉彈跳視窗
        close_edit();
        re = await getSpecificRE(re_id);
        loadburgerBoxPage();
        } catch (error) {
            //console.error("Error:", error);
            alert("edit Error:" + error);        
        }     
    }
