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
        const response = await chrome.tabs
          .sendMessage(tabs[tabIndex].id, { ...message, sendMessageNum: num })
          .catch((err) => {
            console.log(err);
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
