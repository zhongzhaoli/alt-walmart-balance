export const getCurrentTabId = (callback) => {
  chrome.tabs.query({}, function (tabs) {
    if (callback) callback(tabs);
  });
};

export const sendMessageToTab = (tabIndex, message) => {
  let timer = null;
  let num = 1;
  timer = setInterval(() => {
    getCurrentTabId(async (tabs) => {
      try {
        const response = await chrome.tabs.sendMessage(tabs[tabIndex].id, {
          ...message,
          sendMessageNum: num,
        });
        if (response && response === 'success') {
          clearInterval(timer);
        }
      } catch (err) {
        console.log(err);
      }
    });
    num++;
  }, 1000);
};

export const refreshTab = (tabIndex) => {
  getCurrentTabId(async (tabs) => {
    try {
      await chrome.tabs.reload(tabs[tabIndex].id);
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
