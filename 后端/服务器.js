import express from 'express';
import http from 'http';
import WebSocket from 'ws';
import path from 'path';
import { 获取配置, 输出环境变量信息 } from './获取配置.js';
import { 获取本机IP } from './工具函数.js';
import { 读取数据, 定期写入数据, 进程退出写入数据, 初始化数据文件 } from './数据处理.js';
import { 处理WebSocket连接 } from './WebSocket处理.js';
import { 启用文件监控 } from './文件监控.js';

// 创建Express应用
const app = express();
const server = http.createServer(app);

// 获取配置
const 配置 = 获取配置();
const { MAX_ITEMS: 最大条目数, MAX_AGE: 最大保存时间, WRITE_INTERVAL: 写入间隔, isDocker } = 配置;
// 重新赋值给英文变量以便兼容现有代码
const MAX_ITEMS = 最大条目数;
const MAX_AGE = 最大保存时间;
const WRITE_INTERVAL = 写入间隔;

// 优化的IO配置
const { 最大变更次数: MAX_CHANGES, 最小间隔: MIN_INTERVAL, 强制写入: FORCE_WRITE } = 配置;

// 根据是否在Docker环境中设置不同的数据文件路径
let 数据文件路径;
if (isDocker) {
  数据文件路径 = '/data/剪切板内容.txt';
} else {
  数据文件路径 = path.join(__dirname, '../data/剪切板内容.txt');
}

//确保数据文件路径存在
import fs from 'fs';

// 确保数据文件的目录存在
const 数据目录 = path.dirname(数据文件路径);
if (!fs.existsSync(数据目录)) {
  try {
    fs.mkdirSync(数据目录, { recursive: true });
    console.log(`已创建数据目录: ${数据目录}`);
  } catch (error) {
    console.error(`创建数据目录失败: ${error.message}`);
  }
}

// 确保数据文件存在
if (!fs.existsSync(数据文件路径)) {
  try {
    fs.writeFileSync(数据文件路径, '\n'); // 初始化为空换行
    console.log(`已创建数据文件: ${数据文件路径}`);
  } catch (error) {
    console.error(`创建数据文件失败: ${error.message}`);
  }
}

console.log(`服务器运行在${isDocker ? 'Docker' : '非Docker'}环境，数据文件路径: ${数据文件路径}`);

// 创建WebSocket服务器
const wss = new WebSocket.Server({ server });

// 处理WebSocket连接
wss.on('connection', (ws, req) => {
  处理WebSocket连接(ws, req, 数据文件路径, MAX_ITEMS, MAX_CHANGES, MIN_INTERVAL);
});

// 静态文件服务 - 指向项目根目录下的前端文件夹
app.use(express.static(path.join(__dirname, '../前端')));

// 启动服务器
const { PORT: 端口 } = 配置;
server.listen(端口, () => {
  const 本机IP = 获取本机IP();
  console.log(`服务器启动在 http://${本机IP}:${端口}`);
  console.log(`其他设备可以通过 http://${本机IP}:${端口} 访问`);
  
  // 输出所有环境变量信息
  输出环境变量信息(配置);
  
  console.log(`最大保存条数: ${MAX_ITEMS}`);
  console.log(`最长保存时间: ${MAX_AGE ? `${MAX_AGE}小时` : '不限'}`);
  console.log(`数据写入间隔: ${WRITE_INTERVAL}分钟`);
  
  // 设置定时写入，确保使用有效数字
  const 写入间隔毫秒 = (typeof WRITE_INTERVAL === 'number' && !isNaN(WRITE_INTERVAL)) ? WRITE_INTERVAL * 60 * 1000 : 10 * 60 * 1000;
  setInterval(() => 定期写入数据(数据文件路径, FORCE_WRITE), 写入间隔毫秒);
});

// 确保在进程退出时写入数据
process.on('SIGINT', () => {
  进程退出写入数据(数据文件路径);
  process.exit(0);
});

process.on('SIGTERM', () => {
  进程退出写入数据(数据文件路径);
  process.exit(0);
});

// 初始化数据
读取数据(数据文件路径);

// 确保数据文件存在
初始化数据文件(数据文件路径);

// 开发环境下监控文件变化，通知客户端刷新页面
const 开发模式 = true; // 强制启用开发模式，确保热重载正常工作
if (开发模式) {
  // 开始监控 - 同时监控后端和前端目录
  启用文件监控([__dirname, path.join(__dirname, '../前端')]);
}

// 导出服务器实例，使其他模块可以导入
export default server;