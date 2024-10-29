// 查询金额的选择器
const SELECTOR_CONDITION = '[data-automation-id="accountBalance"]';

// 获取金额的通知KEY
const GET_BALANCE_MESSAGE_KEY = 'GET_BALANCE';
// 同步插件的状态的通知KEY
const SYNC_STATUS_MESSAGE_KEY = 'SYNC_STATUS';
// 刷新的通知KEY
const REFRESH_KEY = 'REFRESH';

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
      balance: String(balance),
    }),
  })
    .then(async (res) => {
      const responseBody = await res.json();
      const { code, data } = responseBody;
      const createTime = new Date();
      if (code === 200) {
        setStatusBoxValue(
          balance,
          createTime,
          'success',
          JSON.stringify(responseBody)
        );
      } else {
        setStatusBoxValue(
          balance,
          createTime,
          'failed',
          JSON.stringify(responseBody)
        );
      }
    })
    .catch((err) => {
      setStatusBoxValue(
        balance,
        createTime,
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

// 状态显示框
const createStatusBox = () => {
  const bigBox = document.createElement('div');
  bigBox.className = 'altWalmartBalanceBox';
  // Title
  const title = document.createElement('div');
  title.className = 'title';
  title.innerHTML = 'Walmart Balance Monitor';
  bigBox.appendChild(title);
  // 内容项
  const contentList = [
    { title: '上次获取金额：', key: 'price' },
    { title: '上次获取时间：', key: 'createTime' },
    { title: '上次请求结果：', key: 'responseStatus' },
    { title: '上次请求响应数据：', key: 'responseText' },
  ];
  contentList.forEach((item) => {
    const content = document.createElement('div');
    content.className = 'content';

    // label
    const label = document.createElement('span');
    label.className = 'label';
    label.innerHTML = item.title;
    content.appendChild(label);
    // value
    const value = document.createElement('span');
    value.className = 'value';
    value.id = `altWalmartBalance_${item.key}`;
    value.innerHTML = '暂无';
    content.appendChild(value);

    bigBox.appendChild(content);
  });
  document.body.appendChild(bigBox);
};

// 状态显示框 - content
const setStatusBoxValue = (price, time, responseStatus, responseText) => {
  document.getElementById('altWalmartBalance_price').innerHTML = price;
  document.getElementById('altWalmartBalance_createTime').innerHTML = time;
  document.getElementById('altWalmartBalance_responseStatus').innerHTML =
    responseStatus;
  document.getElementById('altWalmartBalance_responseText').innerHTML =
    responseText;
};

window.onload = () => {
  // 同步插件的状态
  chrome.runtime.sendMessage({
    type: SYNC_STATUS_MESSAGE_KEY,
  });
};

createStatusBox();
