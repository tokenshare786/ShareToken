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
alert('New world 1');
let _dnid;
let _commentid = null;
let _message = '';
let _lastLoadedTimestamp = null;
const commentsPerLoad = 10;
const contract = window.contract;
const _useraddress = await getHoldertoLowercase();

function open_comment(dn_id, comment_id = null) {
    const overlay = document.getElementById('comment_window');
    overlay.classList.add('show');    
    _dnid = dn_id;
    _commentid = comment_id;
    _lastLoadedTimestamp = null;
    loadComments(dn_id, true); // 初次加載留言
}

// 關閉留言視窗
function close_comment() {
    const overlay = document.getElementById('comment_window');
    overlay.classList.remove('show');
}

// 留言提交事件
document.getElementById("comment_submit").addEventListener("click", async (event) => {
    event.preventDefault(); // 防止表單默認提交行為
    _message = document.getElementById("mycomment").value;
    if (!_message.trim()) return;

    document.getElementById('mycomment').value = ''; // 清空輸入框

    // 儲存留言並更新視圖
    await addComment(_dnid, _commentid, _message);
    loadComments(_dnid, false); // 重新加載留言，不清空已經顯示的內容
});

async function addComment(dona_id, comment_id, message) {
    try {        
        const commentsRef = ref(database, `comments/${dona_id}`);
        const newCommentRef = push(commentsRef); // 自動生成新的 commentId

        // 保存留言
        await set(newCommentRef, {        
            dona_id,   
            commentId: comment_id || null, // 回覆留言使用 comment_id, 否則為 null
            _useraddress,                  // 用戶地址
            message,
            timestamp: Date.now()
        });

        console.log("留言成功！");
    } catch (error) {
        console.error("添加留言錯誤:", error);
        alert('ErrAddComment:' + error);
    }
}

// 從 Firebase 加載留言
async function loadComments(donaId, isInitialLoad = false) {
    try {
        const commentsContainer = document.getElementById('comments-container');
        const noComments = document.getElementById('no-comments');

        if (isInitialLoad) {
            commentsContainer.innerHTML = ''; // 初次加載清空舊內容
        }

        // 獲取留言
        const comments = await getComments(donaId, commentsPerLoad);

        if (comments.length === 0 && isInitialLoad) {
            noComments.style.display = 'block'; // 顯示“沒有留言”
            return;
        }

        noComments.style.display = 'none'; // 隱藏“沒有留言”

        // 顯示留言
        comments.forEach((comment) => {
            const commentNode = document.createElement('div');
            commentNode.className = 'comment';
            commentNode.innerHTML = `
                <p><strong>${comment._useraddress}</strong> 於 ${new Date(comment.timestamp).toLocaleString()} 說：</p>
                <p>${comment.message}</p>
            `;
            commentsContainer.appendChild(commentNode);
        });

        // 更新最後加載的時間戳
        _lastLoadedTimestamp = comments[comments.length - 1]?.timestamp || null;
    } catch (error) {
        console.error('加載留言錯誤:', error);
    }
}

// 獲取留言
async function getComments(dona_id, commentsPerLoad) {
    try {
        const commentsRef = ref(database, `comments/${dona_id}`);
        const snapshot = await get(commentsRef);

        if (!snapshot.exists()) {
            return []; // 沒有留言時返回空數組
        }

        const comments = snapshot.val();
        const commentsArray = Object.keys(comments).map((key) => ({
            id: key,
            ...comments[key],
        }));

        // 按時間戳降序排序
        commentsArray.sort((a, b) => b.timestamp - a.timestamp);

        // 過濾留言並返回最多 commentsPerLoad 條
        const filteredComments = commentsArray.filter(
            (comment) => !_lastLoadedTimestamp || comment.timestamp < _lastLoadedTimestamp
        );

        return filteredComments.slice(0, commentsPerLoad);
    } catch (error) {
        console.error("獲取留言錯誤:", error);
        return [];
    }
}

// 暴露到全局作用域
window.open_comment = open_comment;
window.close_comment = close_comment;

alert('after all 44');
