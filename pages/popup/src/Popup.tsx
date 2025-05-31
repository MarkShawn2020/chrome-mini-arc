import '@src/Popup.css';
import { CopyFormatSettings } from './components/CopyFormatSettings';
import { t } from '@extension/i18n';
import { PROJECT_URL_OBJECT, useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { exampleThemeStorage } from '@extension/storage';
import { cn, ErrorDisplay, LoadingSpinner, ToggleButton } from '@extension/ui';

const notificationOptions = {
  type: 'basic',
  iconUrl: chrome.runtime.getURL('icon-34.png'),
  title: 'Injecting content script error',
  message: 'You cannot inject script here!',
} as const;

const Popup = () => {
  const { isLight } = useStorage(exampleThemeStorage);
  const logo = isLight ? 'popup/logo_vertical.svg' : 'popup/logo_vertical_dark.svg';

  const goGithubSite = () => chrome.tabs.create(PROJECT_URL_OBJECT);

  const injectContentScript = async () => {
    const [tab] = await chrome.tabs.query({ currentWindow: true, active: true });

    if (tab.url!.startsWith('about:') || tab.url!.startsWith('chrome:')) {
      chrome.notifications.create('inject-error', notificationOptions);
    }

    await chrome.scripting
      .executeScript({
        target: { tabId: tab.id! },
        files: ['/content-runtime/example.iife.js', '/content-runtime/all.iife.js'],
      })
      .catch(err => {
        // Handling errors related to other paths
        if (err.message.includes('Cannot access a chrome:// URL')) {
          chrome.notifications.create('inject-error', notificationOptions);
        }
      });
  };

  return (
    <div className={cn('App h-full overflow-hidden', isLight ? 'bg-slate-50' : 'bg-gray-800')}>
      <header className={cn('App-header h-full overflow-y-auto py-2', isLight ? 'text-gray-900' : 'text-gray-100')}>
        <div className="mb-2 flex items-center">
          <button onClick={goGithubSite} className="flex-shrink-0">
            <img src={chrome.runtime.getURL(logo)} className="App-logo h-10 w-auto" alt="logo" />
          </button>
          <h2 className="ml-2 text-lg font-medium">Arc Mini</h2>
        </div>

        {/* 复制格式设置组件 */}
        <CopyFormatSettings isLight={isLight} />

        <div className="mt-3 flex justify-center gap-2">
          <button
            className={cn(
              'rounded px-3 py-1 text-sm font-medium shadow hover:scale-105',
              isLight ? 'bg-blue-200 text-black' : 'bg-gray-700 text-white',
            )}
            onClick={injectContentScript}>
            {t('injectButton')}
          </button>
          <ToggleButton className="text-sm">{t('toggleTheme')}</ToggleButton>
        </div>
      </header>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Popup, <LoadingSpinner />), ErrorDisplay);
