// 查询金额的选择器
const SELECTOR_CONDITION = '[data-automation-id="accountBalance"]';

// 获取金额的通知KEY
const GET_BALANCE_MESSAGE_KEY = 'GET_BALANCE';
// 更新数据KEY
const UPDATE_VIEW_DATA = 'UPDATE_VIEW_DATA';

let isOnload = false;

// 后端请求API
const UPDATE_BALANCE_API =
  'https://altoa.api.altspicerver.com/v1/walmart_api/edit/shop/balance';

// 是否收到信息要更新金额
chrome.runtime.onMessage.addListener((data, _sender, sendResponse) => {
  const { type, sendMessageNum } = data;
  if (isOnload) {
    sendResponse('success');
    if (type === GET_BALANCE_MESSAGE_KEY) {
      const { alarmIsOpen, createTime } = data.data;
      setTimeout(() => {
        fetchBalance(getBalance(), alarmIsOpen, createTime, sendMessageNum);
      }, 3000);
    }
  }
});

// 获取金额
const getBalance = () => {
  const element = document.querySelector(SELECTOR_CONDITION);
  const num = element ? element.textContent : 0;
  let isNegative = false;
  if (element && element.parentNode.children[0].textContent === '−') {
    isNegative = true;
  }
  if (num) {
    return (
      parseFloat(num.trim().split(' ')[1].replace(/,/g, '')) *
      (isNegative ? -1 : 1)
    );
  } else {
    return null;
  }
};

// 提交请求
const fetchBalance = (balance, alarmIsOpen, createTime, sendMessageNum) => {
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
          sendMessageNum,
          'success',
          JSON.stringify(responseBody)
        );
      } else {
        saveData(
          balance,
          createTime,
          alarmIsOpen,
          sendMessageNum,
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
        sendMessageNum,
        'failed',
        JSON.stringify(responseBody)
      );
    });
};

// 获取店铺ID
const getStoreId = () => {
  let storeId = 12389129;
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
const saveData = (
  price,
  time,
  alarmIsOpen,
  sendMessageNum,
  responseStatus,
  responseText
) => {
  chrome.runtime.sendMessage({
    type: UPDATE_VIEW_DATA,
    data: {
      price,
      time,
      alarmIsOpen,
      sendMessageNum,
      responseStatus,
      responseText,
    },
  });
};

window.onbeforeunload = () => {
  isOnload = false;
};

window.onload = () => {
  isOnload = true;
};
