let sidebar = null;
$(document).ready(function () {
    let touchStartX = null;
    sidebar = document.getElementById("my-sidebar");
    $('#btn_sidebar').click(function() {
        document.getElementById("my-sidebar").classList.toggle("open");
    });
    sidebar.addEventListener("touchstart", handleTouchStart);
    sidebar.addEventListener("touchend", handleTouchEnd);
})

function handleTouchStart(e) {
  touchStartX = e.touches[0].clientX;
}

function handleTouchEnd(e) {
  const touchEndX = e.changedTouches[0].clientX;
  const distance = touchStartX - touchEndX;

  if (distance > 30) { // 可以更改此值以调整触发滑动关闭的敏感程度
    sidebar.classList.remove("open");
  }
  touchStartX = null;
}