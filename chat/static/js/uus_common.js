 /**
   * AES-256-ECB对称加密
   * @param text {string} 要加密的明文
   * @param secretKey {string} 密钥，43位随机大小写与数字
   * @returns {string} 加密后的密文，Base64格式
   */
  function AES_ECB_ENCRYPT(text) {
    var keyHex = CryptoJS.enc.Base64.parse(getKey1() + getKey2() + getKey3() + getKey4());
    var messageHex = CryptoJS.enc.Utf8.parse(text);
    var encrypted = CryptoJS.AES.encrypt(messageHex, keyHex, {
      "mode": CryptoJS.mode.ECB,
      "padding": CryptoJS.pad.Pkcs7
    });
    return encrypted.toString();
  }

  /**
   * AES-256-ECB对称解密
   * @param textBase64 {string} 要解密的密文，Base64格式
   * @param secretKey {string} 密钥，43位随机大小写与数字
   * @returns {string} 解密后的明文
   */
  function AES_ECB_DECRYPT(textBase64) {
    var keyHex = CryptoJS.enc.Base64.parse(getKey1() + getKey2() + getKey3() + getKey4());
    var decrypt = CryptoJS.AES.decrypt(textBase64, keyHex, {
      "mode": CryptoJS.mode.ECB,
      "padding": CryptoJS.pad.Pkcs7
    });
    return CryptoJS.enc.Utf8.stringify(decrypt);
  }

function getKey1() {
    return "sVZJnaFAZtd";
}

function getKey2() {
    return "/";
}

function getKey3() {
    return "C+1U6OzU6g";
}

function getKey4() {
    return "==";
}

window.onload = function() {
  // 页面加载完成后执行，类似于jQuery的$(document).ready()，如果不用此函数，那么body可能还未加载就执行了我们的js方法。
  // 动态创建div class="my-toast"></div>
  const toastEl = document.createElement('div');
  toastEl.classList.add('my-toast');
  document.body.appendChild(toastEl);
}

function toast(message) {
  const toastEl = document.querySelector('.my-toast');
  toastEl.innerText = message;
  toastEl.style.opacity = 1;
  toastEl.style.display = 'block';
  setTimeout(function() {
      toastEl.style.opacity = 0;
  }, 2000);
}

const unsecuredCopyToClipboard = (text) => { const textArea = document.createElement("textarea"); textArea.value=text; document.body.appendChild(textArea); textArea.focus();textArea.select(); try{document.execCommand('copy')}catch(err){console.error('Unable to copy to clipboard',err)}document.body.removeChild(textArea)};

  /**
   * Copies the text passed as param to the system clipboard
   * Check if using HTTPS and navigator.clipboard is available
   * Then uses standard clipboard API, otherwise uses fallback
  */
  const copyToClipboard = (content) => {
    if (window.isSecureContext && navigator.clipboard) {
      // 使用标准的 clipboard API
      navigator.clipboard.writeText(content);
    } else {
      // 使用 fallback，比较hack的方法
      unsecuredCopyToClipboard(content);
    }
};


function copyCurrentUrl() {
  // 获取当前链接
  const currentUrl = window.location.href;

  const textArea = document.createElement("textarea");
  textArea.value = currentUrl;
  document.body.appendChild(textArea);
  textArea.select();
  textArea.setSelectionRange(0, 99999); // 兼容移动设备
  document.execCommand("copy");
  document.body.removeChild(textArea);
  // 提示用户已复制链接
  alert('链接已复制到剪贴板');
}

function copyText(text) {
	const el = document.createElement('textarea');
	el.value = text;
	el.style.position = 'absolute';
	el.style.left = '-9999px';
	document.body.appendChild(el);
	el.select();
	document.execCommand('copy');
	document.body.removeChild(el);
	toast('已复制: ' + text);
}