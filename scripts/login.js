// 登录按钮的选择器
const SELECTOR_CONDITION = '[data-automation-id="loginBtn"]';
// 账号输入框的选择器
const SELECTOR_USERNAME = '[data-automation-id="uname"]';
// 密码输入框的选择器
const SELECTOR_PASSWORD = '[data-automation-id="pwd"]';

let timer = null;
window.onload = function () {
  timer = setInterval(() => {
    const element = document.querySelector(SELECTOR_CONDITION);
    const username = document.querySelector(SELECTOR_USERNAME);
    const password = document.querySelector(SELECTOR_PASSWORD);
    if (username && username.value && password && password.value && element) {
      clearInterval(timer);
      element.click();
    }
  }, 1000);
};
