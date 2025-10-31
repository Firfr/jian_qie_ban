// WebSocket连接管理功能

let ws = null;
let isConnecting = false;
let lastMessageData = null;

// 初始化WebSocket连接
export function 初始化WebSocket(updateListCallback, updateTitleColorCallback, getLocalStorageDataCallback, setLocalDataDisplayedCallback) {
  // 避免重复连接
  if (ws?.readyState === WebSocket.OPEN || isConnecting) {
    return;
  }
  
  isConnecting = true;
  
  // 根据当前页面协议选择ws或wss
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}/ws`;
  
  try {
    ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log('WebSocket 连接已建立');
      isConnecting = false;
      updateTitleColorCallback(true);
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // 验证数据格式
        if (!data || typeof data !== 'object') {
          console.error('收到的消息数据格式无效');
          return;
        }
        
        // 智能处理：避免重复刷新页面
        if (data.type === 'refresh' && lastMessageData && 
            JSON.stringify(lastMessageData.content) === JSON.stringify(data.content)) {
          return; // 内容相同，跳过刷新
        }
        
        // 更新最近消息数据
        lastMessageData = data;
        
        // 处理不同类型的消息
        if (data.type === 'init' || data.type === 'update') {
          // 数据有效性检查
          if (!Array.isArray(data.content)) {
            console.error('收到的数据不是数组格式');
            return;
          }
          
          // 微任务延迟执行，确保本地数据优先显示
          setTimeout(() => {
            // 获取本地存储的数据进行比较
            const localData = getLocalStorageDataCallback();
            
            // 如果本地数据已经显示，并且新数据长度与本地数据相同且没有更新，跳过更新
            if (localData && localData.length === data.content.length) {
              let hasNewContent = false;
              for (let i = 0; i < data.content.length; i++) {
                if (!localData.find(item => item.time === data.content[i].time)) {
                  hasNewContent = true;
                  break;
                }
              }
              if (!hasNewContent) {
                return; // 没有新内容，跳过更新
              }
            }
            
            updateListCallback(data.content);
          }, 0);
        } else if (data.type === 'refresh') {
          // 页面刷新指令
          window.location.reload();
        }
      } catch (e) {
        console.error('处理WebSocket消息时出错:', e);
      }
    };
    
    ws.onclose = () => {
      console.log('WebSocket 连接已关闭');
      ws = null;
      isConnecting = false;
      updateTitleColorCallback(false);
      
      // 设置断开重连，但不立即重连以避免频繁尝试
      setTimeout(() => {
        初始化WebSocket(updateListCallback, updateTitleColorCallback, getLocalStorageDataCallback, setLocalDataDisplayedCallback);
      }, 3000); // 3秒后尝试重连
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket 错误:', error);
      isConnecting = false;
    };
  } catch (e) {
    console.error('创建WebSocket连接时出错:', e);
    isConnecting = false;
    updateTitleColorCallback(false);
    
    // 错误后也尝试重连
    setTimeout(() => {
      初始化WebSocket(updateListCallback, updateTitleColorCallback, getLocalStorageDataCallback, setLocalDataDisplayedCallback);
    }, 3000);
  }
}

// 发送数据到WebSocket
export function 发送WebSocket消息(message) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    try {
      ws.send(JSON.stringify(message));
      return true;
    } catch (e) {
      console.error('发送WebSocket消息失败:', e);
      return false;
    }
  }
  return false;
}

// 关闭WebSocket连接
export function 关闭WebSocket() {
  if (ws) {
    ws.close();
    ws = null;
  }
}