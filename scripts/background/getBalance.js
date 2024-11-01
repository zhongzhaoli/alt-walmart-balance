import { sendMessageToTab, refreshTab } from './utils.js';
import {
  BALANCE_ALARM_NAME,
  BALANCE_TAB_INDEX,
  GET_BALANCE_MESSAGE_KEY,
} from './constants.js';

// 更新金额
export const updateBalance = (details) => {
  sendMessageToTab(BALANCE_TAB_INDEX, {
    type: GET_BALANCE_MESSAGE_KEY,
    data: details,
  });
};

// 刷新
const refresh = () => {
  refreshTab(BALANCE_TAB_INDEX);
};

// 创建金额监控
export const createBalanceMonitor = async () => {
  const alarm = await chrome.alarms.get(BALANCE_ALARM_NAME);
  if (typeof alarm === 'undefined') {
    chrome.alarms.create(BALANCE_ALARM_NAME, {
      periodInMinutes: 60,
    });
    refresh();
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
chrome.alarms.onAlarm.addListener(refresh);
