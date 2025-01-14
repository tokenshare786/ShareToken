alert('Im new 2');
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
        if (burgerCount > 0) {
            //await loadMoreDonaBoxes(); // 加载第一批 Dona_box
            userAddress = await getHoldertoLowercase();
        } else {
            alert("目前没有甜甜圈 ><");
        }
    } catch (error) {
        alert("initial Error: " + error);
    }
}
