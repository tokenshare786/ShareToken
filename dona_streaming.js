//alert('Im new 22');
let currentPage = 1; // 当前页数
const itemsPerPage = 5; // 每次加载数量
let isLoading = false; // 是否正在加载中
let donaCount = 0; // 总甜甜圈数量

// 初始化页面
async function initializeDonaStreaming() {
  if (!_useraddress) return;
  try {
    donaCount = await getreID(); // 获取甜甜圈总数
    donaCount = Number(donaCount); // 确保是数字
    //alert('donaCount:' + donaCount);
    if (donaCount > 0) {
      await loadMoreDonaBoxes(); // 加载第一批 Dona_box
    } else {
      alert("目前没有甜甜圈 ><");
    }
  } catch (error) {
    alert("initial Error: " + error);
  }
}

//
async function loadMoreDonaBoxes() {
  if (isLoading || currentPage > Math.ceil(donaCount / itemsPerPage)) return;

  isLoading = true;
  document.getElementById('loading').style.display = 'block';

  // 確定起始和結束的 re_id
  const start = donaCount - (currentPage - 1) * itemsPerPage; // 當前頁面的最大 re_id
  const end = Math.max(donaCount - currentPage * itemsPerPage + 1, 1);// 當前頁面的最小 re_id

  for (let i = start; i >= end; i--) {
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
      alert('error:' + error);
    }
  }

  currentPage++;
  isLoading = false;
  document.getElementById('loading').style.display = 'none';
}
//
// 创建 Dona_box 的 DOM 元素
async function createDonaBox(re, re_id) {
  //alert('re_id:' + re_id);
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
                <span class="material-symbols-outlined" id='link_redir'>captive_portal</span>
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
            <div id="image-container-ds" class="image-container" onclick="claimDN(${re_id})"> 
                                  
            </div>            
        </div>
        <span class="progress" style='position:relative;top=10px'>
            <p class="css_back" onclick="open_edit(${re_id})" id="editable-ds">Edit</p>
            <p class="css_back" onclick="claimDN(${re_id})" id="take-ds">Take</p> 
            <p class="css_back" onclick="shareDona(${re_id})">Share</p> 
            <div>
            <span class="css_back" onclick="open_comment(${re_id})">Comment</span>
            <span class="css_back" id="comment_count"></span>
            </div>
            <div>
            <span class="css_back" id="like_btn">Like</span>
            <span class="css_back" id="like_count"></span>
            </div>
            <div>
            <span class="css_back" id="dislike_btn">Diss</span> 
            <span class="css_back" id="diss_count"></span>
            </div>
        </span>
    `;
  container.appendChild(card);
  //
  const linkRedir = card.querySelector('#link_redir');
  if (re.redirect != '') {
    // 添加點擊事件監聽器
    linkRedir.addEventListener("click", () => {
      //alert('re.redirect:'+re.redirect);
      // 跳轉到指定的網址
      window.location.href = re.redirect;
    });
  } else {
    linkRedir.style.display = "none";
  }
  // 顯示完整描述邏輯
  const toggleLink = card.querySelector('#toggle-link-ds');
  const remainingDescElement = card.querySelector('#remaining-desc-ds');
  const ellipsis = card.querySelector('#ellipsis-ds');
  toggleLink.addEventListener('click', () => {
    remainingDescElement.style.display = 'inline';
    ellipsis.style.display = 'none';
    toggleLink.style.display = 'none';
  });
  if (!toolong) {
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
  const re_creator = re.creator.toLowerCase();
  const editElement = card.querySelector('#editable-ds');
  if (re_creator !== _useraddress) {
    //alert(re_creator+'/'+re_id+':0');
    editElement.style.display = "none";
  } else {
    //alert(re_creator+'/'+re_id+':1');
    editElement.style.display = "block";
  }
  let contentElement;
  if (re.imgUrl.includes('youtube.com/shorts') || re.imgUrl.includes('youtube.com/watch')) {
    // 提取視頻 ID
    const videoId = new URL(re.imgUrl).pathname.split('/')[2] || new URL(re.imgUrl).searchParams.get('v');
    const embedUrl = `https://www.youtube.com/embed/${videoId}`;

    // 創建 iframe 用於嵌入 YouTube 視頻
    contentElement = document.createElement('iframe');
    contentElement.src = embedUrl;
    contentElement.width = '100%';
    contentElement.height = '200'; // 設定高度，根據需求調整
    contentElement.frameBorder = '0';
    contentElement.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    contentElement.allowFullscreen = true;
  } else {
    // 默認使用 img 顯示圖片
    contentElement = document.createElement('img');
    contentElement.src = re.imgUrl;
    contentElement.alt = 'photo';
    contentElement.style.width = '100%'; // 設置圖片寬度
    contentElement.style.height = 'auto'; // 自適應高度
  }
  //<img src="${re.imgUrl}" alt="photo"> 
  // 添加到網頁
  const imageContainer = card.querySelector('#image-container-ds');
  //imageContainer.className = 'image-container';
  imageContainer.appendChild(contentElement);
  //container.appendChild(imageContainer);
  const commentCount = card.querySelector('#comment_count');
  const likebtn = card.querySelector('#like_btn');
  const dislikebtn = card.querySelector('#dislike_btn');
  const likeCount = card.querySelector('#like_count');
  const dissCount = card.querySelector('#diss_count');

  const { countofComment, countofLike, countofDislike, likeordiss } = await getCountLikeOrDiss(re_id);


  // 更新按鈕和計數器的狀態
  updateView();

  async function updateView() {
    if (countofComment > 0) {
      commentCount.classList.remove('hidden');
      commentCount.textContent = countofComment;
    } else {
      commentCount.classList.add('hidden');
    }
    if (countofLike > 0) {
      likeCount.classList.remove('hidden');
      likeCount.textContent = countofLike;
    } else {
      likeCount.classList.add('hidden');
    }

    if (countofDislike > 0) {
      dissCount.classList.remove('hidden');
      dissCount.textContent = countofDislike;
    } else {
      dissCount.classList.add('hidden');
    }

    if (likeordiss !== 'none') {
      if (likeordiss === 'like') {
        likebtn.classList.add('active');
        likeCount.classList.add('active');
        dislikebtn.classList.remove('active');
        dissCount.classList.remove('active');
      } else if (likeordiss === 'diss') {
        dislikebtn.classList.add('active');
        dissCount.classList.add('active');
        likebtn.classList.remove('active');
        likeCount.classList.remove('active');
      }
    }
  }

  // 點擊事件處理邏輯
  likebtn.addEventListener('click', async () => {
    const likeActive = likebtn.classList.contains('active');
    await updateCountLikeOrDiss(re_id, 'like');
    if (!likeActive) {
      setActive(likebtn, likeCount, true);
      setActive(dislikebtn, dissCount, false);
    } else {
      setActive(likebtn, likeCount, false);
    }
  });

  dislikebtn.addEventListener('click', async () => {
    const dissActive = dislikebtn.classList.contains('active');
    await updateCountLikeOrDiss(re_id, 'diss');
    if (!dissActive) {
      setActive(dislikebtn, dissCount, true);
      setActive(likebtn, likeCount, false);
    } else {
      setActive(dislikebtn, dissCount, false);
    }
  });

  // 更新按鈕和計數器的狀態
  function setActive(button, counter, isActive) {
    if (isActive) {
      button.classList.add('active');
      counter.classList.remove('hidden');
      counter.classList.add('active');
      updateCount(counter, 1);
    } else {
      button.classList.remove('active');
      counter.classList.remove('active');
      updateCount(counter, -1);
    }
  }

  // 更新計數器的顯示邏輯
  function updateCount(counter, change) {
    let count = parseInt(counter.textContent, 10) || 0;
    count += change;
    if (count <= 0) {
      counter.textContent = '0';
      counter.classList.add('hidden');
    } else {
      counter.textContent = count;
      counter.classList.remove('hidden');
    }
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
    window.innerHeight + window.scrollY >= document.body.offsetHeight - 200 &&
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
//initializePage();

let dnid_edit;
async function open_edit(dnid) {
  dnid_edit = dnid;
  //alert('dnid:'+dnid);
  const dona = await getSpecificDN(dnid); // 获取数据
  const overlay = document.getElementById('edit_window');
  overlay.classList.add('show');
  document.getElementById("edit_desc").value = dona.desc;
  document.getElementById("edit_url").value = dona.imgUrl;
  document.getElementById("_redir").value = dona.redirect;
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

async function editDona() {
  // Get form data
  const dona = await getSpecificDN(dnid_edit);
  const edit_desc = document.getElementById("edit_desc").value;
  const edit_url = document.getElementById("edit_url").value;
  const edit_redir = document.getElementById("edit_redir").value;

  //alert("editDona:"+ edit_desc  + "/" +  edit_url);
  try {
    // 呼叫智能合约的 setRE 函式
    if (edit_desc != dona.desc || edit_url != dona.imgUrl) {
      await contract.methods
        .updateMyDona(
          dnid_edit,
          edit_desc,
          edit_url,
          edit_redir
        )
        .send({ from: _useraddress });
    }

    // 關閉彈跳視窗
    close_edit();
    loadMoreDonaBoxes();
  } catch (error) {
    console.error("Error:", error);
  }
}
