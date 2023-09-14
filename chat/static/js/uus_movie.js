let movieList = "";

document.addEventListener("DOMContentLoaded", function(){
    initMovieList();
});

function getParam(paramName) {
    paramValue = "", isFound = !1;
    if (window.location.search.indexOf("?") == 0 && window.location.search.indexOf("=") > 1) {
        arrSource = unescape(window.location.search).substring(1, window.location.search.length).split("&"), i = 0;
        while (i < arrSource.length && !isFound) arrSource[i].indexOf("=") > 0 && arrSource[i].split("=")[0].toLowerCase() == paramName.toLowerCase() && (paramValue = arrSource[i].split("=")[1], isFound = !0), i++
    }
    return paramValue == "" && (paramValue = null), paramValue
}

function initMovieList() {
    fetch("/api/web/list_movie" + "?v=" + getParam("v"))
    .then(response => {
        if (!response.ok) {
            throw new Error("HTTP error " + response.status);
        }
        return response.json();
    })
    .then(json => {
        if(json.code == 0){
            for(let i = 0; i < json.body.results.length; i++){
                let item = json.body.results[i];
                appendItem(item, i);
            }
            document.getElementById("list_mv").innerHTML = movieList;
        } else {
            alert("data load error!");
        }
    })
    .catch(function() {
        alert("data load error!");
    });
}

function cache(obj) {
    if (getParam("v") == "1") {
        console.log("当前已是高效缓存模式，无需再次缓存");
        return;
    }
    let url = "/api/cli/play_video?link=" + obj.getAttribute("data-url") + "&v=" + getParam("v");
    fetch(url)
    .then(response => {
        if (!response.ok) {
            throw new Error("HTTP error " + response.status);
        }
        return response.json();
    })
    .then(json => {
        if(json.code == 0) {
            alert(json.message);
        } else {
            console.log("handle video error!");
        }
    })
    .catch(function() {
        alert("data load error!");
    });
}

function play(obj) {
    window.open("iina://weblink?url=" + obj.getAttribute("data-url"), "_blank");

}

function appendItem(item, index){
    let title = item.title;
    let image = item.image;
    let link = item.link;
    // 如果path不为空，则使用path
    if (getParam("v") == 1) {
        link = item.path;
    }
    let size = item.size;
    // 转换size为MB
    size = size / 1024 / 1024;
    size = size.toFixed(2);

    let li_item = `
        <li class="item">
            <a id="btn_play" class="js-tongjic" referrerPolicy="no-referrer" rel="noreferrer noopener" href="#" title="${title}" data-url="${link}" onclick='play(this)'>
                <div class="cover g-playicon">
                    <img referrerPolicy="no-referrer" rel="noreferrer noopener" src="${image}" alt="${title}">
                    <span class="pay">推荐</span>
                    <span class="hint">未知</span>
                </div>
                <div class="detail">
                    <p class="title g-clear">
                        <span class="s1">(${index}). 大小 ${size} MB</span>
                        <span class="s2">9.0</span>
                    </p>
                </div>
            </a>
            <button class="v-cache" data-url="${link}" onclick='cache(this)'>缓存视频</button>
        </li>
    `;
    movieList = movieList + li_item;
}