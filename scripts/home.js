// 金额卡片的选择器
const GET_BALANCE_SELECTOR = '[data-automation-id="kpi-card-value"]';

// 获取金额的通知KEY
const GET_BALANCE_MESSAGE_KEY = 'GET_BALANCE';
// 关闭网页
const CLOSE_TAB = 'CLOSE_TAB';

// 后端请求API
const UPDATE_BALANCE_API =
  'https://altoa.api.altspicerver.com/v1/walmart_api/edit/shop/balance';

// Walmart 获取余额URL
const BALANCE_API_URL =
  'https://seller.walmart.com/aurora/v1/auroraHomePageService/gql';

let requestNum = 0;
chrome.runtime.onMessage.addListener((request) => {
  const { type, data } = request;
  if (type === GET_BALANCE_MESSAGE_KEY) {
    const { url, statusCode, type } = data;
    if (
      type === 'xmlhttprequest' &&
      statusCode === 200 &&
      url === BALANCE_API_URL
    ) {
      if (requestNum === 5) {
        setTimeout(() => {
          fetchBalance(getBalance());
        }, 3000);
      } else {
        requestNum++;
      }
    }
  }
});

// 获取金额
const getBalance = () => {
  const element = document.querySelectorAll(GET_BALANCE_SELECTOR)[3];
  let numText = element ? element.textContent : '0.00';
  let isNegative = false;
  if (numText[0] === '-') {
    isNegative = true;
    numText = numText.substring(1);
  }
  if (numText) {
    numText = numText.replace('$', '');
    return parseFloat(numText.trim().replace(/,/g, '')) * (isNegative ? -1 : 1);
  } else {
    return null;
  }
};

// 提交请求
const fetchBalance = async (balance) => {
  const storeId = getStoreId();
  fetch(UPDATE_BALANCE_API, {
    method: 'put',
    headers: {
      'Content-Type': 'application/json',
    },
    mode: 'cors',
    body: JSON.stringify({
      shop_id: Number(storeId),
      balance,
    }),
  }).finally(async () => {
    closeAllTabs();
  });
};

// 关闭所有网页
const closeAllTabs = () => {
  chrome.runtime.sendMessage({
    type: CLOSE_TAB,
  });
};

// 获取店铺ID
const getStoreId = () => {
  let storeId = null;
  const el = document.getElementById('app-context-info');
  if (el) {
    const jsonString = el.innerHTML;
    if (jsonString) {
      const regex = /"sellerId":"(\d+)"/;
      const match = jsonString.match(regex);
      if (match) {
        storeId = match[1];
      }
    }
  }
  return storeId;
};
