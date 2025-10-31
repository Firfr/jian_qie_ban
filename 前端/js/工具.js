// 工具函数

// 复制内容到剪贴板
export function 复制内容(内容) {
  const _按钮 = event?.target;
  const _原文本 = _按钮?.textContent || '📋';
  
  navigator.clipboard.writeText(内容).then(() => {
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

// 导入WebSocket发送函数
import { 发送WebSocket消息 } from './网络连接.js';

// 删除内容
export function 删除内容(时间戳) {
  try {
    // 获取当前列表数据
    let items = [];
    if (typeof localStorage !== 'undefined') {
      const savedItems = localStorage.getItem('clipboardItems');
      if (savedItems) {
        items = JSON.parse(savedItems);
      }
    }
    
    // 过滤掉要删除的项
    const newItems = items.filter(item => item.time !== 时间戳);
    
    // 保存回本地存储
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('clipboardItems', JSON.stringify(newItems));
    }
    
    // 发送删除消息到服务器（使用导入的发送函数）
    const 删除消息 = {
      type: 'delete',
      time: 时间戳
    };
    发送WebSocket消息(删除消息);
    
    // 立即更新UI，而不等待服务器响应
    // 由于更新列表函数在入口.js中导入，这里我们不能直接调用
    // 但我们可以触发UI重新渲染，通过获取列表DOM并重新应用新数据
    const 列表元素 = document.getElementById('id_列表');
    if (列表元素) {
      // 创建临时的更新列表函数调用
      if (window.updateList) {
        window.updateList(newItems, (itemsToSave) => {
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('clipboardItems', JSON.stringify(itemsToSave));
          }
        });
      }
    }
    
    return newItems;
  } catch (e) {
    console.error('删除内容时出错:', e);
    return [];
  }
}

// 格式化时间
export function 格式化时间(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleString();
}

// 检查是否为空对象
export function 是否为空对象(obj) {
  return obj && typeof obj === 'object' && Object.keys(obj).length === 0;
}