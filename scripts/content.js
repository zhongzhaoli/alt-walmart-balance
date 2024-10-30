// 查询金额的选择器
const SELECTOR_CONDITION = '[data-automation-id="accountBalance"]';

// 获取金额的通知KEY
const GET_BALANCE_MESSAGE_KEY = 'GET_BALANCE';
// 刷新的通知KEY
const REFRESH_KEY = 'REFRESH';
// 更新数据KEY
const UPDATE_VIEW_DATA = 'UPDATE_VIEW_DATA';

// 后端请求API
const UPDATE_BALANCE_API =
  'https://altoa.api.altspicerver.com/v1/walmart_api/edit/shop/balance';

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
const fetchBalance = (balance) => {
  const storeId = getStoreId();
  fetch(UPDATE_BALANCE_API, {
    method: 'put',
    headers: {
      'Content-Type': 'application/json',
    },
    mode: 'cors',
    body: JSON.stringify({
      shop_id: Number(storeId),
      balance: parseFloat(balance),
    }),
  })
    .then(async (res) => {
      const responseBody = await res.json();
      const { code, data } = responseBody;
      const createTime = new Date();
      if (code === 200) {
        saveData(balance, createTime, 'success', JSON.stringify(responseBody));
      } else {
        saveData(balance, createTime, 'failed', JSON.stringify(responseBody));
      }
    })
    .catch((err) => {
      saveData(balance, createTime, 'failed', JSON.stringify(responseBody));
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
const saveData = (price, time, responseStatus, responseText) => {
  chrome.runtime.sendMessage({
    type: UPDATE_VIEW_DATA,
    data: {
      price,
      time,
      responseStatus,
      responseText,
    },
  });
};
