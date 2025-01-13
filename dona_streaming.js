let currentPage = 1; // 當前頁數
const itemsPerPage = 5; // 每次加載數量
let isLoading = false; // 是否正在加載中
let burgerCount = 0; // 總甜甜圈數量

async function initializePage() {
    try {
        burgerCount = await getreID(); // 獲取甜甜圈總數
        if (burgerCount > 0) {
            await loadMoreDonaBoxes(); // 加載第一批 Dona_box
        } else {
            alert("目前沒有甜甜圈 ><");
        }
    } catch (error) {
        alert("initial Error:" + error);
    }
}

// 加載更多 Dona_box
async function loadMoreDonaBoxes() {
    if (isLoading || currentPage > Math.ceil(burgerCount / itemsPerPage)) return;

    isLoading = true;
    document.getElementById('loading').style.display = 'block';

    const start = (currentPage - 1) * itemsPerPage + 1; // 起始 re_id
    const end = Math.min(currentPage * itemsPerPage, burgerCount); // 結束 re_id

    for (let i = start; i <= end; i++) {
        try {
            const re = await getSpecificDN(i); // 獲取數據
            if (re) {
                createDonaBox(re); // 創建 Dona_box 並添加到頁面
            }
        } catch (error) {
            console.error(`Error loading Dona_box ${i}:`, error);
        }
    }

    currentPage++;
    isLoading = false;
    document.getElementById('loading').style.display = 'none';
}

// 創建 Dona_box 的 DOM 元素
function createDonaBox(re) {
    const container = document.getElementById('dona-container');

    const card = document.createElement('div');
    card.className = 'dona-box'; // 添加樣式類
    const startTime = new Date(Number(re.startTime) * 1000).toLocaleString();
    const shortDesc = re.desc.slice(0, 13);
    const remainingDesc = re.desc.slice(13);

card.innerHTML = `
    <div>
        <div id="desc-container">
            <span id="short-desc"></span>
            <span id="ellipsis">&nbsp..</span>
            <span id="toggle-link" class="css_back" style="position:relative;top:5px;left:3px">全文</span>   
        </div>   
        <p id="remaining-desc"></p>
        <p class="reward-item" style="text-align:center">
            【${re.eligiType}】 ${startTime} & ${re.claimedAmt} / ${re.subAmt} : ${re.claimCount} / ${re.maxClaims}
        </p>
        <span class="progress">
            <p class="css_back" onclick="_back()" id="click_back">Back</p>                         
            <p class="css_back" style="margin-left:auto" onclick="_next()" id="click_next">Next</p>
        </span>
    </div>
    <div class="new-container">
        <div class="image-container" onclick="claimDN(${re_id})"> <!-- 傳遞 re_id -->
            <img src="${re.imgUrl}" alt="photo">  
        </div>            
    </div>
    <span class="progress">
        <p class="css_back" onclick="open_edit()" id="editable">Edit</p>
        <p class="css_back" style="margin-left:auto" onclick="claimDN(${re_id})" id="take">Take</p> <!-- 傳遞 re_id -->
    </span>
`;

    // 顯示完整描述邏輯
    const toggleLink = card.querySelector('#toggle-link');
    const remainingDescElement = card.querySelector('#remaining-desc');
    const ellipsis = card.querySelector('#ellipsis');

    toggleLink.addEventListener('click', () => {
        remainingDescElement.style.display = 'inline';
        ellipsis.style.display = 'none';
        toggleLink.style.display = 'none';
    });
    container.appendChild(card);
}

async function claimDN(re_id) { 
    try {
        // 重新獲取與 re_id 對應的 `re` 數據
        const re = await getSpecificDN(re_id);

        if (re.isActive) {
            if (await checkEgibility(re_id)) {
                claimDona(re_id); // 發送交易請求
                document.getElementById("take").style.display = "none";
                showToast("送出交易，請等候..", "success");
            } else {
                showToast("唉呦！這個甜甜圈你吃不了", "error");
            }
        } else {
            showToast("這個甜甜圈沒了", "error");
        }
    } catch (error) {
        console.error("claimDN error:", error);
        showToast("操作失敗，請稍後再試！", "error");
    }
}

// 滾動事件監聽，實現無限滾動
window.addEventListener('scroll', () => {
    if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 &&
        !isLoading
    ) {
        loadMoreDonaBoxes();
    }
});

initializePage();
