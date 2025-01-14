//alert('Im new 14');
let currentPage = 1; // 当前页数
const itemsPerPage = 5; // 每次加载数量
let isLoading = false; // 是否正在加载中
let donaCount = 0; // 总甜甜圈数量
//let user_ds;

// 初始化页面
async function initializePage() {
    try {
        donaCount = await getreID(); // 获取甜甜圈总数
        donaCount = Number(donaCount); // 确保是数字
        //alert('donaCount:' + donaCount);
        if (donaCount > 0) {
            await loadMoreDonaBoxes(); // 加载第一批 Dona_box
            //user_ds = await getHoldertoLowercase();
            //alert('user_ds:'+user_ds);
        } else {
            alert("目前没有甜甜圈 ><");
        }
    } catch (error) {
        alert("initial Error: " + error);
    }
}

//
async function loadMoreDonaBoxes() {
    if (isLoading || currentPage > Math.ceil( donaCount / itemsPerPage)) return;

    isLoading = true;
    document.getElementById('loading').style.display = 'block';

    const start = (currentPage - 1) * itemsPerPage + 1; // 起始 re_id
    const end = Math.min(currentPage * itemsPerPage, donaCount ); // 结束 re_id

    for (let i = end ; i >= start ; i--) {
        try {
            const dona = await getSpecificDN(i); // 获取数据
            if (dona) {
               await createDonaBox(dona, i); 
               //alert('got dona');
            } else {
               //alert('no dona now!');
            }           
        } catch (error) {
            console.error(`Error loading Dona_box ${i}:`, error);
            alert('error:'+error);
        }
    }

    currentPage++;
    isLoading = false;
    document.getElementById('loading').style.display = 'none';
}
//
// 创建 Dona_box 的 DOM 元素
async function createDonaBox(re, re_id) {
    const container = document.getElementById('dona-container');
    const card = document.createElement('div');
    card.className = 'dona-streaming'; // 添加样式类

    const startTime = new Date(Number(re.startTime) * 1000).toLocaleString();
    const desc = re.desc; // 假設這是描述文本
    const maxLength = 13; // 最大顯示字數
    let toolong = false;
    if (desc.length > maxLength) {
             toolong = true;
    } 
    const shortDesc = desc.slice(0, maxLength);
    const remainingDesc = desc.slice(maxLength);
    card.innerHTML = `
        <div>
            <div id="desc-container-ds" class="desc-container">
                <span class="short-desc">${shortDesc}</span>
                <span id="ellipsis-ds" style="position:relative;top:10px;left:2px">&nbsp..</span>
                <span id="toggle-link-ds" class="css_back" style="position:relative;top:15px;left:3px">全文</span>   
            </div>   
            <p id="remaining-desc-ds" class="remaining-desc">${remainingDesc}</p>
            <p class="reward-item" style="text-align:center">
                【${re.eligiType}】 ${startTime} & ${re.claimedAmt} / ${re.subAmt} : ${re.claimCount} / ${re.maxClaims}
            </p>            
        </div>
        <div class="new-container" style="position:relative;top:7px">
            <div class="image-container" onclick="claimDN(${re_id})"> 
                <img src="${re.imgUrl}" alt="photo">                  
            </div>            
        </div>
        <span class="progress">
            <p class="css_back" onclick="open_edit()" id="editable-ds">Edit</p>
            <p class="css_back" onclick="shareDona(${re_id})">Share</p>
            <p class="css_back" onclick="claimDN(${re_id})" id="take-ds">Take</p> 
        </span>
    `;
    container.appendChild(card);

    // 显示完整描述逻辑
    // 初始化縮略文本    
    //document.getElementById("short-desc").textContent = shortDesc;  
    // 顯示完整描述邏輯
    const toggleLink = card.querySelector('#toggle-link-ds');
    const remainingDescElement = card.querySelector('#remaining-desc-ds');
    const ellipsis = card.querySelector('#ellipsis-ds');
    toggleLink.addEventListener('click', () => {
        remainingDescElement.style.display = 'inline';
        ellipsis.style.display = 'none';
        toggleLink.style.display = 'none';
    });
    if(!toolong){        
       //remainingDescElement.style.display = "none";
       ellipsis.style.display = "none";
       toggleLink.style.display = "none";
    }   
 
    const takeElement = card.querySelector('#take-ds');
    const eligible = await checkEgibility(re_id);
    if (re.isActive && eligible) {           
             takeElement.style.display = "block";                
    } else {
             takeElement.style.display = "none"; 
    }         
    const re_creator = re.creator.toLowerCase() ;
    const editElement = card.querySelector('#editable-ds');
    if( re_creator !== _useraddress){ 
              //alert(re_creator+'/'+re_id+':0');
              editElement.style.display = "none"; 
    } else {
              //alert(re_creator+'/'+re_id+':1');
              editElement.style.display = "block";
    }     
}

// 点击领取甜甜圈
async function claimDN(re_id) { 
    try {
        const re = await getSpecificDN(re_id);
        if (re.isActive) {
            if (await checkEgibility(re_id)) {
                claimDona(re_id); // 发送交易请求
                document.getElementById("take-ds").style.display = "none";
                showToast("送出交易，请稍候..", "success");
            } else {
                showToast("唉呦！这个甜甜圈你吃不了", "error");
            }
        } else {
            showToast("这个甜甜圈没了", "error");
        }
    } catch (error) {
        console.error("claimDN error:", error);
        showToast("操作失败，请稍后再试！", "error");
    }
}

// 滚动事件监听，实现无限滚动
window.addEventListener('scroll', debounce(() => {
    if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 &&
        !isLoading
    ) {
        loadMoreDonaBoxes();
    }
}, 200));

// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// 初始化页面
initializePage();

