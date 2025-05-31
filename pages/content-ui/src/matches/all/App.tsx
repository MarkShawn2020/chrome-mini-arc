import { t } from '@extension/i18n';
import { ToggleButton } from '@extension/ui';
import { useEffect, useState, useRef } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';

// 便携搜索框组件
function PortableSearch({ isVisible, onClose }: { isVisible: boolean; onClose: () => void }) {
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isVisible && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isVisible]);

  const handleKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter') {
      if (searchTerm) {
        // 默认使用Google搜索
        window.open(`https://www.google.com/search?q=${encodeURIComponent(searchTerm)}`, '_blank');
        setSearchTerm('');
        onClose();
      }
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed left-1/2 top-1/4 z-[9999] -translate-x-1/2 transform">
      <div className="w-[600px] rounded-lg bg-white p-4 shadow-2xl dark:bg-gray-800 dark:text-white">
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入关键词进行搜索..."
          className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        />
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">按 Enter 搜索 · Esc 关闭</div>
      </div>
    </div>
  );
}

export default function App() {
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  useEffect(() => {
    console.log('[Arc Mini] Content UI loaded - 初始化便携搜索组件');

    // 尝试访问 chrome API，确认内容脚本权限
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      console.log('[Arc Mini] chrome.runtime API 可用');
    } else {
      console.error('[Arc Mini] chrome.runtime API 不可用!');
    }

    // 监听来自背景脚本的消息
    const handleMessage = (message: any, sender: any, sendResponse: any) => {
      console.log('[Arc Mini] 收到消息:', message, '来自:', sender);

      if (message.action === 'toggle-portable-search') {
        console.log('[Arc Mini] 切换搜索框显示状态');
        setIsSearchVisible(prev => {
          const newState = !prev;
          console.log('[Arc Mini] 搜索框新状态:', newState ? '显示' : '隐藏');
          return newState;
        });
        // 发送响应确认消息已处理
        sendResponse({ success: true });
        return true; // 保持消息通道开放
      }

      return false; // 默认返回值，如果没有处理消息
    };

    // 注册消息监听器
    console.log('[Arc Mini] 注册消息监听器');
    chrome.runtime.onMessage.addListener(handleMessage);

    // 我们不再使用内容脚本的键盘监听，而是完全依赖 Chrome 命令 API
    console.log('[Arc Mini] 使用官方 Chrome 命令 API 处理快捷键');

    return () => {
      console.log('[Arc Mini] 移除消息监听器');
      chrome.runtime.onMessage.removeListener(handleMessage);
      // 已移除键盘监听器
    };
  }, []);

  return (
    <>
      <PortableSearch isVisible={isSearchVisible} onClose={() => setIsSearchVisible(false)} />
    </>
  );
}
