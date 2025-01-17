  //try{
    // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
  import { getDatabase, ref, get, update, remove, push, set, child } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";
  //import app from './firebaseConfig'; // 引入 Firebase 配置
  // TODO: Add SDKs for Firebase products that you want to use
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
  // 獲取 Realtime Database 實例
  const database = getDatabase(app);
  //}catch(err){
  //  alert('err:'+err);
  //}
  //alert('New world 1');
let _dnid;
let _commentid = null;
let _message = '';
let _lastLoadedTimestamp = null;
const commentsPerLoad = 10;
const contract = window.contract;
let _useraddress;

await getUserAddress();

async function getUserAddress() {
    // 假設這是一個異步操作來獲取地址
    _useraddress = await getHoldertoLowercase();
    //alert('_useraddress:'+_useraddress);
}

function open_comment(dn_id, comment_id = null) {
    const overlay = document.getElementById('comment_window');
    overlay.classList.add('show');    
    _dnid = dn_id;
    //_commentid = comment_id;
    _lastLoadedTimestamp = null;
    loadComments(dn_id, true); // 初次加載留言
}

// 關閉留言視窗
function close_comment() {
    const overlay = document.getElementById('comment_window');
    overlay.classList.remove('show');
    //_lastLoadedTimestamp = null; //
}

// 留言提交事件
document.getElementById("comment_submit").addEventListener("click", async (event) => {
    event.preventDefault(); // 防止表單默認提交行為
    //_useraddress = await getUserAddress();
    _message = document.getElementById("mycomment").value;
    if (!_message.trim()) return;
    //if (!_useraddress) return;  
    document.getElementById('mycomment').value = ''; // 清空輸入框
    // 儲存留言並更新視圖
    await addComment(_dnid, _commentid, _message);    
});

async function addComment(dona_id, comment_id, message) {
      try {        
        const commentsRef = ref(database, `comments/${dona_id}`);
        const newCommentRef = push(commentsRef); // 自動生成新的 commentId
         
        // 保存留言
        await set(newCommentRef, {        
            dona_id,   
            commentId: comment_id || null, // 回覆留言使用 comment_id, 否則為 null
            useraddress:_useraddress,                  // 用戶地址
            message,
            timestamp: Date.now()
        });
        close_comment()
        showToast('留言成功！','success');
        loadComments(dona_id, false); // 重新加載留言，不清空已經顯示的內容
    } catch (error) {
        console.error("添加留言錯誤:", error);
        alert('ErrAddComment:' + error);
    }
}

// 從 Firebase 加載留言
async function loadComments(donaId, isInitialLoad = false) {
    try {
        const commentsContainer = document.getElementById('comments-container');
        //const noComments = document.getElementById('no-comments');

        if (isInitialLoad) {
            commentsContainer.innerHTML = ''; // 初次加載清空舊內容
        }

        // 獲取留言
        const comments = await getComments(donaId, commentsPerLoad);
        //alert('comments.length:'+comments.length);
        //if (comments.length === 0 && isInitialLoad) {
        //    noComments.style.display = 'block'; // 顯示“沒有留言”
        //    return;
        //}
        //noComments.style.display = 'none'; // 隱藏“沒有留言”

        // 顯示留言
        comments.forEach((comment) => {
            const user_add = comment.useraddress;
            const user = `${user_add.substring(0, 2)}..${user_add.slice(-4)}`;
            const commentNode = document.createElement('div');
            commentNode.className = 'comment';
            commentNode.innerHTML = `
                <p><strong>${user}</strong> / ${new Date(comment.timestamp).toLocaleString()}</p>
                <p>${comment.message}</p>
            `;
            commentsContainer.appendChild(commentNode);
      });
      commentsContainer.scrollTop = 0;
      //alert('commentsContainer:'+commentsContainer.innerHTML);
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
        return commentsArray.slice(0, commentsPerLoad);

        // 過濾留言並返回最多 commentsPerLoad 條
        //const filteredComments = commentsArray.filter(
        //    (comment) => !_lastLoadedTimestamp || comment.timestamp < _lastLoadedTimestamp
        //);

        //return filteredComments.slice(0, commentsPerLoad);
    } catch (error) {
        console.error("獲取留言錯誤:", error);
        return [];
    }
}

async function addLikeOrDislike(dona_id, comment_id=null, action = null) {
    try {
        // 確定操作的是貼文還是留言
        const targetRef = comment_id
            ? ref(database, `comments/${dona_id}/${comment_id}/likes/${_useraddress}`)
            : ref(database, `dona/${donaId}/likes/${_useraddress}`);
        alert('dona_id:'+dona_id);
        // 檢查用戶是否已經表達過讚或倒讚
        const snapshot = await get(targetRef);
        
        // 如果用戶已經點過讚或倒讚
        if (snapshot.exists()) {
            const currentStatus = snapshot.val();
            
            // 取消讚或倒讚
            if (action === null) {
                // 移除用戶的點讚或倒讚
                await remove(targetRef);
                console.log('Like or Dislike removed successfully!');
            } else if (currentStatus !== action) {
                // 如果當前狀態與用戶想要操作的不同，則更新為新的狀態
                await set(targetRef, action);
                console.log(`${action === 'like' ? 'Like' : 'Dislike'} updated successfully!`);
            } else {
                console.log(`You already expressed ${action === 'like' ? 'like' : 'dislike'}.`);
            }
        } else {
            // 如果用戶未曾點過，設置為新選擇的狀態
            if (action !== null) {
                await set(targetRef, action);
                console.log(`${action === 'like' ? 'Like' : 'Dislike'} added successfully!`);
            } else {
                console.log('No action taken.');
            }
        }
    } catch (error) {
        console.error("Error adding like or dislike:", error);
    }
}


// 暴露到全局作用域
window.open_comment = open_comment;
window.close_comment = close_comment;
window.addLikeOrDislike = addLikeOrDislike;

alert('after all 64');
