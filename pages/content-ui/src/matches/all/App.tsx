import { t } from '@extension/i18n';
import { ToggleButton } from '@extension/ui';
import { useEffect, useState, useRef } from 'react';
import type { KeyboardEvent } from 'react';

// 便携搜索框组件
function PortableSearch({ isVisible, onClose }: { isVisible: boolean; onClose: () => void }) {
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isVisible && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isVisible]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
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
    console.log('[Arc Mini] Content UI loaded');

    // 监听来自背景脚本的消息
    const handleMessage = (message: any) => {
      if (message.action === 'toggle-portable-search') {
        setIsSearchVisible(prev => !prev);
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, []);

  return (
    <>
      <PortableSearch isVisible={isSearchVisible} onClose={() => setIsSearchVisible(false)} />
    </>
  );
}
