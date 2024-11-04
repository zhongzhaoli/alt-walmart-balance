import {
  GET_BALANCE_MESSAGE_KEY,
  UPDATE_VIEW_DATA,
  BALANCE_ALARM_NAME,
  GET_VIEW_DATA,
} from './constants.js';
import { refreshTab, generateVisualNumber } from './utils.js';

// 创建金额监控
export const createBalanceMonitor = async () => {
  const alarm = await chrome.alarms.get(BALANCE_ALARM_NAME);
  if (typeof alarm === 'undefined') {
    chrome.alarms.create(BALANCE_ALARM_NAME, {
      periodInMinutes: 60,
    });
    refreshTab();
  }
};

// 移除金额监控
export const removeBalanceMonitor = async () => {
  const alarm = await chrome.alarms.get(BALANCE_ALARM_NAME);
  if (typeof alarm !== 'undefined') {
    await chrome.alarms.clear(BALANCE_ALARM_NAME);
  }
};

// 监听金额定时器
chrome.alarms.onAlarm.addListener(refreshTab);

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
    const alarm = await chrome.alarms.get(BALANCE_ALARM_NAME);
    let isOpen = typeof alarm !== 'undefined' ? true : false;
    chrome.tabs.sendMessage(details.tabId, {
      type: GET_BALANCE_MESSAGE_KEY,
      data: {
        ...details,
        alarmIsOpen: isOpen,
        createTime: generateVisualNumber(),
      },
    });
  },
  {
    urls: ['<all_urls>'],
  },
  []
);
