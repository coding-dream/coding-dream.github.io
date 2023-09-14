document.addEventListener('DOMContentLoaded', function() {
    initUpload();
});


function initUpload() {
    document.getElementById('handleButton').addEventListener('click', function() {
        document.getElementById('btn-loading').style.display = 'inline-block';
        document.getElementById('btn-text').innerText = 'loading...';
        document.getElementById('handleButton').disabled = true;

        var fileInput = document.getElementById('fileInput');
        var file = fileInput.files[0];

        var formData = new FormData();
        formData.append('image', file);
        
        // 标题和描述
        var title = document.getElementById('title').value;
        var desc = document.getElementById('desc').value;
        formData.append('title', title);
        formData.append('desc', desc);
    
        fetch('/api/file/image_handle', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if(data.code == 0) {
                var img = document.createElement('img');
                var result = data.body;
                img.src = result.url;
                // 设置图片宽高
                img.style.width = '30%';
                img.style.height = '30%';
                // 只显示一张图片
                var imageContainer = document.getElementById('imageContainer');
                imageContainer.innerHTML = '';
                imageContainer.appendChild(img);
                // document.getElementById('imageContainer').appendChild(img);

            } else {
                toast(data.message);
            }
        })
        .catch(error => alert(error))
        .finally(() => {
            document.getElementById('btn-loading').style.display = 'none';
            document.getElementById('btn-text').innerText = '图片处理';
            document.getElementById('handleButton').disabled = false;

            // 清空文件选择框
            document.getElementById('fileInput').value = '';
            document.getElementById('title').value = '';
            document.getElementById('desc').value = '';
        });
    });
}
