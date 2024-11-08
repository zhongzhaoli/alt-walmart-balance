// 获取金额的通知KEY
const GET_BALANCE_MESSAGE_KEY = 'GET_BALANCE';

const STORE_API_URL =
  'https://sbentproapi.ziniao.com/pro/api/v5/shortcut/store';

const NEXT_PAGE_SELECTION = 'li[title="下一页"]';

// 获取Loading状态
const getLoading = () => {
  const loadingList = document.querySelectorAll('.ant-spin-nested-loading');
  if (loadingList && loadingList.length) {
    const lastLoading = loadingList[loadingList.length - 1];
    return lastLoading.children.length >= 2;
  } else {
    return false;
  }
};

// 点击下一页
const toNextPage = () => {
  const li = document.querySelector(NEXT_PAGE_SELECTION);
  const disabled = li.getAttribute('aria-disabled');
  if (disabled === 'false') {
    const button = li.querySelector('button');
    button.click();
    let timer = setInterval(() => {
      const isLoading = getLoading();
      if (!isLoading) {
        clearInterval(timer);
        openStore();
      }
    }, 100);
  }
};

// 打开店铺
const openStore = () => {
  let storeLen = 0;
  let timter = null;
  let index = 0;
  let divList = [];
  const handle = () => {
    const target = divList[index];
    target.getElementsByTagName('button')[0].click();
    // target.getElementsByTagName('a')[0].click();
    index++;
    if (index >= storeLen) {
      clearInterval(timter);
      // 点击下一页
      // 防止店铺打开失败30秒延迟
      setTimeout(() => {
        toNextPage();
      }, 30000);
    }
  };
  setTimeout(() => {
    divList = Array.prototype.slice.call(
      document.querySelectorAll('[class*="superStartBtn"]')
      // document.getElementsByClassName('startbtn')
    );
    storeLen = divList.length;
    // 一分钟打开一个店铺
    handle();
    timter = setInterval(() => {
      handle();
    }, 60000);
  }, 2000);
};

chrome.runtime.onMessage.addListener((request) => {
  const { type, data } = request;
  if (type === GET_BALANCE_MESSAGE_KEY) {
    if (data.statusCode === 200 && data.url === STORE_API_URL) {
      openStore();
    }
  }
});
