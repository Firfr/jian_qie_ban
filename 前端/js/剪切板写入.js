// 复制内容到剪贴板
async function fn剪切板写入(txt) {
  console.log("开始向剪切板写入内容",txt);
  
  // 检测是否支持 navigator.clipboard.writeText
  if (navigator.clipboard && window.isSecureContext) {
    // 使用现代 Clipboard API
    try {
      await navigator.clipboard.writeText(txt);
      console.log('使用现代 Clipboard API 已复制到剪贴板');
      return; // 成功时返回
    } catch (error) {
      console.error('使用现代 Clipboard API 复制失败:', error);
      throw error; // 失败时抛出错误
    }
  } else {
    // 使用传统方法作为降级方案
    return new Promise((resolve, reject) => {
      try {
        const textArea = document.createElement("textarea");
        textArea.value = txt;
        
        // 隐藏元素
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        textArea.style.opacity = "0";
        textArea.style.pointerEvents = "none";
        
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        // 执行复制命令
        const successful = document.execCommand('copy');
        
        // 清理临时元素
        document.body.removeChild(textArea);
        
        if (successful) {
          console.log('使用传统方法作为降级方案 已复制到剪贴板');
          resolve(); // 成功时 resolve
        } else {
          console.error('复制失败');
          reject(new Error('使用传统方法作为降级方案 复制命令执行失败'));
        }
      } catch (error) {
        console.error('复制失败:', error);
        // 确保清理元素
        if (document.body.contains(textArea)) {
          document.body.removeChild(textArea);
        }
        reject(error); // 失败时 reject
      }
    });
  }
}

export function 复制内容(内容, 按钮元素) {
  const _按钮 = 按钮元素;
  const _原文本 = _按钮?.textContent || '📋';

  console.log('需要复制内容:', 内容);
  
  fn剪切板写入(内容).then(() => {
    // 显示复制成功提示
    if (_按钮) {
      _按钮.textContent = '✅';
      _按钮.style.backgroundColor = '#4CAF50';
      
      setTimeout(() => {
        _按钮.textContent = _原文本;
        _按钮.style.backgroundColor = '';
      }, 1500);
    }
  }).catch(err => {
    console.error('复制失败:', err);
    if (_按钮) {
      _按钮.textContent = '❌';
      _按钮.style.backgroundColor = '#f44336';
      
      setTimeout(() => {
        _按钮.textContent = _原文本;
        _按钮.style.backgroundColor = '';
      }, 1500);
    }
  });
}