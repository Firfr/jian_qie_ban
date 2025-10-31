// 项目主入口文件 (使用ES模块语法，兼容Bun)
import server from './后端/服务器.js';

// 启动服务器
console.log('正在启动局域网剪切板服务器...');

// 确保服务器可以正确提供前端文件
// server.js已经配置了静态文件服务，指向'../前端'目录

console.log('或使用您的局域网IP地址访问');

export default server; // 导出服务器实例，便于测试或其他模块使用