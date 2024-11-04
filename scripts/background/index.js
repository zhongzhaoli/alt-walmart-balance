import {
  GET_BALANCE_MESSAGE_KEY,
  BALANCE_ALARM_NAME,
  CLOSE_TAB,
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

chrome.runtime.onMessage.addListener((request) => {
  const { type } = request;
  // 关闭所有网页
  if (type === CLOSE_TAB) {
    chrome.tabs.query({}, function (tabs) {
      for (let tab of tabs) {
        chrome.tabs.remove(tab.id);
      }
    });
  }
});

// 监听金额定时器
chrome.alarms.onAlarm.addListener(refreshTab);

// 插件初始化
chrome.runtime.onInstalled.addListener(async () => {
  await removeBalanceMonitor();
  createBalanceMonitor();
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
