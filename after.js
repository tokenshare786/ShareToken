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

function open_comment(dn_id,comment_id = null) {
    //alert('open_comment');
    //try{
       const overlay = document.getElementById('comment_window');
       overlay.classList.add('show');    
      _dnid = dn_id;
       _commentid = comment_id;
    //}catch(err){
       //alert('openError:'+err);  
    //}    
}

// Close modal
function close_comment() {
    const overlay = document.getElementById('comment_window');
    overlay.classList.remove('show');
}

document.getElementById("comment-form").addEventListener("submit", async (event) => {
    event.preventDefault(); // 防止表單默認提交行為
    _message = document.getElementById("mycomment").value;
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

        console.log("Comment added successfully!");
    } catch (error) {
        console.error("Error adding comment:", error);
    }
}



// 暴露到全局作用域
window.open_comment = open_comment;
window.close_comment = close_comment;
alert('after all 33');
