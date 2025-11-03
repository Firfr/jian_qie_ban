// 导入各个功能模块
import { toggleTheme, restoreTheme } from './主题.js';
import { 从本地存储恢复列表, 保存数据到本地存储, 获取本地存储的数据 } from './存储.js';
import { 更新列表, 更新标题颜色 } from './界面.js';
import { 初始化WebSocket, 发送WebSocket消息 } from './网络连接.js';
import { 删除内容 } from './工具.js';
import { 复制内容 } from './剪切板写入.js';

// 全局变量
let _已显示本地数据 = false;

// 初始化应用
function 初始化应用() {
  // 等待DOM完全加载
  if (document.readyState !== 'complete') {
    window.addEventListener('load', () => {
      setTimeout(() => 执行初始化(), 100);
    });
  } else {
    setTimeout(() => 执行初始化(), 100);
  }
}

// 执行初始化
function 执行初始化() {
  // 恢复主题设置
  restoreTheme();
  
  // 从本地存储恢复列表
  从本地存储恢复列表((items) => {
    更新列表(items, 保存数据到本地存储);
  }, (status) => {
    _已显示本地数据 = status;
  });
  
  // 初始化WebSocket连接
  setTimeout(() => {
    初始化WebSocket(
      (items) => 更新列表(items, 保存数据到本地存储),
      (isConnected) => 更新标题颜色(isConnected),
      获取本地存储的数据,
      (status) => { _已显示本地数据 = status; }
    );
  }, 100); // 延迟100ms初始化WebSocket，确保本地数据优先显示
  
  // 添加保存按钮点击事件
  const 保存按钮 = document.getElementById('id_保存按钮');
  const 输入框 = document.getElementById('id_输入框');
  
  if (保存按钮 && 输入框) {
    保存按钮.onclick = () => {
      const 内容 = 输入框.value.trim();
      if (内容) {
        // 发送添加内容的WebSocket消息
        发送WebSocket消息({ type: 'add', content: 内容 });
        // 清空输入框
        输入框.value = '';
        // 聚焦回输入框，方便连续输入
        输入框.focus();
      }
    };
    
    // 添加回车键快捷保存功能
    输入框.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        保存按钮.click();
      }
    });
  }
}

// 导出全局函数供HTML直接调用
window.toggleTheme = toggleTheme;
window.复制内容 = 复制内容;
window.删除内容 = 删除内容;
window.updateList = 更新列表; // 暴露更新列表函数供工具.js调用

// 启动应用
初始化应用();

// 导出主要函数供调试使用
export { 初始化应用, 初始化WebSocket, 更新列表 };