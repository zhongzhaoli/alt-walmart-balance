import {
  BALANCE_ALARM_NAME,
  SYNC_STATUS_MESSAGE_KEY,
  BALANCE_API_URL,
} from './constants.js';
import {
  createBalanceMonitor,
  removeBalanceMonitor,
  updateBalance,
} from './getBalance.js';

// 同步插件的状态
const syncPluginStatus = async () => {
  const alarm = await chrome.alarms.get(BALANCE_ALARM_NAME);
  if (typeof alarm === 'undefined') {
    await chrome.action.setBadgeText({
      text: 'OFF',
    });
  } else {
    await chrome.action.setBadgeText({
      text: 'ON',
    });
  }
};

// 插件初始化，设置成OFF
chrome.runtime.onInstalled.addListener(() => {
  chrome.action.setBadgeText({
    text: 'OFF',
  });
  removeBalanceMonitor();
});

// 点击插件图标，切换ON 和 OFF
chrome.action.onClicked.addListener(async (tab) => {
  const prevState = await chrome.action.getBadgeText({ tabId: tab.id });
  const nextState = prevState === 'ON' ? 'OFF' : 'ON';
  if (nextState === 'ON') {
    createBalanceMonitor();
  } else {
    removeBalanceMonitor();
  }
  await chrome.action.setBadgeText({
    tabId: tab.id,
    text: nextState,
  });
});

// 同步插件的状态
chrome.runtime.onMessage.addListener(({ type }, _sender) => {
  if (type === SYNC_STATUS_MESSAGE_KEY) {
    syncPluginStatus();
  }
});

chrome.webRequest.onResponseStarted.addListener(
  (details) => {
    const { type, url, statusCode } = details;
    if (
      statusCode === 200 &&
      type === 'xmlhttprequest' &&
      url.startsWith(BALANCE_API_URL)
    ) {
      updateBalance(details);
    }
  },
  {
    urls: ['https://seller.walmart.com/*'],
  },
  []
);
