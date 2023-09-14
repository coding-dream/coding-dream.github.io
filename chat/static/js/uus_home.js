function showUserProfile() {
    document.getElementById('user-info-modal').style.display = 'block';
}

function closeUserProfile() {
    document.getElementById('user-info-modal').style.display = 'none';
}

function updateHtmlInfo(login_user) {
  // 更新用户信息
  document.querySelectorAll('.user_info_username').forEach((element) => {
    element.textContent = login_user.username;
  });
  document.getElementById('user_info_over_time').innerText = "到期时间：" + login_user.over_time;
  document.getElementById('user_info_use_times').innerText = "剩余次数：" + login_user.use_times;
}

function refreshUserInfo(login_user) {
  var token = localStorage.getItem('token');

  // 刷新用户信息
  fetch('/api/user/user_info', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'token': token
    }
  })
  .then(response => response.json())
  .then(result => {
    if (result.code == 0) {
      // 更新用户信息
      var user_info = JSON.stringify(result.body);
      localStorage.setItem('user_info', user_info);
      updateHtmlInfo(result.body);
    } else {
      alert(result.message);

      if (result.code == 10001) {
          // 用户不存在
          logout();
        }
    }
  })
}

function logout() {
  // 退出登录
  localStorage.removeItem('user_info');
  window.location.href = 'register.html';
}

// 获取所有菜单项
const menuItems = document.querySelectorAll('.my-nav');
// 获取内容容器
const contentContainer = document.getElementById('content-container');

// Handle menu item click
async function handleMenuItemClick(e) {
  e.preventDefault();

  // Remove 'active' class from all menu items
  menuItems.forEach((menuItem) => {
    menuItem.classList.remove('active');
  });

  // Add 'active' class to clicked menu item
  e.target.classList.add('active');

  // Get URL from the 'data-url' attribute
  const url = e.target.getAttribute('data-url');
  // Fetch HTML content from the URL and update the content container
  const response = await fetch(url);
  const content = await response.text();
  contentContainer.srcdoc = content;
}

// Add event listeners to menu items
menuItems.forEach((menuItem) => {
  menuItem.addEventListener('click', handleMenuItemClick);
});


// 加载默认数据的函数
function loadDefaultData() {
  // 检查用户是否登录
  // localStorage.clear();

  const user_info = localStorage.getItem('user_info');
  if (!user_info) {
    // 如果用户未登录，则跳转到登录页面
    window.location.href = 'register.html';
    return;
  } else {
    // 如果用户已登录，则显示用户信息
    login_user = JSON.parse(user_info);
    updateHtmlInfo(login_user);
    refreshUserInfo(login_user);
  }

  const defaultNavItem = document.getElementById('default-nav-item');

  if (defaultNavItem) {
      const defaultDataUrl = defaultNavItem.getAttribute('data-url');
      fetch(defaultDataUrl)
        .then((response) => response.text())
        .then((content) => {
            contentContainer.srcdoc = content;
      });
  }
}
// 页面加载完成后调用loadDefaultData()
document.addEventListener('DOMContentLoaded', loadDefaultData);