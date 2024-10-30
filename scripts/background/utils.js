const getCurrentTabId = (callback) => {
  chrome.tabs.query({}, function (tabs) {
    if (callback) callback(tabs);
  });
};

export const sendMessageToTab = (tabIndex, message) => {
  getCurrentTabId((tabs) => {
    chrome.tabs.sendMessage(tabs[tabIndex].id, message).catch((err) => {
      console.log(err);
    });
  });
};
