alert('Im new 11');
let currentPage = 1; // 当前页数
const itemsPerPage = 5; // 每次加载数量
let isLoading = false; // 是否正在加载中
let donaCount = 0; // 总甜甜圈数量
let user_ds;

// 初始化页面
async function initializePage() {
    try {
        donaCount = await getreID(); // 获取甜甜圈总数
        donaCount = Number(donaCount); // 确保是数字
        //alert('donaCount:' + donaCount);
        if (donaCount > 0) {
            await loadMoreDonaBoxes(); // 加载第一批 Dona_box
            user_ds = await getHoldertoLowercase();
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
               //await createDonaBox(dona, i); 
               alert('got dona');
            } else {
                alert('no dona now!');
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

