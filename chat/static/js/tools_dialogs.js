// 显示图片并打开模态框
function showImageModal(imageUrl) {
    const imageModal = new bootstrap.Modal(document.getElementById('imageModal'));
    document.getElementById('generatedImage').src = imageUrl;
    document.getElementById('generatedImage').alt = imageUrl;
    document.getElementById('downloadButton').href = imageUrl;
    imageModal.show();
}

// 显示确认弹窗并设置确认按钮的操作
function showConfirmModal(callback) {
      const confirmModal = new bootstrap.Modal(document.getElementById('confirmModal'));
      const confirmButton = document.getElementById('confirmButton');

      // 为确认按钮添加点击事件处理程序
      confirmButton.addEventListener('click', function handler() {
        // 移除事件处理程序，避免重复调用
        confirmButton.removeEventListener('click', handler);

        // 关闭模态框
        confirmModal.hide();

        // 执行确认操作
        callback();
      });

      // 显示模态框
      confirmModal.show();
}

// 加载默认数据的函数
function init_dialogs() {
    // ================= 图片模态框 =================
    const imageDialog = document.createElement('div');
    imageDialog.innerHTML = `
    <!-- 图片模态框 -->
    <div class="modal fade" id="imageModal" tabindex="-1" aria-labelledby="imageModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="imageModalLabel">生成的图片</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <img id="generatedImage" src="" alt="Generated Image" class="img-fluid">
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">关闭</button>
            <a id="downloadButton" class="btn btn-primary" href="" target="_blank" download="generated_image.jpg">下载图片</a>
          </div>
        </div>
      </div>
    </div>
    
    `;
    document.body.appendChild(imageDialog);

    // ================= 确认操作模态框 =================
    const confirmDialog = document.createElement('div');
    confirmDialog.innerHTML = `

      <!-- 确认操作模态框 -->
      <div class="modal fade" id="confirmModal" tabindex="-1" aria-labelledby="confirmModalLabel" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="confirmModalLabel">确认操作</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              您确定要执行此操作吗？
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
              <button type="button" class="btn btn-primary" id="confirmButton">确定</button>
            </div>
          </div>
        </div>
      </div>
    `
    document.body.appendChild(confirmDialog);

    // ================= 引流模态框 =================
    const redirectDialog = document.createElement('div');
    redirectDialog.innerHTML = `
    <!-- 引流 -->
    <!-- Pay QR Code Modal -->
    <div class="modal fade" id="payModal" tabindex="-1" aria-labelledby="payModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="payModalLabel">二维码</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="text-center">
              <img src="static/gzh.jpg" alt="Pay QR Code" class="img-fluid" style="max-width: 200px;">
              <p>群聊：入群请遵守群规定，人不求多，精品为主。不一定会一直开放，且珍惜！</p>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">关闭</button>
          </div>
        </div>
      </div>
    </div>
    `
    document.body.appendChild(redirectDialog);
    
}
  
document.addEventListener('DOMContentLoaded', init_dialogs);