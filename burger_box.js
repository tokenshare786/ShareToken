//alert("no Hahaha");
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
                  alert("any problem?");  
                  document.getElementById("editable").style.display = "none";
                  alert("you're not creator.");  
            } else {
                  alert("It's editable！");  
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
<div class="modal-overlay" id="edit_window">
    <div class="modal" id="modal">
        <h2>甜甜圈有點狀況，我喬一下</h2>
        <form id="edit_form">            
            <div class="form-group">
                <label for="_desc">那些年，關於我的甜甜圈</label>
                <input type="text" id="_desc" name="edit_desc" required>
            </div>
            <div class="form-group">
                <label for="_url">請貼上圖片連結網址</label>
                <input type="text" id="_url" name="edit_url" required>
            </div>
            <div class="_buttons">
                <button type="button" class="cancel" onclick="close_edit()">取消</button>
                <button type="submit" class="confirm">送出</button>
            </div>
        </form>
    </div>
</div>   
    function open_edit() {  
        document.getElementById("edit_window").style.display = "block";  
        const re = await getSpecificRE(re_id); 
        document.getElementById("_desc").value = reredEnvelopeInfo.desc;
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
        const userAddress = getHoldertoLowercase();
        // Get form data
        const desc = document.getElementById("edit_desc").value;
        const url = document.getElementById("edit_url").value;
        const isdesc = true;
      try{
        // 呼叫智能合约的 setRE 函式
        if(desc){                
        const receipt = await contract.methods
            .setRE(
                re_id,                   
                isdesc,
                desc
            )
            .send({ from: userAddress });
        if(url){  
        isdesc= false;
        const receipt = await contract.methods
            .setRE(
                re_id,                   
                isdesc,
                url
            )
            .send({ from: userAddress });
        //
        document.getElementById("edit_form").reset();

        // 關閉彈跳視窗
        close_edit();
        const item = await getSpecificRE(re_id);
        loadburgerBoxPage(item);
        } catch (error) {
            console.error("Error:", error);
            alert("edit Error："+ error);        
        }     
    }    
</script>
