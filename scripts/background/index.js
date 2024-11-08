import {
  GET_BALANCE_MESSAGE_KEY,
  BALANCE_ALARM_NAME,
  CLOSE_TAB,
  CLOSE_OTHER_LOGIN_KEY,
  ADMIN_REFRESH_URL,
} from './constants.js';
import { refreshTab, closeTab } from './utils.js';

// 刷新页面定时器
export const createRefreshAlarm = async () => {
  const alarm = await chrome.alarms.get(BALANCE_ALARM_NAME);
  if (typeof alarm === 'undefined') {
    chrome.alarms.create(BALANCE_ALARM_NAME, {
      periodInMinutes: 180,
      delayInMinutes: 0.5,
    });
    refreshTab();
  }
};
export const removeRefreshAlarm = async () => {
  const alarm = await chrome.alarms.get(BALANCE_ALARM_NAME);
  if (typeof alarm !== 'undefined') {
    await chrome.alarms.clear(BALANCE_ALARM_NAME);
  }
};

const openLogin = () => {
  chrome.tabs.query({ currentWindow: true }, function (tabs) {
    tabs.forEach((tab) => {
      const { title, url } = tab;
      if (
        title.indexOf('跨境电商环境安全提速系统') >= 0 &&
        url.startsWith('chrome-extension://')
      ) {
        chrome.tabs.create({ url: 'https://seller.walmart.com' });
      }
    });
  });
};

const init = () => {
  setTimeout(async () => {
    openLogin();
    const tabs = await chrome.tabs.query({});
    const hasAdminTab = tabs.some(
      (tab) => tab.url.indexOf(ADMIN_REFRESH_URL) >= 0
    );
    if (hasAdminTab) {
      createRefreshAlarm();
    }
  }, 5000);
};
init();

// 插件初始化
chrome.runtime.onInstalled.addListener(async () => {
  await removeRefreshAlarm();
  createRefreshAlarm();
});

// 定时器回调
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === BALANCE_ALARM_NAME) {
    refreshTab();
  }
});

// 接收信息
const isHandleWindowId = [];
chrome.runtime.onMessage.addListener(async (request, sender) => {
  const { type } = request;
  // 关闭所有网页
  if (type === CLOSE_TAB) {
    closeTab();
  }
  if (type === 'POPUP_DATA') {
    const storage = await chrome.storage.local.get('test');
    chrome.runtime.sendMessage({
      type: 'POPUP_DATA',
      data: JSON.stringify(storage.test) || '[]',
    });
  }
  if (type === CLOSE_OTHER_LOGIN_KEY) {
    if (isHandleWindowId.includes(sender.tab.windowId)) return;
    isHandleWindowId.push(sender.tab.windowId);
    const tabs = await chrome.tabs.query({});
    tabs.forEach((tab) => {
      if (tab.id !== sender.tab.id) {
        chrome.tabs.remove(tab.id);
      }
    });
  }
});

// 响应回调
chrome.webRequest.onResponseStarted.addListener(
  async (details) => {
    chrome.tabs.sendMessage(details.tabId, {
      type: GET_BALANCE_MESSAGE_KEY,
      data: details,
    });
  },
  {
    urls: ['<all_urls>'],
    types: ['xmlhttprequest'],
  },
  []
);
