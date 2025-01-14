alert('Im new 10');
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
        alert('donaCount:' + donaCount);
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

