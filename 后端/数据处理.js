import fs from 'fs';
import path from 'path';

// 内存中的数据缓冲区
let 数据缓冲区 = null;

// IO优化变量
let 变更计数器 = 0; // 变更计数器
let 上次写入时间 = 0; // 上次写入时间
let 数据已修改 = false; // 数据是否已修改
let 已调度写入 = false; // 是否已调度写入任务

// 读取数据函数
export function 读取数据(数据文件路径) {
  // 优先从内存缓冲区读取数据
  if (数据缓冲区 !== null) {
    return [...数据缓冲区];
  }
  
  try {
    if (!fs.existsSync(数据文件路径)) {
      数据缓冲区 = [];
      return [];
    }
    const 数据 = fs.readFileSync(数据文件路径, 'utf8');
    const 解析后数据 = 数据.trim() ? 数据.split('\n').map(line => {
      const 部分 = line.split(' ', 2);
      const 内容 = line.substring(部分[0].length + 部分[1].length + 2);
      return {
        time: 部分[0],
        ip: 部分[1],
        content: 内容
      };
    }) : [];
    数据缓冲区 = 解析后数据;
    上次写入时间 = Date.now(); // 更新上次写入时间
    return [...解析后数据];
  } catch (error) {
    console.error('读取数据失败:', error);
    数据缓冲区 = [];
    return [];
  }
}

// 实际写入数据函数（优化版）
export function 实际写入数据(数据文件路径, 强制写入 = false) {
  // 如果没有数据变更且不是强制写入，则跳过
  if (!数据已修改 && !强制写入) {
    return false;
  }
  
  try {
    const 内容 = 数据缓冲区.map(item => `${item.time} ${item.ip} ${item.content}`).join('\n');
    fs.writeFileSync(数据文件路径, 内容, 'utf8');
    console.log(`数据已写入文件，共${数据缓冲区.length}条记录`);
    
    // 重置状态
    变更计数器 = 0;
    上次写入时间 = Date.now();
    数据已修改 = false;
    已调度写入 = false;
    return true;
  } catch (error) {
    console.error('写入数据失败:', error);
    return false;
  }
}

// 更新内存数据并调度写入（优化版）
export function 更新数据并调度写入(新数据, MAX_CHANGES, MIN_INTERVAL, 数据文件路径) {
  // 更新内存缓冲区
  数据缓冲区 = 新数据;
  
  // 标记数据已修改
  数据已修改 = true;
  变更计数器++;
  
  const 现在 = Date.now();
  const 距离上次写入时间 = 现在 - 上次写入时间;
  
  // 立即写入的条件：
  // 1. 变更次数达到阈值
  // 2. 距离上次写入时间超过最小间隔且有数据变更
  // 3. 但不要过于频繁写入
  if ((变更计数器 >= MAX_CHANGES || 距离上次写入时间 >= MIN_INTERVAL) && !已调度写入) {
    // 立即写入
    实际写入数据(数据文件路径);
  } else if (数据已修改 && !已调度写入) {
    // 调度延迟写入，确保数据最终会被写入
    已调度写入 = true;
    setTimeout(() => {
      if (数据已修改) {
        实际写入数据(数据文件路径);
      }
    }, MIN_INTERVAL);
  }
}

// 定期写入数据函数（作为安全网）
export function 定期写入数据(数据文件路径, FORCE_WRITE) {
  if (数据已修改 && 数据缓冲区 && 数据缓冲区.length > 0) {
    console.log(`执行定期写入（安全网）`);
    实际写入数据(数据文件路径, true); // 强制写入
  }
}

// 清理过期数据
export function 清理过期数据(数据, MAX_AGE) {
  if (!MAX_AGE) {
    return 数据;
  }
  const 现在 = Date.now();
  const 最大存活毫秒 = MAX_AGE * 60 * 60 * 1000;
  return 数据.filter(item => 现在 - new Date(item.time) < 最大存活毫秒);
}

// 初始化数据文件
export function 初始化数据文件(数据文件路径) {
  // 确保数据文件存在
  if (!fs.existsSync(数据文件路径)) {
    // 确保目录存在
    const 目录 = path.dirname(数据文件路径);
    if (!fs.existsSync(目录)) {
      fs.mkdirSync(目录, { recursive: true });
    }
    fs.writeFileSync(数据文件路径, '', 'utf8');
  }
}

// 进程退出时写入数据
export function 进程退出写入数据(数据文件路径) {
  console.log('进程即将退出，执行最后一次数据写入...');
  if (数据已修改) {
    实际写入数据(数据文件路径, true); // 强制写入
  }
}