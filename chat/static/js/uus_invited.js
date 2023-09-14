function initInvited(user_info) {
    axios.get('/api/web/invited/' + user_info.username).then(function (response) {
        // handle success
        var data = response.data;
        var loginUser = data.body.login_user;
        var userList = data.body.user_list;

        if (loginUser) {
            document.querySelector('#username').value = loginUser.username;
        } else {
            document.querySelector('#username').value = '未登录';
        }

        // document.querySelector('.form-control').value = loginUser.username;
        document.querySelector('#invite_code').value = loginUser.share_code;

        // set invitation link
        const currentUrl = window.parent.location.href;
        const domain = currentUrl.split('/').splice(0, 3).join('/');

        var invitationLink = document.querySelector('#invitationLink');
        var link = `${domain}/chat/register.html?invite_code=${loginUser.share_code}`;

        invitationLink.setAttribute("data-link", link);
        invitationLink.innerText = link;

        // set total coins
        document.querySelector('#totalCoins').value = loginUser.diamond_count;

        // set user list
        var tbody = document.querySelector('tbody');
        userList.forEach(function(user, index) {
            var tr = document.createElement('tr');

            var th = document.createElement('th');
            th.scope = 'row';
            th.innerText = index + 1;
            tr.appendChild(th);

            var tdUsername = document.createElement('td');
            tdUsername.innerText = user.username;
            tr.appendChild(tdUsername);

            var tdCreateTime = document.createElement('td');
            tdCreateTime.innerText = user.over_time; // assuming this is the registration time
            tr.appendChild(tdCreateTime);

            var tdCoinCount = document.createElement('td');
            tdCoinCount.innerText = user.use_times; // assuming this is the coin count
            tr.appendChild(tdCoinCount);

            tbody.appendChild(tr);
        });
    })
    .catch(function (error) {
        // handle error
        console.log(error);
    });
}

function handleWithdraw() {
    // 在此处编写处理提现操作的代码
    console.log('提现操作');

    // 关闭弹窗
    const modalElement = document.getElementById('withdrawModal');
    const modalInstance = bootstrap.Modal.getInstance(modalElement);
    modalInstance.hide();
}

$(document).ready(function () {
    var user_info = JSON.parse(localStorage.getItem('user_info'));
    if (user_info == null) {
        window.location.href = 'register.html';
    }

    initInvited(user_info);

    $(".copy-link").on("click", function (event) {
        event.preventDefault(); // 阻止默认行为
        var textToCopy = $(this).data("link"); // 获取data-link属性中的值
        var tempInput = $("<input>");
        $("body").append(tempInput);
        tempInput.val(textToCopy).select();
        document.execCommand("copy");
        tempInput.remove();
        toast("邀请链接已复制到剪贴板");
    });
});