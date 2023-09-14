document.addEventListener('DOMContentLoaded', function() {
    loadArticleDetail();
});

// 在新页面中从URL中取出数据
function getQueryString(name) {
    var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if(r!=null) return decodeURIComponent(r[2]); return null;
}

function loadArticleDetail() {
    let article_name = getQueryString('article_name');
    let article_category = getQueryString('article_category');
    // 请求文章数据
    axios.get('/api/web/article_detail?article_category=' + article_category + '&article_name=' + article_name)
    .then(function (response) {
        // handle success
        let data = response.data.body;
        document.getElementById('targetDiv').innerHTML = `
        <h1>${data.title}</h1>
        <div class="underline"></div>
    
        <div class="row">
            <div class="col-md-12">
                <div class="card mb-4">
                    <div class="card-body">
                        ${data.content}
                    </div>
    
                    <!-- 文章末尾作者信息 -->
                    <div class="card-footer text-muted">
                        <div class="row">
                            <div class="col-md-2 d-flex justify-content-center align-items-center">
                                <img src="static/公众号.jpg" alt="" class="rounded-circle" width="50px" height="50px">
                            </div>
                            <div class="col-md-10">
                                <div class="row">
                                    <div class="col-md-12">
                                        <h5>${data.author_name}</h5>
                                    </div>
                                    <div class="col-md-12">
                                        <p>${data.author_bio}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `;
    })
    .catch(function (error) {
        // handle error
        console.log(error);
    })
    .then(function () {
        // always executed
    });
}