let _useraddress;     

     function copyAddress() {
          // 获取合约地址文本
          const contractAddress = "0x8028d3D1516080566c57655c21b5628eC7550DE9";
          navigator.clipboard.writeText(contractAddress)
              .then(() => {
                  const message = document.getElementById("copyMessage");
                  message.style.display = "block";
                  setTimeout(() => {
                      message.style.display = "none";
                  }, 2000);
              })
              .catch((err) => {
                  console.error("copy failed:", err);
              });
      }
      // 取得推薦碼    
      function getParameterByName(name, url) {
            if (!url) url = window.location.href;
            name = name.replace(/[\[\]]/g, '\\$&');
            var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
                results = regex.exec(url);
            if (!results) return '';
            if (!results[2]) return '';
            return decodeURIComponent(results[2].replace(/\+/g, ' '));
      }
      async function getHoldertoLowercase() {
            //var holder;
            if (typeof window.ethereum !== 'undefined') {
                try {
                    // Connect Wallet
                    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                    _useraddress = accounts[0].toLowerCase();
                    //window._useraddress = _useraddress;
                } catch (error) {
                    console.log('No accounts available');
                }
                //} else {
                //deeplink();
            }
            return _useraddress;
        }
        window.getHoldertoLowercase = getHoldertoLowercase;

        function deeplink(wallet) {
            // 如果瀏覽器中未檢測到電子錢包
            try {

                const blkdonaUrl = window.location.href;
                const urlObj = new URL(blkdonaUrl);
                // 拆分出主域名和查詢參數
                const baseUrl = urlObj.origin + urlObj.pathname; // 主域名 + 路徑
                const queryParams = urlObj.search; // 查詢參數
                if(wallet=='metamask'){
                    // 構建 MetaMask 深度鏈接
                const metamaskDeepLink = `https://metamask.app.link/dapp/${baseUrl}${queryParams}`;          
                window.location.href = metamaskDeepLink;
                } else if (wallet=='tokenpocket'){
                    //alert('hey!');
                    const chain = "BSC"; // 或 ETH, BSC, 等其他鏈
                    const source = "BLKDONA";
                    const params = {
                        url: blkdonaUrl,
                        chain: chain, 
                        source: source 
                    };
                    //window.location.href = ‘tpdapp://open?params=’+encode(params)
                    window.location.href = 'tpdapp://open?params=' + encodeURIComponent(JSON.stringify(params));
                    //openInTokenPocket(blkdonaUrl, chain, source);
                } 
                
            } catch (err) {
                //showToast('請用 MetaMask 瀏覽器登入！','error');
                alert( '請下載 MetaMask，並使用其內建瀏覽器登入！' );
                const metamaskAppLink = "https://metamask.app.link/";                
                window.location.href = metamaskAppLink; // 跳轉到 MetaMask 安裝頁
            }
        }

        function openInTokenPocket(dappUrl, chain, source) {
            try {
                // 構建參數對象
                const params = {
                    url: dappUrl,       // 目標 DApp 網址
                    chain: chain,       // 區塊鏈網絡（例如 EOS, ETH, BSC）
                    source: source      // 來源標識，自定義
                };
        
                // 將參數對象轉換為 JSON 並進行 URL 編碼
                const encodedParams = encodeURIComponent(JSON.stringify(params));
        
                // 構建 TokenPocket 深度連結
                const tokenPocketDeepLink = `tpdapp://open?params=${encodedParams}`;
        
                // 重定向到 TokenPocket
                window.location.href = tokenPocketDeepLink;
            } catch (error) {
                console.error("無法打開 TokenPocket：", error);
                alert("發生錯誤，請確保您已安裝 TokenPocket！");
            }
        }     
               

        // 監聽帳號變化
        ethereum.on('accountsChanged', (accounts) => {
            if (accounts.length > 0) {
                location.reload();
                //console.log('Account changed:', accounts[0]);
                //ready_togo(accounts[0]);
            } else {
                console.log('No accounts available');
            }
        });
        // 更新頁面上的帳號顯示
        function updateAccountUI(account) {
            const walletButton = document.getElementById('walletButton');
            walletButton.textContent = `${account.substring(0, 2)}..${account.slice(-4)}`;
            //try {
                //const script = document.createElement("script");
                //script.src = "./dona_streaming.js";
                //script.id = 'dona_streaming';
                //document.body.appendChild(script);                
            //} catch (err) {
                //console.error("Error loading content:", err);                
            //}
        }  

        //const s_dnid = getParameterByName("dnid"); // 获取 dnid
        //const s_linkcode = getParameterByName("linkcode"); // 获取 linkcode  

        //function process_share() {
            //const params = new URLSearchParams(window.location.search);
            
            //if (s_dnid == 2) {
                //try {
                    // 假设 getSpecificDN 是一个异步函数，用于获取特定 dnid 的内容
                    //const dona = await getSpecificDN(dnid);
          
                    // 确保描述文本存在
                    //const desc = dona.desc || "BLKDONA召換任務執行者"; // 默认描述
                    //const maxLength = 13; // 最大显示字数
                    //const shortDesc = desc.slice(0, maxLength); // 截取前13个字符
                    //const remainingDesc = desc.slice(maxLength); // 剩余部分
          
                    // 判断内容是否为视频
                    //const isVideo = dona.imgUrl.includes("youtube.com") || dona.imgUrl.includes("youtube.com/watch");
                    //const ogType = isVideo ? "video" : "image"; // 根据内容类型设置 og:type
          
                    // 动态设置 Open Graph 标签内容
                    //document.title = "BLKDONA Share"; // 设置页面标题
                    //document.getElementById("og-title").setAttribute("content", "BLKDONA撸空投");
                    //document.getElementById("og-description").setAttribute(
                    //    "content", "如果天上掉下來的不只是餡餅，咱是不是該好好來研究一下？#加密貨幣#撸空投..."
                    //);
                    //const thumbnailUrl = `https://img.youtube.com/vi/sOc-bn4avX0/maxresdefault.jpg`;
                    //document.getElementById("og-image").setAttribute(
                    //    "content", thumbnailUrl
                    //);
                    //const videoId = videoUrl.split('v=')[1].split('&')[0];
                    // 生成縮略圖的 URL    
                    //document.getElementById("og-url").setAttribute(
                    //    "content",`https://blkdona.web.app/?linkcode=${s_linkcode}&dnid=2`
                    //);
                    //document.getElementById("og:type").setAttribute("content", "video");
                //} catch (error) {
                //    console.error("Error fetching dona data:", error);
                //}
            //} else {
            //    console.warn("No dnid parameter provided.");
            //}
          //}
