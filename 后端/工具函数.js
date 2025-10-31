import os from 'os';

// 获取本机IP地址
export function 获取本机IP() {
  const interfaces = os.networkInterfaces();
  let _ip地址 = 'localhost';
  
  // 遍历所有网络接口
  for (const _接口名 in interfaces) {
    const _接口 = interfaces[_接口名];
    
    for (const _配置 of _接口) {
      // 跳过IPv6和内部地址
      if (_配置.family === 'IPv4' && !_配置.internal) {
        _ip地址 = _配置.address;
        return _ip地址;
      }
    }
  }
  
  return _ip地址;
}