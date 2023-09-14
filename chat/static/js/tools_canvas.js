function captureDivAsImage(divId) {
  // 获取指定的div元素
  const targetDiv = document.getElementById(divId);

  // 使用html2canvas捕获div并将其转换为图像
  html2canvas(targetDiv).then(function (canvas) {
    // 在这里，您可以选择如何处理已转换为图像的canvas对象

    // 将canvas转换为DataURL
    const imgDataUrl = canvas.toDataURL("image/png");

    // 创建一个新的隐藏的<a>元素，用于下载图片
    const link = document.createElement('a');
    link.href = imgDataUrl;
    link.download = 'captured-image.png';
    link.style.display = 'none';

    // 将链接添加到DOM并触发点击事件，以开始下载
    document.body.appendChild(link);
    link.click();

    // 从DOM中删除链接
    document.body.removeChild(link);
  });
}