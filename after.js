  // Import the functions you need from the SDKs you need
  //import { initializeApp } from "firebase/app";
  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
  //import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-analytics.js";
  import { getDatabase, ref, get, update, remove, push, set, child } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

// TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyBBXYWCp5OfBakqTqJ9YaEFUjoWwRxsFp8",
    authDomain: "blkdona.firebaseapp.com",
    databaseURL: "https://blkdona-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "blkdona",
    storageBucket: "blkdona.firebasestorage.app",
    messagingSenderId: "975346537680",
    appId: "1:975346537680:web:acef40c00988add3ee3ad5",
    measurementId: "G-RE8D65CLWZ"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  //const analytics = getAnalytics(app);
  // 獲取 Realtime Database 實例
  const database = getDatabase(app);

let _dnid;
let _commentid = null;
let _message='';
const contract = window.contract;
const _useraddress = window._useraddress;
const commentsPerLoad = 10;
let lastLoadedTimestamp = null;

function open_comment(dn_id,comment_id = null) {
       const overlay = document.getElementById('comment_window');
       overlay.classList.add('show');    
      _dnid = dn_id;
      _commentid = comment_id;
      _lastLoadedTimestamp = null;
      loadComments(donaId, true); 
}

// Close modal
function close_comment() {
    const overlay = document.getElementById('comment_window');
    overlay.classList.remove('show');
}

document.getElementById("comment-form").addEventListener("submit", async (event) => {
    event.preventDefault(); // 防止表單默認提交行為
    _message = document.getElementById("mycomment").value;
  if (!_message.trim()) return;
  document.getElementById('mycomment').value = '';
  loadComments(_dnid, true); // 重新加载评论
    await addComment(_dnid, _commentid, _message); // 確保執行智能合約的邏輯
});

async function addComment(dona_id, comment_id, message) {
    try {        
        const commentsRef = ref(database, `comments/${dona_id}`);
        // 添加新的留言，Firebase 會自動生成唯一的 commentId
        const newCommentRef = push(commentsRef);

        // 保存留言
        await set(newCommentRef, {        
            dona_id,   
            commentId: comment_id || null, // 如果是回覆留言，使用 comment_id,如果是對 Dona 的留言，則記為null
            _useraddress,                  //這是個全域變數
            message,
            timestamp: Date.now()
        });
        // 更新到 comment_window
        displayComment(message);
    } catch (error) {
        console.error("Error adding comment:", error);
    }
}

// 模拟从数据库加载评论
async function loadComments(donaId, isInitialLoad = false) {
  try {
    const commentsContainer = document.getElementById('comments-container');
    const noComments = document.getElementById('no-comments');

    if (isInitialLoad) {
      commentsContainer.innerHTML = ''; // 初次加载清空旧内容
    }

    // 模拟获取评论（从最近到最早）
    const comments = await getComments(donaId, commentsPerLoad, lastLoadedTimestamp);

    if (comments.length === 0 && isInitialLoad) {
      noComments.style.display = 'block'; // 显示无评论提示
      return;
    }

    noComments.style.display = 'none'; // 隐藏无评论提示

    comments.forEach((comment) => {
      const commentNode = document.createElement('div');
      commentNode.className = 'comment';
      commentNode.innerHTML = `
        <p><strong>${comment.useraddress}</strong> 于 ${new Date(comment.timestamp).toLocaleString()} 说：</p>
        <p>${comment.message}</p>
      `;
      commentsContainer.appendChild(commentNode);
    });

    // 更新最后加载的时间戳
    lastLoadedTimestamp = comments[comments.length - 1]?.timestamp || null;
  } catch (error) {
    console.error('Error loading comments:', error);
  }
}

// 示例函数：将评论显示在页面中
function displayComment(comment) {
  const commentContainer = document.getElementById("comments-container");
  const commentElement = document.createElement("div");
  commentElement.className = "comment";
  commentElement.textContent = `${comment.message} - ${new Date(comment.timestamp).toLocaleString()}`;
  commentContainer.appendChild(commentElement);
}

async function getComments(dona_id, commentsPerLoad, lastLoadedTimestamp) {
  try {
    // 获取指定 Dona ID 的评论引用
    const commentsRef = ref(database, `comments/${dona_id}`);
    const snapshot = await get(commentsRef);

    if (!snapshot.exists()) {
      return []; // 如果没有评论，返回空数组
    }

    // 将评论对象转换为数组形式
    const comments = snapshot.val();
    const commentsArray = Object.keys(comments).map((key) => ({
      id: key,
      ...comments[key],
    }));

    // 按时间戳降序排序
    commentsArray.sort((a, b) => b.timestamp - a.timestamp);

    // 过滤评论，根据 lastLoadedTimestamp 和分页限制
    const filteredComments = commentsArray.filter(
      (comment) => !lastLoadedTimestamp || comment.timestamp < lastLoadedTimestamp
    );

    // 返回符合条件的评论，最多返回 commentsPerLoad 条
    return filteredComments.slice(0, commentsPerLoad);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return [];
  }
}



// 暴露到全局作用域
window.open_comment = open_comment;
window.close_comment = close_comment;
alert('after all 36');
