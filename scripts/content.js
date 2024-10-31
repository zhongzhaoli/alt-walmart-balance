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
chrome.runtime.onMessage.addListener((data, _sender, sendResponse) => {
  const { type } = data;
  sendResponse('success');

  if (type === GET_BALANCE_MESSAGE_KEY) {
    setTimeout(() => {
      fetchBalance(getBalance());
    }, 3000);
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
      const { code } = responseBody;
      // 时间
      var timezone = 8; //目标时区时间，东八区
      var offset_GMT = new Date().getTimezoneOffset(); // 本地时间和格林威治的时间差，单位为分钟
      var nowDate = new Date().getTime(); // 本地时间距 1970 年 1 月 1 日午夜（GMT 时间）之间的毫秒数
      var targetDate = new Date(
        nowDate + offset_GMT * 60 * 1000 + timezone * 60 * 60 * 1000
      );
      if (code === 200) {
        saveData(balance, targetDate, 'success', JSON.stringify(responseBody));
      } else {
        saveData(balance, targetDate, 'failed', JSON.stringify(responseBody));
      }
    })
    .catch((err) => {
      saveData(balance, targetDate, 'failed', JSON.stringify(responseBody));
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
