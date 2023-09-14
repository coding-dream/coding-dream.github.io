function getPaylist(user_info) {
    axios.get('/api/pay/list?timestamp=' + Date.parse(new Date()) + '&pass_id=z76621e2ac53de681a11cd93f7c15bf3') 
    .then(function (response) {
        // handle success
        var results = response.data.body.results;
        var html = '';
        for (var i = 0; i < results.length; i++) {
            var result = results[i];
            html += `
                <div class="col">
                <div class="card mb-4 rounded-3 shadow-sm">
                    <div class="card-header py-3">
                    <div class="upgrade-cid" style="display:none;">${result.cid}</div>
                    <h4 class="my-0 fw-normal">${result.name}</h4>
                    </div>
                    <div class="card-body">
                    <h1 class="card-title pricing-card-title"><small class="text-muted fw-light">¥</small>${result.coin_count}</h1>
                    <ul class="list-unstyled mt-3 mb-4">
                        <s><li><small class="text-muted fw-light">¥</small>${result.coin_count_origin}</li></s>
                        <li>支持Web/App通用</li>
                        <li>${result.content}</li>
                    </ul>
                    <button type="button" class="w-100 btn btn-lg btn-outline-primary" onclick="buyCard('${result.cid}','${user_info.username}', '${user_info.code}')">${result.pay_btn}</button>
                    </div>
                </div>
                </div>
            `;
        }
        document.getElementById('plans-container').innerHTML = html;
    })
    .catch(function (error) {
        // handle error
        console.log(error);
    });
}

function getUserInfo() {
    axios.get('/api/user/user_info', {
        headers: {
            'token': localStorage.getItem("token")
        }
    })
    .then(function (response) {
        // handle success
        if(response.data.body) {
            document.getElementById('over_time').innerHTML = "到期时间：" + response.data.body.over_time;
            document.getElementById('use_times').innerHTML = "剩余次数：" + response.data.body.use_times;
            document.getElementById('coin_count').innerHTML = "金币：" + response.data.body.coin_count;
            document.getElementById('diamond_count').innerHTML = "钻石：" + response.data.body.diamond_count;
            document.getElementById('username').innerHTML = "当前用户：" + response.data.body.username;
            document.getElementById('not_logged_in').style.display = 'none';
        } else {
            document.getElementById('not_logged_in').style.display = 'block';
        }
    })
    .catch(function (error) {
        // handle error
        console.log(error);
    });
}

function buyCard(cid, username, code) {
    fetch("/api/web/create_order", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'token': localStorage.getItem("token")
        },
        body: JSON.stringify({
            cid: cid,
            username: username,
            pass_id: "z76621e2ac53de681a11cd93f7c15bf3",
            code: code
        })
    })
    .then(response => response.json())
    .then(result => {
        if (result["code"] == 0) {
            alert("购买成功！");
            window.location.href = '/pricing';
        } else {
            alert(result["message"]);
        }
    })
    .catch(error => {
        alert("购买失败");
        console.error("请求失败：" + error);
    });
}

function buyCoin() {
    var code = document.getElementById('code').value;
    var timestamp = Date.parse(new Date());

    const token = localStorage.getItem("token");

    fetch("/api/web/buyCoin?timestamp=" + timestamp, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'token': token
        },
        body: JSON.stringify({
            code: code,
            timestamp: timestamp
        })
    })
    .then(response => response.json())
    .then(result => {
        if (result["code"] == 0) {
            alert("恭喜你，升级成功！");
            // 防止iframen的嵌套问题
            // `window.top` 是指向最顶层的窗口，也就是你的主页面。所以，无论iframe嵌套多深，`window.top.location.href` 都会让主页面跳转到指定的URL，而不是在iframe内部跳转。
            window.top.location.href = 'home.html';
        } else {
            alert(result["message"] + "，" + result["code"]);
        }
    })
    .catch(error => {
        alert("升级失败");
        console.error("请求失败：" + error);
    });
}

function initPrice() {
    // 读取用户信息
    var user_info = JSON.parse(localStorage.getItem('user_info'));
    if (user_info == null) {
        window.location.href = 'register.html';
    }
    // 用户ID
    var id = user_info.id;
    // 用户名
    var username = user_info.username;
    // 注册码code，用于奖励通过某人的邀请注册的用户
    var code = user_info.code;

    // 保存用户信息
    // localStorage.setItem('user_info', JSON.stringify(user_info));
    // getPaylist(user_info);
    getUserInfo();

}

// 页面加载完成后调用loadDefaultData()
document.addEventListener('DOMContentLoaded', initPrice);