let _useraddress;
      function copyAddress() {
          // 获取合约地址文本
          const contractAddress = "0xCdB05222c8a059a6c0e9202d62fDFb05D6B5D274";
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
                    window._useraddress = _useraddress;
                } catch (error) {
                    console.log('No accounts available');
                }
                //} else {
                //deeplink();
            }
            return _useraddress;
        }

        function deeplink() {
            // 如果瀏覽器中未檢測到電子錢包
            try {
                const blkdonaUrl = "https://tokenshare786.github.io/ShareToken/";
                //const metamaskDeepLink = `https://metamask.app.link/dapp/${encodeURIComponent(blkdonaUrl)}`;
                const metamaskDeepLink = `https://metamask.app.link/dapp/${blkdonaUrl}`;
                window.location.href = metamaskDeepLink;
            } catch (err) {
                //showToast('請用 MetaMask 瀏覽器登入！','error');
                const metamaskAppLink = "https://metamask.app.link/";
                window.location.href = metamaskAppLink; // 跳轉到 MetaMask 安裝頁
            }
        }

        async function connectWallet() {
            const holder = await getHoldertoLowercase();
            if (holder) {
                updateAccountUI(holder);
            } else {
                deeplink();
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
