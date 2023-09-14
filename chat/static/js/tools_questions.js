
function getClass(className) {
    var ele = document.getElementsByTagName("*");
    var classEle = [];
    for (var i = 0; i < ele.length; i++) {
        var cn = ele[i].className;
        if (cn === className) {
            classEle.push(ele[i]);
        }
    }
    return classEle;
}

function init() {
    var tagEle = "querySelectorAll" in document ? document.querySelectorAll(".tag") : getClass("tag");
    var paper = "querySelectorAll" in document ? document.querySelector(".tagBall") : getClass("tagBall")[0];
    
    RADIUS = 220,
    fallLength = 500,
    tags = [],
    angleX = Math.PI / 500,
    angleY = Math.PI / 500,
    CX = paper.offsetWidth / 2,
    CY = paper.offsetHeight / 2,
    EX = paper.offsetLeft + document.body.scrollLeft + document.documentElement.scrollLeft,
    EY = paper.offsetTop + document.body.scrollTop + document.documentElement.scrollTop;

    if ("addEventListener" in window) {
        paper.addEventListener("mousemove",
        function(event) {
            var x = event.clientX - EX - CX;
            var y = event.clientY - EY - CY;
            angleY = x * 0.0001;
            angleX = y * 0.0001;
        });
    } else {
        paper.attachEvent("onmousemove",
        function(event) {
            var x = event.clientX - EX - CX;
            var y = event.clientY - EY - CY;
            angleY = x * 0.0001;
            angleX = y * 0.0001;
        });
    }

    for (var i = 0; i < tagEle.length; i++) {
        var a, b;
        var k = -1 + (2 * (i + 1) - 1) / tagEle.length;
        var a = Math.acos(k);
        var b = a * Math.sqrt(tagEle.length * Math.PI);
        var x = RADIUS * Math.sin(a) * Math.cos(b);
        var y = RADIUS * Math.sin(a) * Math.sin(b);
        var z = RADIUS * Math.cos(a);
        var t = new tag(tagEle[i], x, y, z);
        tagEle[i].style.color = "rgb(" + parseInt(Math.random() * 255) + "," + parseInt(Math.random() * 255) + "," + parseInt(Math.random() * 255) + ")";
        tags.push(t);
        t.move();
    }
}

// 注意此处的写法，很有意思，这个函数直接重写了数组的forEach方法，但也直接影响了axios.min.js第三方库的forEach方法，所以我们一般不要重写原生的方法。
// Array.prototype.forEach = function(callback) {
// 	for (var i = 0; i < this.length; i++) {
// 		callback.call(this[i]);
// 	}
// }

function animate() {
    setInterval(function() {
        rotateX();
        rotateY();
        tags.forEach(function(result) {
            result.move();
        })
    },
    17)
}

function rotateX() {
    var cos = Math.cos(angleX);
    var sin = Math.sin(angleX);
    tags.forEach(function(result) {
        var y1 = result.y * cos - result.z * sin;
        var z1 = result.z * cos + result.y * sin;
        result.y = y1;
        result.z = z1;
    })

}

function rotateY() {
    var cos = Math.cos(angleY);
    var sin = Math.sin(angleY);
    tags.forEach(function(result) {
        var x1 = result.x * cos - result.z * sin;
        var z1 = result.z * cos + result.x * sin;
        result.x = x1;
        result.z = z1;
    })
}
var tag = function(ele, x, y, z) {
    this.ele = ele;
    this.x = x;
    this.y = y;
    this.z = z;
}
tag.prototype = {
    move: function() {
        var scale = fallLength / (fallLength - this.z);
        var alpha = (this.z + RADIUS) / (2 * RADIUS);
        this.ele.style.fontSize = 15 * scale + "px";
        this.ele.style.opacity = alpha + 0.5;
        this.ele.style.filter = "alpha(opacity = " + (alpha + 0.5) * 100 + ")";
        this.ele.style.zIndex = parseInt(scale * 100);
        this.ele.style.left = this.x + CX - this.ele.offsetWidth / 2 + "px";
        this.ele.style.top = this.y + CY - this.ele.offsetHeight / 2 + "px";
    }
}