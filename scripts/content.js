// 查询金额的选择器
const SELECTOR_CONDITION = '[data-automation-id="accountBalance"]';

// 获取金额的通知KEY
const GET_BALANCE_MESSAGE_KEY = 'GET_BALANCE';
// 同步插件的状态的通知KEY
const SYNC_STATUS_MESSAGE_KEY = 'SYNC_STATUS';
// 刷新的通知KEY
const REFRESH_KEY = 'REFRESH';

// 是否收到信息要更新金额
chrome.runtime.onMessage.addListener(async (data) => {
  const { type } = data;
  if (type === GET_BALANCE_MESSAGE_KEY) {
    console.log(document.getElementsByTagName('script'));
    setTimeout(() => {
      fetchBalance(getBalance());
    }, 1000);
  }
  if (type === REFRESH_KEY) {
    window.location.reload();
  }
});

// 获取金额
const getBalance = () => {
  const element = document.querySelector(SELECTOR_CONDITION);
  const num = element ? element.textContent : 0;
  if (num) {
    return parseFloat(num.split(' ')[1].replace(/,/g, ''));
  } else {
    return null;
  }
};

// 提交请求
const fetchBalance = async (price) => {
  const storeId = getStoreId();
  await fetch('https://httpbin.org/post', {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      price,
    }),
  });
};

// 获取店铺ID
const getStoreId = () => {
  const el = document.getElementById('app-context-info');
  const jsonString = el.innerHTML;
  let storeId = null;
  if (jsonString) {
    const regex = /"sellerId":"(\d+)"/;
    const match = jsonString.match(regex);
    if (match) {
      storeId = match[1];
    }
  }
  return storeId;
};

window.onload = () => {
  // 同步插件的状态
  chrome.runtime.sendMessage({
    type: SYNC_STATUS_MESSAGE_KEY,
  });
};
