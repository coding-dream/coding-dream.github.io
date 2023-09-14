// 在新页面中从URL中取出数据
function getQueryString(name) {
  var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
  var r = window.location.search.substr(1).match(reg);
  if(r!=null) return decodeURIComponent(r[2]); return null;
}

$(document).ready(function () {
  let invite_code = getQueryString('invite_code');

  // 设置默认的邀请码
  if (invite_code != null) {
      document.querySelector("#invite_code").value = invite_code;
  }

  // 生成验证码
  document.querySelector("#login_captcha_img").src = '/api/user/captcha';
  document.querySelector("#register_captcha_img").src = '/api/user/captcha';
  // 点击验证码图片时，刷新验证码
  document.querySelector("#login_captcha_img").onclick = function () {
    this.src = '/api/user/captcha?t=' + Math.random();
  }

  document.querySelector("#register_captcha_img").onclick = function () {
    this.src = '/api/user/captcha?t=' + Math.random();
  }

  // 登录用户
  $("#btn-login").click(function () {
    var username = $("#login_name").val();
    var password = $("#login_pwd").val();
    var captcha = $("#login_captcha").val();
    if (username.length <= 0) {
      toast("用户名不能为空");
      return;
    }
    if (password.length <= 0) {
      toast("密码不能为空");
      return;
    }
    if (captcha.length <= 0) {
      toast("请输入验证码");
      return;
    }

      fetch('/api/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: username, password: password, captcha: captcha})
      })
      .then(response => response.json())
      .then(result => {
        if (result.code == 0) {
          // 登录成功
          var user_info = JSON.stringify(result.body);
          localStorage.setItem('user_info', user_info);
          // 保存token
          localStorage.setItem('token', result.body.token);

          toast("登录成功！");
          window.location.href = "home.html";
          return;
        } else {
            // 重新刷新验证码
            document.querySelector("#login_captcha").value = "";
            document.querySelector("#login_captcha").focus();
            document.querySelector("#login_captcha").placeholder = "验证码错误";
            document.querySelector("#login_captcha").classList.add("error");
            document.querySelector("#login_captcha").classList.remove("success");
            document.querySelector("#login_captcha_img").click();
            toast(result.message + " " + result.code);
        }
      })
      .catch(error => {
        toast("登录失败！");
      });
});

  // 注册用户
  $("#btn-register").click(function () {
    var username = $("#register_user").val();
    var password = $("#register_pwd").val();
    var password_check = $("#register_pwd_check").val();
    var captcha = $("#register_captcha").val();

    var invite_code = $("#invite_code").val();

    if (username.length < 5) {
      toast("用户名不能少于5位！");
      return;
    }
    if (password.length < 5) {
      toast("密码长度过短！");
      return;
    }
    if (password != password_check) {
      toast("两次密码输入不一致！");
      return;
    }
    if (captcha.length <= 0) {
      toast("请输入验证码");
      return;
    }

    fetch('/api/user/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username: username, password: password, invite_code: invite_code, captcha: captcha}),
    })
    .then(response => response.json())
    .then(result => {
      if (result.code == 0) {
          // 注册成功
          var user_info = JSON.stringify(result.body);
          localStorage.setItem('user_info', user_info);
          // 保存token
          localStorage.setItem('token', result.body.token);
          
          toast("注册成功");
          window.location.href = "home.html";
          return;
      } else {
          // 重新刷新验证码
          $("#register_captcha").val("");
          $("#register_captcha").focus();
          $("#register_captcha").attr("placeholder", "验证码错误");
          $("#register_captcha").addClass("error");
          $("#register_captcha").removeClass("success");
          $("#register_captcha_img").click();
          
          // 通用错误码
          toast(result.message + " " + result.code);
      }
    })
    .catch((error) => {
      toast("注册失败");
    });

  });

});

