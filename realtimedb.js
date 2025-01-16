// main.js 或其他檔案
import app from './firebaseConfig'; // 引入 Firebase 配置

import { getDatabase, ref, get, update, remove, push, set, child } from "firebase/database";

// 獲取 Realtime Database 實例
const database = getDatabase(app);

async function updateUserProfile(nickname, description, avatarUrl, socialLinks) {
    try {
        // 參考 Firebase 資料庫中的用戶資料
        const userRef = ref(database, `users/${_useraddress}`);

        // 準備要更新的資料
        const updates = {
            nickname: nickname,
            description: description,
            avatarUrl: avatarUrl,
            socialLinks: socialLinks
        };

        // 更新用戶資料
        await update(userRef, updates);

        console.log("User profile updated successfully!");
    } catch (error) {
        console.error("Error updating user profile:", error);
    }
}

async function getUserProfile(user_id) {
    try {
        // 參考 Firebase 資料庫中的用戶資料
        const userRef = ref(database, `users/${user_id}`);
        
        // 獲取用戶資料
        const snapshot = await get(userRef);
        
        // 檢查資料是否存在
        if (snapshot.exists()) {
            // 返回用戶資料
            return snapshot.val();
        } else {
            console.log("User not found!");
            return null; // 用戶不存在
        }
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return null; // 發生錯誤時返回 null
    }
}

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

async function addLikeOrDislike(dona_id, comment_id, action = null) {
    try {
        // 確定操作的是貼文還是留言
        const targetRef = comment_id
            ? ref(database, `comments/${dona_id}/${comment_id}/likes/${_useraddress}`)
            : ref(database, `dona/${donaId}/likes/${_useraddress}`);
        
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

async function getPostOrCommentStats(dona_id, comment_id = null) {
    try {
        let likeCount = 0;
        let dislikeCount = 0;
        let commentCount = 0;

        if (comment_id) {
            // 計算留言的統計數據
            const commentRef = ref(database, `comments/${dona_id}/${comment_id}`);

            // 獲取該留言的所有“讚”或“倒讚”
            const likesSnapshot = await get(child(commentRef, 'likes'));
            likesSnapshot.forEach(like => {
                if (like.val() === 'like') {
                    likeCount += 1;
                } else if (like.val() === 'dislike') {
                    dislikeCount += 1;
                }
            });

            // 獲取該留言的回覆數量
            const repliesSnapshot = await get(child(commentRef, 'replies'));
            commentCount = repliesSnapshot.numChildren(); // 返回該留言的回覆數量

        } else {
            // 計算貼文的統計數據
            const postRef = ref(database, `dona/${dona_id}`);
            
            // 獲取該貼文的所有“讚”或“倒讚”
            const likesSnapshot = await get(child(postRef, 'likes'));
            likesSnapshot.forEach(like => {
                if (like.val() === 'like') {
                    likeCount += 1;
                } else if (like.val() === 'dislike') {
                    dislikeCount += 1;
                }
            });

            // 獲取該貼文的留言數量
            const commentsSnapshot = await get(child(postRef, 'comments'));
            commentCount = commentsSnapshot.numChildren(); // 返回該貼文的留言數量
        }

        // 返回統計結果
        return {
            likeCount,
            dislikeCount,
            commentCount
        };

    } catch (error) {
        console.error("Error getting stats:", error);
    }
}
let _dnid;
let _commentid = null;
let _message='';
function open_comment(dn_id,comment_id = null) {
    const overlay = document.getElementById('comment_window');
    overlay.classList.add('show');
    _dnid = dn_id;
    _commentid = comment_id;
}

// Close modal
function closeModal() {
    const overlay = document.getElementById('comment_window');
    overlay.classList.remove('show');
}

document.getElementById("comment-form").addEventListener("submit", async (event) => {
    event.preventDefault(); // 防止表單默認提交行為
    _message = document.getElementById("mycomment").value;
    await addComment(_dnid, _commentid, _useraddress, _message); // 確保執行智能合約的邏輯
});
