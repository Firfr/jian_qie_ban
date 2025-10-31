import WebSocket from 'ws';
import { 读取数据, 更新数据并调度写入, 清理过期数据 } from './数据处理.js';
import { 获取配置 } from './获取配置.js';

// 获取配置中的MAX_AGE
const { MAX_AGE: 最大保存时间 } = 获取配置();
const MAX_AGE = 最大保存时间;

// WebSocket连接集合
const 客户端集合 = new Set();

// 广播消息给所有客户端
export function 广播消息(消息) {
  const 数据 = JSON.stringify(消息);
  客户端集合.forEach(客户端 => {
    if (客户端.readyState === WebSocket.OPEN) {
      客户端.send(数据);
    }
  });
}

// 处理WebSocket连接
export function 处理WebSocket连接(ws, req, 数据文件路径, MAX_ITEMS, MAX_CHANGES, MIN_INTERVAL) {
  const 客户端IP = req.socket.remoteAddress;
  console.log(`新的连接: ${客户端IP}`);
  
  // 添加到客户端集合
  客户端集合.add(ws);
  
  // 发送当前数据给新连接的客户端
  const 当前数据 = 读取数据(数据文件路径);
  ws.send(JSON.stringify({ type: 'init', content: 当前数据 }));
  
  // 处理消息
  ws.on('message', (消息) => {
    try {
      const 数据 = JSON.parse(消息);
      const 客户端IP = req.socket.remoteAddress;
      
      // 获取设备标识（使用IP作为设备标识）
      const 设备信息 = `设备 ${客户端IP}`;
      
      if (数据.type === 'add') {
        const 现在 = new Date().toISOString();
        const 要添加的内容 = 数据.content;
        
        let 条目列表 = 读取数据(数据文件路径);
        
        // 检查是否存在重复内容
        const 已存在索引 = 条目列表.findIndex(item => item.content === 要添加的内容);
        
        if (已存在索引 !== -1) {
          // 如果存在重复内容，更新时间戳
          const 已存在内容 = 条目列表[已存在索引].content;
          console.log(`${设备信息} 更新 ${已存在内容}`);
          条目列表[已存在索引].time = 现在;
          条目列表[已存在索引].ip = 客户端IP;
          
          // 将更新后的项移到列表开头
          const 更新后的项 = 条目列表.splice(已存在索引, 1)[0];
          条目列表.unshift(更新后的项);
        } else {
          // 如果不存在重复内容，添加新条目
          console.log(`${设备信息} 增加 ${要添加的内容}`);
          const 新条目 = {
            time: 现在,
            ip: 客户端IP,
            content: 要添加的内容
          };
          条目列表.unshift(新条目);
        }
        
        // 清理过期数据
        条目列表 = 清理过期数据(条目列表, MAX_AGE);
        
        // 限制数量
        if (条目列表.length > MAX_ITEMS) {
          条目列表 = 条目列表.slice(0, MAX_ITEMS);
        }
        
        // 更新内存数据并智能调度写入
          更新数据并调度写入(条目列表, MAX_CHANGES, MIN_INTERVAL, 数据文件路径);
          广播消息({ type: 'update', content: 条目列表 });
          
        } else if (数据.type === 'delete') {
          // 删除内容
          let 条目列表 = 读取数据(数据文件路径);
          // 查找要删除的内容
          const 要删除的条目 = 条目列表.find(item => item.time === 数据.time);
          if (要删除的条目) {
            console.log(`${设备信息} 删除 ${要删除的条目.content}`);
          }
          条目列表 = 条目列表.filter(item => item.time !== 数据.time);
          // 更新内存数据并智能调度写入
          更新数据并调度写入(条目列表, MAX_CHANGES, MIN_INTERVAL, 数据文件路径);
          广播消息({ type: 'update', content: 条目列表 });
      }
    } catch (error) {
      console.error('处理消息失败:', error);
    }
  });
  
  // 处理断开连接
  ws.on('close', () => {
    console.log(`连接断开: ${客户端IP}`);
    客户端集合.delete(ws);
  });
  
  // 处理错误
  ws.on('error', (error) => {
    console.error('WebSocket错误:', error);
  });
}

// 获取客户端数量
export function 获取客户端数量() {
  return 客户端集合.size;
}