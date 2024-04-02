const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const dotenv = require("dotenv");

puppeteer.use(StealthPlugin());
dotenv.config();

const successNavigationTimeout = 5000
const headlessValue = process.env.NODE_ENV === "production" ? 'new': false

const withdrawLogic = async (uname, pswd) => {
    return new Promise(async (resolve, reject) => {
        let console_log = 1;
        if (console_log == 1) { console.log('Mine Logic'); }
        console.log('Initializing withdrawal bot for uname:' + uname + ' pswd: ******');

        try {
            const browser = await puppeteer.launch({
                headless: headlessValue,
                args: [],
                executablePath: process.env.NODE_ENV === "production" ? process.env.PUPPETEER_EXECUTABLE_PATH : puppeteer.executablePath(),
            });

            const Emma_bot = {
                useragent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                screenWdith: 1366,
                screenHeight: 768,
            };

            const page = await browser.newPage();
            if (console_log == 1) { console.log('Browser Launched' + ' => for uname:' + uname + ' pswd: ******'); }
            await page.setDefaultNavigationTimeout(0);

            await page.setUserAgent(Emma_bot.useragent);
            await page.setViewport({
                width: Emma_bot.screenWdith,
                height: Emma_bot.screenHeight,
            });
            await page.setRequestInterception(true);

            page.on('request', (req) => {
                if (req.resourceType() == 'stylesheet' || req.resourceType() == 'font' || req.resourceType() == 'image') {
                    req.abort();
                } else {
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
                }
                apireq(uname, pswd);
            }, uname, pswd);

            if (console_log == 1) { console.log('Logging in...' + ' => for uname:' + uname + ' pswd: ******'); }

            await page.waitForNavigation();
            if (console_log == 1) { console.log('Logged in...' + ' => for uname:' + uname + ' pswd: ******'); }

            await page.goto('https://faucetearner.org/withdraw.php');
            if (console_log == 1) { console.log('Withdrawal page loaded' + ' => for uname:' + uname + ' pswd: ******'); }

            const XRP_INPUT = await page.waitForSelector('input#withdraw_amount', { timeout: 0 });
            const XRP_Balance = await page.evaluate(element => element.value, XRP_INPUT);
            console.log(XRP_Balance + 'xrp available' + ' => for uname:' + uname + ' pswd: ******');

            const XRP_adr_inp = await page.waitForSelector('input#wallet', { timeout: 0 });
            const XRP_adr_val = await page.evaluate(element => element.value, XRP_adr_inp);

            const XRP_tag_inp = await page.waitForSelector('input#tag', { timeout: 0 });
            const XRP_tag_val = await page.evaluate(element => element.value, XRP_tag_inp);

            if (XRP_adr_val == "" || XRP_tag_val == "") {
                console.log('[URGENT] Withdrawal Info not added' + ' => for uname:' + uname + ' pswd: ******');
                console.log('[URGENT] Terminating bot [WINA]' + ' => for uname:' + uname + ' pswd: ******');
                browser.close();
                reject('Withdrawal Info not added');
            } else {
                const withdraw_button = await page.waitForSelector('button.reqbtn', { timeout: 0 });
                await withdraw_button.click();

                // Wait for navigation for a maximum of 5 seconds
                const navigationPromise = page.waitForNavigation({ timeout: successNavigationTimeout });

                // Use Promise.race() to race between navigation promise and a timeout
                await Promise.race([navigationPromise, new Promise(resolve => setTimeout(resolve, successNavigationTimeout))])
                    .catch(() => {
                        console.error('[ERROR] Navigation timeout');
                    });

                // Check if the navigation was successful
                if (page.url() === 'your_expected_url_after_navigation') {
                    console.log('[SUCCESS] Withdrew ' + XRP_Balance + 'xrp' + ' => for uname:' + uname + ' pswd: ******');
                    browser.close();
                    resolve(`Withdrawal completed for user: ${uname}`);
                } else {
                    console.error('[ERROR] Navigation unsuccessful');
                    browser.close();
                    resolve(`Withdrawal had an error for user: ${uname}`);
                }
            }
        } catch (error) {
            console.error('Error occurred:', error);
            reject(error);
        }
    });
};

module.exports = { withdrawLogic };
