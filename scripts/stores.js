// 获取金额的通知KEY
const GET_BALANCE_MESSAGE_KEY = 'GET_BALANCE';

const STORE_API_URL =
  'https://sbentproapi.ziniao.com/pro/api/v5/shortcut/store';

chrome.runtime.onMessage.addListener((request) => {
  const { type, data } = request;

  if (type === GET_BALANCE_MESSAGE_KEY) {
    if (
      data.type === 'xmlhttprequest' &&
      data.statusCode === 200 &&
      data.url === STORE_API_URL
    ) {
      let storeLen = 0;
      let timter = null;
      let index = 0;
      let divList = [];
      const handle = () => {
        const target = divList[index];
        target.getElementsByTagName('a')[0].click();
        index++;
        if (index >= storeLen) {
          clearInterval(timter);
        }
      };
      setTimeout(() => {
        divList = Array.prototype.slice.call(
          document.getElementsByClassName('startbtn')
        );
        storeLen = divList.length;
        handle();
        timter = setInterval(() => {
          handle();
        }, 60000);
      }, 2000);
    }
  }
});
