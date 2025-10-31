// UI渲染和更新功能

// 更新列表
export function 更新列表(items, saveToStorageCallback) {
  const _列表 = document.getElementById('id_列表');
  
  // 保存到本地存储，便于断开连接后恢复显示
  saveToStorageCallback(items);
  
  if (items.length === 0) {
    _列表.innerHTML = '<div class="空提示">暂无内容</div>';
    return;
  }
  
  // 确保按时间降序排序（最新的内容在前面）
  const sortedItems = [...items].sort((a, b) => new Date(b.time) - new Date(a.time));
  
  _列表.innerHTML = '';
  
  sortedItems.forEach((item, index) => {
    const _条目 = document.createElement('div');
    _条目.className = '条目';
    
    // 添加序号显示（最新的内容序号最大）
    const _序号 = document.createElement('span');
    _序号.className = '序号';
    _序号.textContent = `${sortedItems.length - index}.`;
    
    const _删除按钮 = document.createElement('button');
    _删除按钮.className = '删除按钮';
    _删除按钮.textContent = '🗑️';
    _删除按钮.title = '删除内容';
    _删除按钮.onclick = () => 删除内容(item.time);
    
    const _内容 = document.createElement('div');
    _内容.className = '内容';
    _内容.textContent = item.content;
    
    const _复制按钮 = document.createElement('button');
    _复制按钮.className = '复制按钮';
    _复制按钮.textContent = '📋';
    _复制按钮.title = '复制内容';
    _复制按钮.onclick = () => 复制内容(item.content);
    
    _条目.appendChild(_序号);
    _条目.appendChild(_删除按钮);
    _条目.appendChild(_内容);
    _条目.appendChild(_复制按钮);
    
    _列表.appendChild(_条目);
  });
}

// 获取标题元素
export function 获取标题元素() {
  const _标题元素 = document.querySelector('h1[onclick="toggleTheme()"]');
  return _标题元素;
}

// 更新标题颜色
export function 更新标题颜色(是否连接中) {
  const _标题 = 获取标题元素();
  if (_标题) {
    _标题.style.color = 是否连接中 ? '' : '#ff0000'; // 连接断开时变红，连接时恢复默认颜色
  }
}

// 显示复制成功提示
export function 显示复制成功提示(_按钮, _原文本) {
  _按钮.textContent = '✅';
  _按钮.style.backgroundColor = '#4CAF50';
  
  setTimeout(() => {
    _按钮.textContent = _原文本;
    _按钮.style.backgroundColor = '';
  }, 1500);
}