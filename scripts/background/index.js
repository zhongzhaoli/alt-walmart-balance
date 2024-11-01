import {
  BALANCE_API_URL,
  UPDATE_VIEW_DATA,
  BALANCE_ALARM_NAME,
  GET_VIEW_DATA,
} from './constants.js';
import {
  createBalanceMonitor,
  removeBalanceMonitor,
  updateBalance,
} from './getBalance.js';
import { generateVisualNumber } from './utils.js';

// 插件初始化
chrome.runtime.onInstalled.addListener(async () => {
  await removeBalanceMonitor();
  createBalanceMonitor();
});

chrome.runtime.onMessage.addListener((data) => {
  const { type } = data;
  if (type === UPDATE_VIEW_DATA) {
    chrome.storage.local.set({
      VIEW_DATA: data.data,
    });
  }
  if (type === GET_VIEW_DATA) {
    chrome.storage.local.get(['VIEW_DATA'], (result) => {
      chrome.runtime.sendMessage({
        type: GET_VIEW_DATA,
        data: result.VIEW_DATA,
      });
    });
  }
});

chrome.webRequest.onResponseStarted.addListener(
  async (details) => {
    const { type, url, statusCode } = details;
    if (
      statusCode === 200 &&
      type === 'xmlhttprequest' &&
      url.startsWith(BALANCE_API_URL)
    ) {
      const alarm = await chrome.alarms.get(BALANCE_ALARM_NAME);
      let isOpen = typeof alarm !== 'undefined' ? true : false;
      updateBalance({
        ...details,
        alarmIsOpen: isOpen,
        createTime: generateVisualNumber(),
      });
    }
  },
  {
    urls: ['https://seller.walmart.com/*'],
  },
  []
);
