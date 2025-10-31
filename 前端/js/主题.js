// 主题切换功能
export function toggleTheme() {
  document.body.classList.toggle('dark-theme');
  // 保存主题偏好到本地存储
  const isDark = document.body.classList.contains('dark-theme');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

// 页面加载时恢复主题偏好
export function restoreTheme() {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  // 如果用户有保存的偏好，使用保存的偏好；否则使用系统偏好
  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    document.body.classList.add('dark-theme');
  }
}