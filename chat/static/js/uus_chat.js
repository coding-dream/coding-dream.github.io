let conversation_id = "";
let message_id = "";
let selectedOption = "";

// 在新页面中从URL中取出数据
function getQueryString(name) {
    var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if(r!=null) return decodeURIComponent(r[2]); return null;
}

document.addEventListener('DOMContentLoaded', function() {
    // 创建一个新的会话id
    conversation_id = Date.now();

    let cid = getQueryString('cid');
    let title = getQueryString('title');
    let content = getQueryString('content');

    // 设置到页面
    document.getElementById('cid').innerHTML = cid;
    document.getElementById('title').innerHTML = title;
    document.getElementById('content').innerHTML = content;

    // 读取用户信息
    var user_info = JSON.parse(localStorage.getItem('user_info'));
    if (user_info == null) {
        window.location.href = 'register.html';
    }
    // 回车按键的监听
    document.getElementById('input_message').addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            console.log("Enter");
        }
    });

    // 监听下拉菜单的点击事件

    document.querySelectorAll('.dropdown-item').forEach(function(item) {
      item.addEventListener('click', function(e) {
          e.preventDefault();
          selectedOption = this.getAttribute('data-value');
          var text = this.innerHTML;
          document.getElementById('dropdownMenuButton').innerHTML = text;
      });
    });

    // 默认选中第一个值
    this.documentElement.querySelector('.dropdown-item').click();

    document.getElementById('send_button').addEventListener("click", () => {
        if (document.getElementById("input_message").value.trim() === "") {
            toast("输入不能为空");
            return;
        }
        startStream();
        
        // 清空输入框
        document.getElementById("input_message").value = "";
        document.getElementById("input_message").disabled = true;
        document.getElementById("send_button").disabled = true;
    });
      
});


function startStream() {
    const question = document.getElementById("input_message").value;
    const cid = document.getElementById("cid").innerHTML;
    const title = document.getElementById("title").innerHTML;

    // 根据当前时间戳生成message_id
    message_id = Date.now();
    
    const token = localStorage.getItem("token");
    var user_info = JSON.parse(localStorage.getItem('user_info'));

    // 从本地缓存中取出conversation_id（保持和app一致，如果会话为空，则由服务器创建一个新的，透传给客户端，后期也容易扩展）
    if (question.trim() === "") {
      return;
    }

    // 如果question含有HTML标签，需要转义
    const safeQuestion = document.createElement('textarea').textContent = question;
    displaySenderMessage(safeQuestion);

    // Display loading spinner
    displayLoadingSpinner();

    // Replace with your actual API endpoint
    const timestamp = Date.now();

    // 创建 EventSource 对象连接服务器
    // 订阅的频道
    var signT = safeQuestion + timestamp + token;
    var sign = AES_ECB_ENCRYPT(signT);
    
    var data = {
        "text": safeQuestion,
        "cid": cid,
        "conversation_id": conversation_id,
        "mode": selectedOption
    };

    // https://github.com/mpetazzoni/sse.js/blob/main/README.md
    EventSource = SSE;
    var source = new EventSource("/api/chat/stream", {
            headers: {
              'Content-Type': 'application/json',
              "token": token
            },
            payload: JSON.stringify(data),
            method: 'POST'
    });
    source.onmessage = function(event) {
        console.log("收到订阅消息" + JSON.stringify(event.data));
        // document.getElementById("message-window").innerHTML+=event.data + "<br>";
    };
    
      // 服务器发送信息到客户端时，会触发
      source.addEventListener("event_receive", function(event) {
            onMessageReceive(event);
      }, false);

       source.addEventListener("event_end", function(event) {
           source.close();
           onMessageEnd(event);
       }, false);

      source.onopen = function (event) {
        // 可以查看请求头
        // console.log("open:" + JSON.stringify(event));
      };

      source.onabort = function (event) {
        console.log("客户端主动终止连接");
      };

      source.onerror = function (event) {
          console.log("error:" + JSON.stringify(event));
      };

      // 连接异常时会触发 error 事件并自动重连
      source.addEventListener('error', function(event) {
        //   if (event.target.readyState === EventSource.CLOSED) {
        //       console.log("Disconnected");
        //   } else if (event.target.readyState === EventSource.CONNECTING) {
        //       console.log("Connecting...");
        //   }
      }, false);
     source.stream();
  }


    function escapeHtml(unsafe) {
      return unsafe
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#039;");
  }
  
  function displaySenderMessage(message) {
        const chat_area = document.getElementById("chat_area");
        chat_area.innerHTML += `
        <div class="d-flex justify-content-end">
        <div class="chat-message sender">
            <p>${escapeHtml(message)}</p>
        </div>
        <img src="static/chat.png" alt="Sender Avatar" class="avatar">
        </div>
    `;
    chat_area.scrollTop = chat_area.scrollHeight;
  }

  function displayLoadingSpinner() {
    const chat_area = document.getElementById("chat_area");
    chat_area.innerHTML += `
        <div class="d-flex justify-content-start" id="loading-spinner">
        <img src="static/chat.webp" alt="Receiver Avatar" class="avatar">
        <div class="loading">
            <div class="circle"></div>
            <div class="circle"></div>
            <div class="circle"></div>
        </div>
        </div>
  `;
  chat_area.scrollTop = chat_area.scrollHeight;
}

function removeLoadingSpinner() {
    const chat_area = document.getElementById("chat_area");
    const spinner = document.getElementById("loading-spinner");
    if(spinner != null) {
        chat_area.removeChild(spinner);
    }
}

function onMessageStart(event) {
    const chat_area = document.getElementById("chat_area");
    var data = JSON.parse(event.data);
    // Remove loading spinner
    removeLoadingSpinner();
    const messageElement = document.createElement("div");
    messageElement.classList.add("d-flex", "justify-content-start");

    const avatar = document.createElement("img");
    avatar.src = "static/chat.webp";
    avatar.alt = "Receiver Avatar";
    avatar.classList.add("avatar");

    const chatMessage = document.createElement("div");
    chatMessage.classList.add("chat-message", "receiver");
    const messageText = document.createElement("p");
    // 设置id和class
    messageText.setAttribute("id", message_id);
    // 设置p的style样式并保留空格
    messageText.setAttribute("style", "white-space:pre-wrap;");

    chatMessage.appendChild(messageText);
    messageElement.appendChild(avatar);
    messageElement.appendChild(chatMessage);

    chat_area.appendChild(messageElement);
}

function onMessageReceive(event) {
    const chat_area = document.getElementById("chat_area");
    const data = JSON.parse(event.data);

    // 判断当前message_id是否已经存在，不存在则创建
      var messageText = document.getElementById(message_id);
      if (messageText == null) {
          onMessageStart(event);
      }

      var type = data["type"]
      const msg = data["content"];
      // 将换行符替换为HTML格式的换行符
      var finalMsg = msg;
      var messageText = document.getElementById(message_id);
      // 检测finalMsg有几个换行符
      var count = 0;
      var finalMsg = msg.replace(/\n/g, "<br>");
      const parts = finalMsg.split(/(<br\s*\/?>)/i);
       for (const part of parts) {
          if (part.toLowerCase() === "<br/>" || part.toLowerCase() === "<br>") {
            const brElement = document.createElement("br");
            messageText.appendChild(brElement);
          } else {
            for (let i = 0; i < part.length; i++) {
              const textNode = document.createTextNode(part[i]);
              messageText.appendChild(textNode);

              // Scroll to the bottom of the chat area
              chat_area.scrollTop = chat_area.scrollHeight;

              sleep(20);
            }
          }
        }

      // Scroll to the bottom of the chat area
      chat_area.scrollTop = chat_area.scrollHeight;
  }

function onMessageEnd(event) {
    const chat_area = document.getElementById("chat_area");
    const input_message = document.getElementById("input_message");
    const send_button = document.getElementById("send_button");

    var data = JSON.parse(event.data);

    // ============== 结束消息 ==============
    // 判断当前message_id是否已经存在，不存在则创建
    var messageText = document.getElementById(message_id);
    if (messageText == null) {
        onMessageStart(event);
    }

    if(data["content"] != null && data["content"] != ""){
        toast(data["content"]);
    }

    const finalMsg = data["content"];
    var messageText = document.getElementById(message_id);
    const textNode = document.createTextNode(finalMsg);
    messageText.appendChild(textNode);

    appendButtons();

    // ============== 结束消息 ==============

    // Scroll to the bottom of the chat area
    chat_area.scrollTop = chat_area.scrollHeight;
    // 输出完毕：恢复输入框（此处只执行一次）
    input_message.disabled = false;
    send_button.disabled = false;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 可选，暂时不用
function appendButtons() {
    var messageText = document.getElementById(message_id);
    // 去掉 复制，生成图片，生成视频，分享到社区等文案
    var all_content = messageText.textContent.replace("复制", "").replace("生成图片", "").replace("生成视频", "").replace("分享到社区", "");

     // 添加操作按钮
     const buttonGroup = document.createElement("div");
     buttonGroup.classList.add("action-buttons");

     // 创建复制按钮
     const generateCopyButton = document.createElement("button");
     generateCopyButton.classList.add("btn", "btn-sm", "btn-primary");
     generateCopyButton.textContent = "复制";
     generateCopyButton.onclick = function() {
       copyText(all_content);
       toast("复制成功");
     };

     // 创建生成图片按钮
     const generateImageButton = document.createElement("button");
     generateImageButton.classList.add("btn", "btn-sm", "btn-primary", "ms-2");
     generateImageButton.textContent = "生成图片";
     generateImageButton.onclick = function() {
       generateImage(cid, title, question, customKey, all_content);
     };

     // 创建生成视频按钮
     const generateVideoButton = document.createElement("button");
     generateVideoButton.classList.add("btn", "btn-sm", "btn-secondary", "ms-2");
     generateVideoButton.textContent = "生成视频";
     generateVideoButton.onclick = function() {
       generateVideo();
     };

     const generateShareButton = document.createElement("button");
     generateShareButton.classList.add("btn", "btn-sm", "btn-secondary", "ms-2");
     generateShareButton.textContent = "分享到社区";
     generateShareButton.onclick = function() {
       generateShare(cid, title, question, customKey, all_content);
     };

    // 将按钮添加到按钮组
    // 添加一个换行
    const brElement = document.createElement("br");
    buttonGroup.appendChild(brElement);
    buttonGroup.appendChild(generateCopyButton);
    //  buttonGroup.appendChild(generateImageButton);
    //  buttonGroup.appendChild(generateVideoButton);
    //  buttonGroup.appendChild(generateShareButton);

    // 将按钮组添加到聊天框
    messageText.appendChild(buttonGroup);
}

