alert('Im new 3');
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
            await loadMoreDonaBoxes(); // 加载第一批 Dona_box
            userAddress = await getHoldertoLowercase();
        } else {
            alert("目前没有甜甜圈 ><");
        }
    } catch (error) {
        alert("initial Error: " + error);
    }
}
async function loadMoreDonaBoxes() {
    if (isLoading || currentPage > Math.ceil(burgerCount / itemsPerPage)) return;

    isLoading = true;
    document.getElementById('loading').style.display = 'block';

    const start = (currentPage - 1) * itemsPerPage + 1; // 起始 re_id
    const end = Math.min(currentPage * itemsPerPage, burgerCount); // 结束 re_id

    for (let i = end ; i >= start ; i--) {
        try {
            const dona = await getSpecificDN(i); // 获取数据
            if (dona) {
               //await createDonaBox(dona, i); 
               alert('got dona');
            }
        } catch (error) {
            console.error(`Error loading Dona_box ${i}:`, error);
        }
    }

    currentPage++;
    isLoading = false;
    document.getElementById('loading').style.display = 'none';
}
