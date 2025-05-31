import 'webextension-polyfill';
import { exampleThemeStorage, copyFormatStorage } from '@extension/storage';
import type { CopyFormatStateType } from '@extension/storage';

/**
 * 通用的复制函数，在标签页中执行复制操作
 */
async function copyToClipboard(text: string, tabId: number, notificationMessage: string) {
  try {
    // 通过在标签页中执行脚本来复制文本
    await chrome.scripting.executeScript({
      target: { tabId },
      func: text => {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        return true;
      },
      args: [text],
    });

    // 显示通知提示用户已复制
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icon-128.png',
      title: '已复制',
      message: notificationMessage,
    });

    return true;
  } catch (error) {
    console.error('复制失败:', error);
    return false;
  }
}

// 移除 applyTemplate 函数，直接在 copyUrlAndTitle 中实现模板替换逻辑

/**
 * 只复制当前标签页的URL
 */
async function copyUrl() {
  try {
    // 获取当前激活的标签页
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab || !tab.url || !tab.id) {
      console.error('无法获取当前标签页信息');
      return;
    }

    await copyToClipboard(tab.url, tab.id, '页面链接已复制到剪贴板');
  } catch (error) {
    console.error('复制URL失败:', error);
  }
}

/**
 * 复制当前标签页的URL和标题到剪贴板
 */
async function copyUrlAndTitle() {
  try {
    // 获取当前激活的标签页
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab || !tab.url || !tab.title || !tab.id) {
      console.error('无法获取当前标签页信息');
      return;
    }

    // 获取最新的复制格式设置
    const copyFormat = await copyFormatStorage.get();

    console.log('[Arc Mini] 当前复制格式设置:', {
      formatType: copyFormat.titleUrlFormat,
      plainTextSeparator: copyFormat.plainTextSeparator,
      template: copyFormat.templates[copyFormat.titleUrlFormat],
    });

    // 输入数据
    const data = {
      title: tab.title,
      url: tab.url,
    };

    // 生成最终复制内容
    let textToCopy = '';
    const formatType = copyFormat.titleUrlFormat as 'plain' | 'markdown' | 'html' | 'csv';
    const separator = copyFormat.plainTextSeparator || ' ';

    // 根据不同格式处理
    switch (formatType) {
      case 'plain':
        // 纯文本格式 - 直接使用分隔符连接
        textToCopy = `${data.title}${separator}${data.url}`;
        console.log('[Arc Mini] 纯文本格式使用分隔符:', JSON.stringify(separator));
        break;

      case 'markdown':
        textToCopy = `[${data.title}](${data.url})`;
        break;

      case 'html':
        textToCopy = `<a href="${data.url}">${data.title}</a>`;
        break;

      case 'csv':
        textToCopy = `"${data.title}","${data.url}"`;
        break;

      default:
        // 默认回退到确保安全处理
        textToCopy = `${data.title} ${data.url}`;
        break;
    }

    console.log('[Arc Mini] 最终复制内容:', textToCopy);

    // 复制到剪贴板
    await copyToClipboard(textToCopy, tab.id, '页面标题和链接已复制到剪贴板');
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
  console.log('[Arc Mini] 快捷键命令被触发:', command);

  if (command === 'copy-url') {
    console.log('[Arc Mini] 正在执行复制 URL...');
    copyUrl();
  } else if (command === 'copy-url-title') {
    console.log('[Arc Mini] 正在执行复制 URL 和标题...');
    copyUrlAndTitle();
  } else if (command === 'toggle-portable-search') {
    console.log('[Arc Mini] 正在切换便携搜索框...');
    togglePortableSearch();
  } else {
    console.log('[Arc Mini] 未知命令:', command);
  }
});

// 注册服务工作线程启动时的日志
const printCommands = async () => {
  try {
    const commands = await chrome.commands.getAll();
    console.log('[Arc Mini] 已注册的快捷键命令:', commands);
  } catch (error) {
    console.error('[Arc Mini] 获取快捷键命令列表失败:', error);
  }
};

printCommands();

exampleThemeStorage.get().then(theme => {
  console.log('theme', theme);
});

console.log('Arc Mini Background loaded');
console.log("Edit 'chrome-extension/src/background/index.ts' and save to reload.");
