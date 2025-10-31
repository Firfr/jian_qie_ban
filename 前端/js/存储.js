// 本地存储操作相关功能

// 从本地存储恢复列表
export function 从本地存储恢复列表(updateListCallback, setLocalDataDisplayedCallback) {
  // 兼容性优化：使用try-catch包裹整个localStorage操作
  try {
    // 确保localStorage可用
    if (typeof localStorage !== 'undefined') {
      const savedItems = localStorage.getItem('clipboardItems');
      
      if (savedItems) {
        try {
          const items = JSON.parse(savedItems);
          // 立即显示本地数据，不需要检查连接状态
          updateListCallback(items);
          // 标记已经显示了本地数据，用于后续WebSocket消息处理
          setLocalDataDisplayedCallback(true);
        } catch (e) {
          console.error('解析本地存储数据失败:', e);
        }
      }
    }
  } catch (e) {
    console.error('访问本地存储失败:', e);
  }
}

// 保存数据到本地存储
export function 保存数据到本地存储(items) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('clipboardItems', JSON.stringify(items));
    }
  } catch (e) {
    console.error('保存数据到本地存储失败:', e);
  }
}

// 获取本地存储的数据
export function 获取本地存储的数据() {
  try {
    if (typeof localStorage !== 'undefined') {
      const savedItems = localStorage.getItem('clipboardItems');
      if (savedItems) {
        return JSON.parse(savedItems);
      }
    }
  } catch (e) {
    console.error('获取本地存储数据失败:', e);
  }
  return null;
}