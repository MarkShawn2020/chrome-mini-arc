import { copyFormatStorage } from '@extension/storage';
import { cn } from '@extension/ui';
import { useState, useEffect } from 'react';
import type { CopyFormatType } from '@extension/storage';

// 可读的格式名称映射
const FORMAT_NAMES: Record<CopyFormatType, string> = {
  plain: '纯文本',
  markdown: 'Markdown',
  html: 'HTML',
  csv: 'CSV',
};

// 格式示例
const FORMAT_EXAMPLES: Record<CopyFormatType, string> = {
  plain: '标题 https://example.com',
  markdown: '[标题](https://example.com)',
  html: '<a href="https://example.com">标题</a>',
  csv: '"标题","https://example.com"',
};

export function CopyFormatSettings({ isLight }: { isLight: boolean }) {
  const [formatType, setFormatType] = useState<CopyFormatType>('markdown');
  const [templates, setTemplates] = useState<Record<CopyFormatType, string>>({
    plain: '{title}{separator}{url}',
    markdown: '[{title}]({url})',
    html: '<a href="{url}">{title}</a>',
    csv: '"{title}","{url}"',
  });
  const [plainTextSeparator, setPlainTextSeparator] = useState(' '); // 默认空格分隔符

  // 从存储中加载设置
  useEffect(() => {
    copyFormatStorage.get().then(settings => {
      setFormatType(settings.titleUrlFormat);
      setTemplates(settings.templates);
      setPlainTextSeparator(settings.plainTextSeparator);
    });

    // 监听设置变化
    return copyFormatStorage.subscribe(settings => {
      setFormatType(settings.titleUrlFormat);
      setTemplates(settings.templates);
      setPlainTextSeparator(settings.plainTextSeparator);
    });
  }, []);

  // 更新复制格式
  const handleFormatChange = (format: CopyFormatType) => {
    setFormatType(format);
    copyFormatStorage.set(current => ({
      ...current,
      titleUrlFormat: format,
    }));
  };

  // 更新纯文本分隔符
  const handleSeparatorChange = (separator: string) => {
    setPlainTextSeparator(separator);
    copyFormatStorage.set(current => ({
      ...current,
      plainTextSeparator: separator,
    }));
  };

  // 格式化示例如果是纯文本格式
  const formatExampleText =
    formatType === 'plain' ? `标题${plainTextSeparator}https://example.com` : FORMAT_EXAMPLES[formatType];

  // 快捷键提示文本
  const shortcutText = (
    <div className="flex flex-col gap-1">
      <span>
        <kbd className="rounded bg-gray-200 px-1 py-0.5 dark:bg-gray-600">Alt+Y</kbd> 复制链接
      </span>

      <span>
        <kbd className="rounded bg-gray-200 px-1 py-0.5 dark:bg-gray-600">Alt+Shift+Y</kbd> 复制标题和链接
      </span>
    </div>
  );

  return (
    <div className={cn('mx-auto mt-4 w-full max-w-sm rounded-lg p-4 shadow-md', isLight ? 'bg-white' : 'bg-gray-700')}>
      <h3 className={cn('mb-2 font-medium', isLight ? 'text-gray-800' : 'text-gray-100')}>复制格式设置</h3>

      <div className="mb-2 break-words text-xs text-gray-500 dark:text-gray-400">{shortcutText}</div>

      <div className="mb-3 grid grid-cols-2 gap-2">
        {(Object.keys(FORMAT_NAMES) as Array<CopyFormatType>).map(format => (
          <button
            key={format}
            onClick={() => handleFormatChange(format)}
            className={cn(
              'rounded-md px-3 py-2 text-sm transition-all',
              format === formatType
                ? isLight
                  ? 'bg-blue-500 text-white'
                  : 'bg-blue-600 text-white'
                : isLight
                  ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  : 'bg-gray-600 text-gray-200 hover:bg-gray-500',
            )}>
            {FORMAT_NAMES[format]}
          </button>
        ))}
      </div>

      {/* 纯文本分隔符设置 */}
      {formatType === 'plain' && (
        <div className="mb-3">
          <label className={cn('mb-1 block text-xs font-medium', isLight ? 'text-gray-700' : 'text-gray-300')}>
            纯文本分隔符:
          </label>
          <div className="flex gap-2">
            {[' ', ' - ', ', ', '\n'].map(separator => (
              <button
                key={separator}
                onClick={() => handleSeparatorChange(separator)}
                className={cn(
                  'rounded px-2 py-1 text-xs',
                  plainTextSeparator === separator
                    ? isLight
                      ? 'bg-blue-500 text-white'
                      : 'bg-blue-600 text-white'
                    : isLight
                      ? 'bg-gray-200 text-gray-800'
                      : 'bg-gray-600 text-gray-200',
                )}>
                {separator === ' ' ? '空格' : separator === '\n' ? '换行' : `"${separator}"`}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-2 rounded border p-2 text-xs">
        <div className={cn('font-medium', isLight ? 'text-gray-700' : 'text-gray-300')}>当前格式示例:</div>
        <code
          className={cn(
            'mt-1 block break-all rounded-sm p-1 font-mono',
            isLight ? 'bg-gray-100 text-gray-800' : 'bg-gray-800 text-gray-200',
          )}>
          {formatExampleText}
        </code>
      </div>
    </div>
  );
}
