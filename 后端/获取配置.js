import fs from 'fs';

/**
 * 获取并解析所有环境变量配置
 * @returns {Object} 配置对象
 */
export function 获取配置() {
  // 基本配置
  const config = {
    MAX_ITEMS: process.env.MAX_ITEMS ? parseInt(process.env.MAX_ITEMS) : 1000,
    MAX_AGE: process.env.MAX_AGE ? parseInt(process.env.MAX_AGE) : null,
    WRITE_INTERVAL: process.env.WRITE_INTERVAL ? parseInt(process.env.WRITE_INTERVAL) : 10,
    PORT: process.env.PORT || 5159,
    NODE_ENV: process.env.NODE_ENV || 'development',
    
    // IO优化配置
    MAX_CHANGES: process.env.MAX_CHANGES ? parseInt(process.env.MAX_CHANGES) : 10,
    MIN_INTERVAL: process.env.MIN_INTERVAL ? parseInt(process.env.MIN_INTERVAL) : 30000,
    FORCE_WRITE: process.env.FORCE_WRITE === 'false' ? false : true,
    
    // Docker环境检测
    isDocker: isDockerEnvironment()
  };
  
  return config;
}

/**
 * 检测是否在Docker环境中运行
 * @returns {boolean} 是否在Docker环境
 */
function isDockerEnvironment() {
  return process.env.IN_DOCKER === 'true' || 
         process.env.DOCKER === 'true' ||
         // 检查是否存在Docker特征文件
         (() => {
           try {
             return fs.existsSync('/.dockerenv') || 
                    fs.readFileSync('/proc/1/cgroup', 'utf8').includes('docker');
           } catch (e) {
             return false;
           }
         })();
}

/**
 * 输出环境变量配置信息
 * @param {Object} config 配置对象
 */
export function 输出环境变量信息(config) {
  console.log('\n=== 环境变量配置 ===');
  console.log('MAX_ITEMS - 最大保存条数: ' + (process.env.MAX_ITEMS || '默认值 1000'));
  console.log('MAX_AGE - 最长保存时间(小时): ' + (process.env.MAX_AGE || '默认值 null(不限)'));
  console.log('WRITE_INTERVAL - 数据写入间隔(分钟): ' + (process.env.WRITE_INTERVAL || '默认值 10'));
  console.log('IN_DOCKER/DOCKER - Docker环境标识: ' + ((process.env.IN_DOCKER === 'true' || process.env.DOCKER === 'true') ? 'true' : 'false'));
  console.log('MAX_CHANGES - 累积变更阈值: ' + (process.env.MAX_CHANGES || '默认值 10'));
  console.log('MIN_INTERVAL - 最小写入间隔(毫秒): ' + (process.env.MIN_INTERVAL || '默认值 30000'));
  console.log('FORCE_WRITE - 连接关闭时是否强制写入: ' + (process.env.FORCE_WRITE !== undefined ? process.env.FORCE_WRITE : '默认值 true'));
  console.log('PORT - 服务器端口: ' + (process.env.PORT || '默认值 5159'));
  console.log('NODE_ENV - 运行环境: ' + (process.env.NODE_ENV || '未设置'));
  console.log('==================\n');
}