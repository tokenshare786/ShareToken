let currentPage = 1; // 当前页数
const itemsPerPage = 5; // 每次加载数量
let isLoading = false; // 是否正在加载中
let burgerCount = 0; // 总甜甜圈数量
let userAddress;
// 初始化页面
async function initializePage() {
    try {
        burgerCount = await getreID(); // 获取甜甜圈总数
        burgerCount = Number(burgerCount); // 确保是数字
        if (burgerCount > 0) {
            await loadMoreDonaBoxes(); // 加载第一批 Dona_box
            userAddress = await getHoldertoLowercase();
        } else {
            alert("目前没有甜甜圈 ><");
        }
    } catch (error) {
        alert("initial Error: " + error);
    }
}

// 加载更多 Dona_box
async function loadMoreDonaBoxes() {
    if (isLoading || currentPage > Math.ceil(burgerCount / itemsPerPage)) return;

    isLoading = true;
    document.getElementById('loading').style.display = 'block';

    const start = (currentPage - 1) * itemsPerPage + 1; // 起始 re_id
    const end = Math.min(currentPage * itemsPerPage, burgerCount); // 结束 re_id

    for (let i = start; i <= end; i++) {
        try {
            const re = await getSpecificDN(i); // 获取数据
            if (re) {
                createDonaBox(re, i); // 创建 Dona_box 并添加到页面
            }
        } catch (error) {
            console.error(`Error loading Dona_box ${i}:`, error);
        }
    }

    currentPage++;
    isLoading = false;
    document.getElementById('loading').style.display = 'none';
}

// 创建 Dona_box 的 DOM 元素
function createDonaBox(re, re_id) {
    const container = document.getElementById('dona-container');

    const card = document.createElement('div');
    card.className = 'dona-box'; // 添加样式类

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
            <div id="desc-container">
                <span id="short-desc">${shortDesc}</span>
                <span id="ellipsis">&nbsp..</span>
                <span id="toggle-link" class="css_back" style="position:relative;top:5px;left:3px">全文</span>   
            </div>   
            <p id="remaining-desc" style="display: none;">${remainingDesc}</p>
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
            <p class="css_back" onclick="open_edit()" id="editable">Edit</p>
            <p class="css_back" style="margin-left:auto" onclick="claimDN(${re_id})" id="take">Take</p> <!-- 传递 re_id -->
        </span>
    `;
    container.appendChild(card);
    alert('updated 11');
    // 显示完整描述逻辑
    // 初始化縮略文本    
    //document.getElementById("short-desc").textContent = shortDesc;  
    // 顯示完整描述邏輯
    const toggleLink = card.querySelector('#toggle-link');
    const remainingDescElement = card.querySelector('#remaining-desc');
    const ellipsis = card.querySelector('#ellipsis');
    toggleLink.addEventListener('click', () => {
        remainingDescElement.style.display = 'inline';
        ellipsis.style.display = 'none';
        toggleLink.style.display = 'none';
    });
    if(!toolong){        
       remainingDescElement.style.display = "none";
       ellipsis.style.display = "none";
       toggleLink.style.display = "none";
    }    
    const takeElement = card.querySelector('#take');
    //if (re.isActive && await checkEgibility(re_id)) {                
    //        document.getElementById("take").style.display = "block";                
    //}else{
    //       document.getElementById("take").style.display = "invisible"; 
    //}         
    //const re_creator = re.creator.toLowerCase() ;
    //const editElement = card.querySelector('#editable');
    //if( re_creator !== userAddress){ 
    //          editElement.style.display = "invisible";
    //} else {
    //          editElement.style.display = "block";
    //}     
}

// 点击领取甜甜圈
async function claimDN(re_id) { 
    try {
        const re = await getSpecificDN(re_id);

        if (re.isActive) {
            if (await checkEgibility(re_id)) {
                claimDona(re_id); // 发送交易请求
                document.getElementById("take").style.display = "none";
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
