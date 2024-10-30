import {
  BALANCE_API_URL,
  UPDATE_VIEW_DATA,
  GET_VIEW_DATA,
} from './constants.js';
import {
  createBalanceMonitor,
  removeBalanceMonitor,
  updateBalance,
} from './getBalance.js';

// 插件初始化，设置成OFF
chrome.runtime.onInstalled.addListener(() => {
  removeBalanceMonitor();
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
