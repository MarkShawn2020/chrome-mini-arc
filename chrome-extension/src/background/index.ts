import 'webextension-polyfill';
import { exampleThemeStorage } from '@extension/storage';

/**
 * 复制当前标签页的URL和标题到剪贴板
 */
async function copyUrlAndTitle() {
  try {
    // 获取当前激活的标签页
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab || !tab.url || !tab.title) {
      console.error('无法获取当前标签页信息');
      return;
    }

    // 格式化为 Markdown 链接格式
    const textToCopy = `[${tab.title}](${tab.url})`;

    // 写入剪贴板
    await navigator.clipboard.writeText(textToCopy);

    // 可选：显示通知提示用户已复制
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icon-128.png',
      title: '已复制',
      message: '页面标题和链接已复制到剪贴板',
    });
  } catch (error) {
    console.error('复制失败:', error);
  }
}

/**
 * 切换便携搜索框的显示/隐藏
 */
async function togglePortableSearch() {
  try {
    // 获取当前激活的标签页
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab || !tab.id) {
      console.error('无法获取当前标签页信息');
      return;
    }

    // 向内容脚本发送消息，通知切换搜索框显示状态
    chrome.tabs.sendMessage(tab.id, { action: 'toggle-portable-search' });
  } catch (error) {
    console.error('切换搜索框失败:', error);
  }
}

// 监听命令
chrome.commands.onCommand.addListener(command => {
  if (command === 'copy-url-title') {
    copyUrlAndTitle();
  } else if (command === 'toggle-portable-search') {
    togglePortableSearch();
  }
});

exampleThemeStorage.get().then(theme => {
  console.log('theme', theme);
});

console.log('Arc Mini Background loaded');
console.log("Edit 'chrome-extension/src/background/index.ts' and save to reload.");
