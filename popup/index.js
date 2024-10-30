// 更新数据KEY
const UPDATE_VIEW_DATA = 'UPDATE_VIEW_DATA';
// 获取数据KEY
const GET_VIEW_DATA = 'GET_VIEW_DATA';

// 更新数据
chrome.runtime.onMessage.addListener((data) => {
  const { type, data: tempData } = data;
  if (type === GET_VIEW_DATA) {
    const { price, time, responseStatus, responseText } = tempData;
    document.getElementById('altWalmartBalance_price').innerHTML = price;
    document.getElementById('altWalmartBalance_createTime').innerHTML = time;
    document.getElementById('altWalmartBalance_responseStatus').innerHTML =
      responseStatus;
    document.getElementById('altWalmartBalance_responseText').innerHTML =
      responseText;
  }
});

// 初始化
chrome.runtime.sendMessage({
  type: GET_VIEW_DATA,
});
