 //alert("Updated! 47");
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
         //
         const desc = re.desc; // 假設這是描述文本
         const maxLength = 13; // 最大顯示字數
         let toolong = false;
         if (desc.length > maxLength) {
             toolong = true;
         } 
         const shortDesc = desc.slice(0, maxLength);
         const remainingDesc = desc.slice(maxLength);         
         //<h2>${truncatedDesc}</h2>
         row.innerHTML = `
            <div>
                     <div id="desc-container">
                         <span id="short-desc"></span>
                         <span id="ellipsis">..</span>
                         <span id="toggle-link" class="css_back" style="position:relative; top: 20px">全文</span>   
                    </div>   
                     <p id="remaining-desc"></p>
                     <p class="reward-item">【${re.eligiType}】 ${startTime} & ${re.claimedAmt} / ${re.subAmt} : ${re.claimCount} / ${re.maxClaims}</p>
                     <span class="progress">
                         <p class="css_back" onclick="_back()" id="click_back">Back</p>                         
                         <p class="css_back" style="margin-left:auto" onclick="_next()" id="click_next">Next</p>
                     </span>
            </div>
            <div  class="new-container">
               <div class="image-container" onclick="claimDN()">
                  <img src="${re.imgUrl}" alt="photo">  
               </div>            
            </div>
            <span class="progress">
                         <p class="css_back" onclick="open_edit()" id="editable">Edit</p>
                         <p class="css_back" style="margin-left:auto" onclick="claimDN()" id="take">Take</p>
            </span>
            `;       
         card.innerHTML = row.innerHTML ; 
         //
   // 初始化縮略文本
    document.getElementById("short-desc").textContent = shortDesc;  
    const remainingDescElement = document.getElementById("remaining-desc");
    const ellipsis = document.getElementById("ellipsis");
    const toggleLink = document.getElementById("toggle-link");
    if(toolong){
        remainingDescElement.textContent = remainingDesc;       
    } else {
       remainingDescElement.style.display = "none";
       ellipsis.style.display = "none";
       toggleLink.style.display = "none";
    }
    toggleLink.addEventListener("click", function () {
         remainingDescElement.style.display = "inline";
         ellipsis.style.display = "none";
         toggleLink.style.display = "none"; // 隱藏 "詳看全文"
    });
         //
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



function claimDN(){ 
        if(isactive){
              if(eligible){
                   //if(confirm("準備吃個甜甜圈：" + re_id)){            
                            claimDona(re_id); 
                            document.getElementById("take").style.display = "none";
                            showToast("送出交易，請等候..", "success");
                   //} else{
                           //alert("Why not?"); 
                   //}  
             } else {
                            //alert("這個甜甜圈你吃不了：" + re_id);
                            showToast("唉呦！這個甜甜圈你吃不了", "error");
             }   
        } else {
                  //alert("這個甜甜圈沒了：" + re_id);
                  showToast("這個甜甜圈沒了", "error");
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
        //alert("烘焙甜甜圈時出現怪事，稍等！");
        showToast("甜甜圈出怪招，稍等！", "error");
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
      //document.getElementById("edit_window").style.display = "block"; 
      const overlay = document.getElementById('edit_window');
      overlay.classList.add('show');
      //alert("re:"+ re.desc + "/" +  re.imgUrl);
      document.getElementById("edit_desc").value = re.desc;             
      document.getElementById("edit_url").value = re.imgUrl;
}

// Close modal
function close_edit() {
      //document.getElementById("edit_window").style.display = "none";
      const overlay = document.getElementById('edit_window');
      overlay.classList.remove('show'); 
}           
             
document.getElementById("form_edit").addEventListener("submit", async (event) => {
        event.preventDefault(); // 防止表單默認提交行為
              //alert("What's up?");
              await editDona(); // 確保執行智能合約的邏輯
});

async function editDona(){
        // Get form data
        const edit_desc = document.getElementById("edit_desc").value;
        const edit_url = document.getElementById("edit_url").value;       
        //alert("editDona:"+ edit_desc  + "/" +  edit_url);
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
        //document.getElementById("edit_form").reset();

        // 關閉彈跳視窗
        close_edit();
        re = await getSpecificDN(re_id);
        loadburgerBoxPage();
        } catch (error) {
            console.error("Error:", error);
        }     
    }
