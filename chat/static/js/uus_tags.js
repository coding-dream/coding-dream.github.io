
  function copyImagePrompt() {
    const inputPrompt = document.getElementById('input-prompt');
    inputPrompt.select();
    document.execCommand('copy');
    // 弹出提示已复制
    toast('已复制: ' + inputPrompt.value);
  }

  function init_tag_click_event() {
        // 获取所有标签按钮
        const tagButtons = document.querySelectorAll('.tag-button');
        // 获取输入框元素
        const inputPrompt = document.getElementById('input-prompt');
    
        // 定义一个用于存储标签权重的对象
        const tagWeights = {};
    
        // 为每个标签按钮添加点击事件
        tagButtons.forEach(tagButton => {
          tagButton.addEventListener('click', function() {
            const tagTextZh = tagButton.textContent.trim();
            const tagText = tagButton.dataset.nameEn.trim();
    
            // 更新标签权重
            if (!tagWeights[tagText]) {
              tagWeights[tagText] = 1;
            } else {
              tagWeights[tagText] += 0.1;
            }
    
            // 构建权重标签文本
            let weightedTagText;
            if (tagWeights[tagText] > 1) {
              weightedTagText = `(${tagText}:${tagWeights[tagText].toFixed(1)})`;
            } else {
              weightedTagText = tagText;
            }
    
            // 替换或追加标签文本
            const tagRegExp = new RegExp(`\\(${tagText}:\\d\\.\\d\\)|${tagText}`, 'g');
            if (inputPrompt.value.match(tagRegExp)) {
              inputPrompt.value = inputPrompt.value.replace(tagRegExp, weightedTagText);
            } else {
              inputPrompt.value += inputPrompt.value ? ', ' + weightedTagText : weightedTagText;
            }
          });
        });
  }
