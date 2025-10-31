import fs from 'fs';
import { 广播消息 } from './WebSocket处理.js';

// 开发模式文件监控功能
export function 启用文件监控(目录列表) {
  const 监控扩展名 = ['.html', '.css', '.js'];
  let 上次刷新时间 = 0;
  const 刷新节流毫秒 = 100; // 节流时间，避免频繁刷新
  
  console.log('开发模式：启用文件监控自动刷新功能');
  
  // 递归监控目录
  function 监控目录(目录) {
    try {
      fs.watch(目录, { recursive: true }, (事件类型, 文件名) => {
        // 检查文件扩展名
        if (文件名 && 监控扩展名.some(扩展名 => 文件名.endsWith(扩展名))) {
          const 现在 = Date.now();
          // 节流，避免频繁刷新
          if (现在 - 上次刷新时间 > 刷新节流毫秒) {
            上次刷新时间 = 现在;
            console.log(`检测到文件变化: ${文件名}，通知客户端刷新页面`);
            // 向所有客户端发送刷新命令
            广播消息({ type: 'refresh' });
          }
        }
      });
    } catch (error) {
      console.error('文件监控失败:', error);
    }
  }
  
  // 开始监控所有指定目录
  目录列表.forEach(目录 => {
    监控目录(目录);
  });
}