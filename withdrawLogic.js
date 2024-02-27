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
    if (console_log == 1) { console.log('Browser Launched'+' => for uname:' + uname + ' pswd:' + pswd); }
    await page.setDefaultNavigationTimeout(0);


    await page.setUserAgent(Emma_bot.useragent);
    await page.setViewport({
      width: Emma_bot.screenWdith,
      height: Emma_bot.screenHeight,
    });
    await page.setRequestInterception(true);

    page.on('request', (req) => {
      if (req.resourceType() == 'stylesheet' || req.resourceType() == 'font' || req.resourceType() == 'image' || req.url().includes('hm.js')) {
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

    if (console_log == 1) { console.log('Logging in...'+' => for uname:' + uname + ' pswd:' + pswd); }

    // Wait for the page to load
    await page.waitForNavigation();
    if (console_log == 1) { console.log('Logged in...'+' => for uname:' + uname + ' pswd:' + pswd); }

  })
}


module.exports = { withdrawLogic }
