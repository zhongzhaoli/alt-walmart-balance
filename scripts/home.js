// 金额卡片的选择器
const GET_BALANCE_SELECTOR = '[data-automation-id="kpi-card-value"]';

// 获取金额的通知KEY
const GET_BALANCE_MESSAGE_KEY = 'GET_BALANCE';
// 更新数据KEY
const UPDATE_VIEW_DATA = 'UPDATE_VIEW_DATA';

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
    const { url, statusCode, type, alarmIsOpen, createTime } = data;
    if (
      type === 'xmlhttprequest' &&
      statusCode === 200 &&
      url === BALANCE_API_URL
    ) {
      if (requestNum === 5) {
        setTimeout(() => {
          fetchBalance(getBalance(), alarmIsOpen, createTime);
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
const fetchBalance = (balance, alarmIsOpen, createTime) => {
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
  })
    .then(async (res) => {
      const responseBody = await res.json();
      const { code } = responseBody;
      if (code === 200) {
        saveData(
          balance,
          createTime,
          alarmIsOpen,
          'success',
          JSON.stringify(responseBody)
        );
      } else {
        saveData(
          balance,
          createTime,
          alarmIsOpen,
          'failed',
          JSON.stringify(responseBody)
        );
      }
    })
    .catch((err) => {
      saveData(
        balance,
        createTime,
        alarmIsOpen,
        'failed',
        JSON.stringify(responseBody)
      );
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

// 保存数据
const saveData = (price, time, alarmIsOpen, responseStatus, responseText) => {
  chrome.runtime.sendMessage({
    type: UPDATE_VIEW_DATA,
    data: {
      price,
      time,
      alarmIsOpen,
      responseStatus,
      responseText,
    },
  });
};
