import { WALMART_REFRESH_URL } from './constants.js';

export const getCurrentTabId = (callback) => {
  chrome.tabs.query({}, function (tabs) {
    const newTabs = tabs.filter((tab) => tab.url.includes(WALMART_REFRESH_URL));
    for (let tab of newTabs) {
      callback(tab.id);
    }
  });
};

export const refreshTab = () => {
  getCurrentTabId(async (tabId) => {
    try {
      await chrome.tabs.reload(tabId);
    } catch (err) {
      console.log(err);
    }
  });
};

// 生成当前时间的可视化数字
export const generateVisualNumber = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const date = now.getDate();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  return `${year}-${month < 10 ? `0${month}` : month}-${
    date < 10 ? `0${date}` : date
  } ${hours < 10 ? `0${hours}` : hours}:${
    minutes < 10 ? `0${minutes}` : minutes
  }:${seconds < 10 ? `0${seconds}` : seconds}`;
};
