import {
  GET_BALANCE_MESSAGE_KEY,
  BALANCE_ALARM_NAME,
  CLOSE_TAB,
} from './constants.js';
import { refreshTab, closeTab } from './utils.js';

// 刷新页面定时器
export const createRefreshAlarm = async () => {
  const alarm = await chrome.alarms.get(BALANCE_ALARM_NAME);
  if (typeof alarm === 'undefined') {
    chrome.alarms.create(BALANCE_ALARM_NAME, {
      periodInMinutes: 60,
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

// 插件初始化
chrome.runtime.onInstalled.addListener(async () => {
  await removeRefreshAlarm();
  createRefreshAlarm();
});

// 定时器回调
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === BALANCE_ALARM_NAME) refreshTab();
});

chrome.runtime.onMessage.addListener((request) => {
  const { type } = request;
  // 关闭所有网页
  if (type === CLOSE_TAB) {
    closeTab();
  }
});

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
