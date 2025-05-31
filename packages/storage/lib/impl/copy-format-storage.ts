import { createStorage, StorageEnum } from '../base/index.js';

// 复制格式类型
export type CopyFormatType = 'plain' | 'markdown' | 'html' | 'csv';

// 复制格式状态
export interface CopyFormatStateType {
  // 复制 URL 和标题的格式
  titleUrlFormat: CopyFormatType;
  // 自定义的复制模板
  templates: {
    [key in CopyFormatType]: string;
  };
}

// 复制格式存储类型
export interface CopyFormatStorageType {
  get: () => Promise<CopyFormatStateType>;
  set: (state: CopyFormatStateType | ((currentState: CopyFormatStateType) => CopyFormatStateType)) => Promise<void>;
  subscribe: (callback: (state: CopyFormatStateType) => void) => () => void;
}

// 默认模板
const DEFAULT_TEMPLATES = {
  plain: '{title} {url}', // 纯文本格式
  markdown: '[{title}]({url})', // Markdown 格式
  html: '<a href="{url}">{title}</a>', // HTML 格式
  csv: '"{title}","{url}"', // CSV 格式
};

// 创建存储
const storage = createStorage<CopyFormatStateType>(
  'copy-format-storage-key',
  {
    titleUrlFormat: 'markdown',
    templates: DEFAULT_TEMPLATES,
  },
  {
    storageEnum: StorageEnum.Local,
    liveUpdate: true,
  },
);

// 导出复制格式存储
export const copyFormatStorage: CopyFormatStorageType = {
  get: storage.get,
  set: storage.set,
  subscribe: (callback: (state: CopyFormatStateType) => void) =>
    storage.subscribe(() => {
      const state = storage.getSnapshot();
      if (state) {
        callback(state);
      }
    }),
};
