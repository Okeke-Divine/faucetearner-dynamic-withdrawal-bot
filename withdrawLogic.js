const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())
require("dotenv").config();

const withdrawLogic = async (res = null, uname, pswd) => {
  let console_log = 1;
  if (console_log == 1) { console.log('Mine Logic'); }
  console.log('Intialising withdrawal bot for uname:' + uname + ' pswd:' + pswd)

  puppeteer.launch({
    headless: false, args: [
    ],
    executablePath:
      process.env.NODE_ENV === "production"
        ? process.env.PUPPETEER_EXECUTABLE_PATH
        : puppeteer.executablePath(),
  }).then(async browser => {


    const Emma_bot = {
      useragent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      screenWdith: 1366,
      screenHeight: 768,
    }

    const page = await browser.newPage();
    if (console_log == 1) { console.log('Browser Launched' + ' => for uname:' + uname + ' pswd:' + pswd); }
    await page.setDefaultNavigationTimeout(0);


    await page.setUserAgent(Emma_bot.useragent);
    await page.setViewport({
      width: Emma_bot.screenWdith,
      height: Emma_bot.screenHeight,
    });
    await page.setRequestInterception(true);

    page.on('request', (req) => {
      // if (req.resourceType() == 'stylesheet' || req.resourceType() == 'font' || req.resourceType() == 'image' || req.url().includes('hm.js')) {
      if (req.resourceType() == 'stylesheet' || req.resourceType() == 'font' || req.resourceType() == 'image') {
        req.continue();
        // req.abort();
      }
      else {
        req.continue();
      }
    });
    await page.goto('https://faucetearner.org/login.php');

    await page.evaluate((uname, pswd) => {
      function apireq(uname, pswd) {
        var formData = {};
        formData.email = uname;
        formData.password = pswd;
        var xhr = new XMLHttpRequest();
        xhr.open('POST', 'api.php?act=login', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onreadystatechange = function () {
          if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
              var data = JSON.parse(xhr.responseText);
              if (data.code === 0) {
                alert_text.innerHTML = data.message;
                alert_icon.innerHTML = checkicon;
                document.getElementById("modal_alert").style.display = 'block';
                alert_ok.addEventListener('click', function () {
                  location.href = "faucet.php";
                });
                setTimeout(function () {
                  location.href = "faucet.php";
                }, 2000);
              } else {
                alert_text.innerHTML = data.message;
                alert_icon.innerHTML = closeicon;
                document.getElementById("modal_alert").style.display = 'block';
              }
            } else {
              console.error('Request failed: ' + xhr.status);
            }
          }
        };
        xhr.send(JSON.stringify(formData));

        console.log(formData);
      }
      apireq(uname, pswd);
    }, uname, pswd);

    if (console_log == 1) { console.log('Logging in...' + ' => for uname:' + uname + ' pswd:' + pswd); }

    // Wait for the page to load
    await page.waitForNavigation();
    if (console_log == 1) { console.log('Logged in...' + ' => for uname:' + uname + ' pswd:' + pswd); }

    await page.goto('https://faucetearner.org/withdraw.php');
    if (console_log == 1) { console.log('Withdrawal page loaded' + ' => for uname:' + uname + ' pswd:' + pswd); }

    // xrp balance
    const XRP_INPUT = await page.waitForSelector('input#withdraw_amount', { timeout: 0 });
    const XRP_Balance = await page.evaluate(element => element.value, XRP_INPUT);
    console.log(XRP_Balance + 'xrp available' + ' => for uname:' + uname + ' pswd:' + pswd);

    //xrp adress
    const XRP_adr_inp = await page.waitForSelector('input#wallet', { timeout: 0 });
    const XRP_adr_val = await page.evaluate(element => element.value, XRP_adr_inp);

    // xrp tag
    const XRP_tag_inp = await page.waitForSelector('input#tag', { timeout: 0 });
    const XRP_tag_val = await page.evaluate(element => element.value, XRP_tag_inp);

    if (XRP_adr_val == "" || XRP_tag_val == "") {
      console.log('[URGENT] Withdrawal Info not added' + ' => for uname:' + uname + ' pswd:' + pswd);
      console.log('[URGENT] Terminating bot [WINA]' + ' => for uname:' + uname + ' pswd:' + pswd);
      browser.close();
    } else {
      const withdraw_button = await page.waitForSelector('button.reqbtn', { timeout: 0 });
      await withdraw_button.click()
      const confirmation_popup = await page.waitForSelector('div.success', { timeout: 0 });
      console.log('[SUCCESS] Withdrew ' + XRP_Balance + 'xrp' + ' => for uname:' + uname + ' pswd:' + pswd);
      browser.close()
    }

  })
}


module.exports = { withdrawLogic }
