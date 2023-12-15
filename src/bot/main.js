const puppeteer = require('puppeteer-extra')
const path = require('path');
const fs = require('fs');
const RecaptchaPlugin = require('puppeteer-extra-plugin-recaptcha');
const stealth = require("puppeteer-extra-plugin-stealth");
const UserAgent = require('user-agents');
puppeteer.use(stealth());
const spoof = path.join(process.cwd(), "src/bot/extension/spoof/");
const timeout = 3000
let stop = false
let browser, page, pages, checkPop;

const mainProccess = async (log, keyword, url, data) => {
    let saveProxy, proxyServer;

    data.captcha && puppeteer.use(
        RecaptchaPlugin({
            provider: {
                id: '2captcha',
                token: data.apikey
            },
            visualFeedback: true
        })
    )

    if (data.proxy) {
        const raw = data.proxyField.split('@')
        saveProxy = [username, password] = raw[0].split(":")
        const [ip, port] = raw[1].split(':')
        proxyServer = `${ip}:${port}`
    }

    browser = await puppeteer.launch({
        headless: data.view,
        defaultViewport: null,
        args: [
            `--disable-extensions-except=${spoof}`,
            `--load-extension=${spoof}`,
            "--disable-setuid-sandbox",
            "--no-sandbox",
            "--mute-audio",
            data.proxy ? `--proxy-server=${proxyServer}` : null
        ].filter(Boolean)
    })

    let deviceCategory = '';

    if (data.uDesktop) {
        deviceCategory = 'desktop';
    } else if (data.uMobile) {
        deviceCategory = 'mobile';
    } else if (data.uRandom) {
        deviceCategory = 'random';
    }

    const userAgent = !data.iphone ?
        new UserAgent({
            deviceCategory: deviceCategory
        }) :
        new UserAgent({
            platform: 'iPhone'
        });


    const blackListUrl = [
        'confirm-action'
    ]

    page = await browser.newPage()
    pages = await browser.pages()

    await page.setUserAgent(userAgent.toString())

    if (data.modePopUnder) {
        checkPop = setInterval(async () => {
            pages = await browser.pages()
            if (pages.length > 2) {
                for (let i = 2; i < pages.length; i++) {
                    if (i !== 0 && i !== 1) {
                        await pages[i].close();
                    }
                }
            }
        }, 2000)
    }

    page.sleep = function (timeout) {
        return new Promise(function (resolve) {
            setTimeout(resolve, timeout);
        });
    };

    try {
        data.proxy && await page.authenticate({
            username: `${saveProxy[0]}`,
            password: `${saveProxy[1]}`
        });

        data.whoer && await getWhoerData(log)

        page.on('dialog', async dialog => {
            log(dialog.message())
            await dialog.dismiss();
        })


        if (data.googleMode) {
            await page.goto('https://www.google.com/', {
                waitUntil: ['networkidle2', 'domcontentloaded'],
                timeout: 120000
            })

            if (data.captcha) {
                try {
                    const recaptchaResponse = await page.solveRecaptchas();
                    if (recaptchaResponse.length > 0) {
                        log("[INFO] Recaptcha solved");
                        await page.waitForTimeout(2000);
                    }
                } catch (err) {
                    console.error("Error solving reCAPTCHA:", err);
                    log("[ERROR] Error solving reCAPTCHA");
                    await browser.close()
                    return;
                }
            }

            await page.type('textarea[name="q"]', keyword);
            log(`[INFO] Search: ${keyword}...`);

            await Promise.all([
                page.keyboard.press("Enter"),
                data.blogMode ? page.waitForNavigation({
                    waitUntil: 'networkidle2',
                    timeout: 120000
                }) : await page.sleep(10000)
            ]);

            if (data.captcha) {
                const recaptchaResponse = await page.solveRecaptchas();
                if (recaptchaResponse.length > 0) {
                    log("[INFO] Recaptcha detected");
                    await page.waitForTimeout(5000);
                }
            }

            await scrollDownToBottom(page);

            const hrefElements = await page.$$('[href]');
            const hrefs = await Promise.all(hrefElements.map(element => element.evaluate(node => node.getAttribute('href'))));
    
            let linkFound = false;
    
            for (const href of hrefs) {
                if (url.includes(href)) {
                    log("[INFO] Article Found ✅");
                    try {
                        const element = await page.waitForXPath(`//a[@href="${href}"]`, {
                            timeout: 10000
                        });
                        await element.click();
                        linkFound = true;
                        break;
                    } catch (error) {
                        log(`[ERROR] Error clicking the link: ${error}`);
                        break;
                    }
                }
            }
    
            if (!linkFound) {
                log("[INFO] Article Not Found ❌: " + domain);
                await closeClear(proxyC)
                return
            }

        } else if (data.blogMode) {
            await page.goto(url, {
                waitUntil: ['networkidle2', 'domcontentloaded'],
                timeout: 120000
            })
        }

        if (data.modePopUnder) {
            log('[INFO] Scroll Page Utama');

            await scrollFuncAds(page, data, log)

            let loops = 0;
            while (loops < data.repeat) {
                log(`\nLoop ${loops}`);
                const newTargetPromise = new Promise((resolve) => {
                    browser.once('targetcreated', (target) => {
                        resolve(target);
                    });
                });

                await page.waitForSelector('body', {
                    waitUntil: ['networkidle2', 'domcontentloaded'],
                    timeout: 120000
                })

                log('[INFO] Finding the ads element');
                const clickAds = await page.$$('body > div')
                clearInterval(checkPop)

                if (clickAds.length > 0) {
                    try {
                        await clickAds[clickAds.length - 1].click();
                        await page.sleep(20000);
                        pages = await browser.pages();
                    } catch (error) {
                        log('[WARN] Not Clickable:', error);
                    }
                } else {
                    return;
                }

                await page.waitForTimeout(timeout)
                if (pages.length > 2) {
                    log('[INFO] Ads Found ✅');
                    const newTarget = await newTargetPromise;
                    const newPage = await newTarget.page();
                    await newPage.setUserAgent(userAgent.toString())

                    newPage.on('error', (error) => {
                        error('Page error:', error);
                    });

                    await newPage.waitForTimeout(20000)

                    log('[INFO] Page Iklan 1');
                    log('[INFO] Skenario Scroll');

                    blackListUrl.forEach(async (url) => {
                        if (await page.url().includes(url)) {
                            return;
                        }
                    })

                    await scrollFuncAds(newPage, data, log)

                    await newPage.waitForSelector('a[href]', {
                        waitUntil: ['networkidle2', 'domcontentloaded'],
                        timeout: 120000
                    })

                    const urls = await newPage.$$('a[href]')
                    if (urls) {
                        const random = Math.floor(Math.random() * (urls.length + 1));

                        try {
                            const hrefValue = await newPage.evaluate(e => e.getAttribute('href'), urls[random]);
                            const onClickValue = await newPage.evaluate(e => e.getAttribute('onclick'), urls[random]);

                            if ((hrefValue !== '#' && hrefValue !== null) || onClickValue !== null || hrefValue !== "javascript:void(0);") {
                                log(`[INFO] Initiate click url href="${hrefValue}"`);

                                if (hrefValue !== '#') {
                                    await Promise.all([
                                        await newPage.evaluate((element) => {
                                            element.removeAttribute('target');
                                        }, urls[random]),
                                        urls[random].evaluate(b => b.click())
                                    ]);

                                    await newPage.waitForTimeout(20000)
                                }
                            } else {
                                log('[INFO] Url not found');
                                return;
                            }
                        } catch (error) {
                            return;
                        }

                        log('[INFO] Page Iklan 2');
                        log('[INFO] Skenario scroll current page');
                        await scrollFuncAds(newPage, data, log)

                    } else {
                        log('[INFO] Ads Not Found ❌');
                    }

                    pages = await browser.pages()
                    log('[INFO] Intiate Close all page except page 1 & 2');
                    for (let i = 2; i < pages.length; i++) {
                        if (i !== 0 && i !== 1) {
                            await pages[i].close();
                        }
                    }

                    page = pages[1]
                    !data.recentPost ? log('[INFO] Done Visit Ads\n') : log('[INFO] Done Visit Ads');
                    await page.sleep(10000)
                } else {
                    !data.recentPost ? log('[INFO] Ads Not Found ❌\n') : log('[INFO] Ads Not Found ❌');
                    clearInterval(checkPop)
                }
                loops++
            }

            if (data.recentPost) {
                const recentPost = await page.$$('#block-3 > div > div > ul > li > a')
                const randomRecentPost = Math.floor(Math.random() * (recentPost.length - 5))
                const urlRecent = await page.evaluate((e) => e.getAttribute('href'), recentPost[randomRecentPost])

                log(`\n[INFO] Go To Recent Post Page ${urlRecent} No ${randomRecentPost}`);
                recentPost.length > 0 && await page.goto(urlRecent, {
                    waitUntil: ['networkidle2', 'domcontentloaded'],
                    timeout: 120000
                })

                log('[INFO] Scroll Recent Post Pages\n');
                await scrollFuncAds(page, data, log)
            }
        }


        await browser.close()
    } catch (error) {
        data.modePopUnder && clearInterval(checkPop)
        log('[ERROR] ' + error + "\n")
        await browser.close()
    }
};

const getWhoerData = async (log) => {
    try {
        log('[INFO] Redirect to whoer for get the condition data')
        await page.goto("https://whoer.net/", {
            waitUntil: ['domcontentloaded', "networkidle2"],
            timeout: 120000,
        });

        const getIp = await page.$(
            "#main > section.section_main.section_user-ip.section > div > div > div > div.main-ip-info__ip > div > strong"
        );
        const resultIp = await page.evaluate((el) => el.innerText, getIp);
        const getDevice = await page.$(
            "#main > section.section_main.section_user-ip.section > div > div > div > div.row.main-ip-info__ip-data > div:nth-child(1) > div:nth-child(3) > div.ip-data__col.ip-data__col_value"
        );
        const resultDevice = await page.evaluate((el) => el.innerText, getDevice);

        const getBrowser = await page.$(
            "#main > section.section_main.section_user-ip.section > div > div > div > div.row.main-ip-info__ip-data > div:nth-child(1) > div:nth-child(4) > div.ip-data__col.ip-data__col_value"
        );
        const resultBrowser = await page.evaluate((el) => el.innerText, getBrowser);

        const getCountry = await page.$('[data-fetched="country_name"]');
        const resultCountry = await page.evaluate((el) => el.innerText, getCountry);

        await page.sleep(timeout)
        const getCity = await page.$('#city-name');
        const resultCity = await page.evaluate((e) => e.innerText, getCity)

        let browcer;
        if (resultBrowser.includes("Hide")) {
            browcer = resultBrowser.replace("Hide", "");
        } else if (resultBrowser.includes("Protect")) {
            browcer = resultBrowser.replace("Protect", "");
        } else if (resultBrowser.includes("Protected")) {
            browcer = resultBrowser.replace("Protected", "");
        }

        const line = browcer.split("\n");
        const nonEmptyLines = line.filter((line) => line.trim() !== "");
        const resultString = nonEmptyLines.join("\n");

        const getPercent = await page.$("#hidden_rating_link");
        const resultPercent = await page.evaluate((el) => el.innerText, getPercent);

        const getLokal = (await page.$x('/html/body/div/div[1]/div/section[4]/div/div/div/div[1]/div[1]/div[2]/div[1]/div/div/div[2]/div[2]/div[2]'))[0]
        const lokal = await page.evaluate(e => e.innerText, getLokal)

        const getZone = (await page.$x('/html/body/div/div[1]/div/section[4]/div/div/div/div[1]/div[1]/div[2]/div[1]/div/div/div[2]/div[3]/div[2]'))[0]
        const zone = await page.evaluate(e => e.innerText, getZone)

        if (resultPercent !== "Your disguise: 90%" && resultPercent !== "Your disguise: 100%" && resultPercent !== "Your disguise: 80%") {
            log('[WARN] The Percentage is under 90%. Closing browser and retrying... ❗');
            await browser.close();
        } else {
            log("\n[INFO] Details IP : " + resultIp);
            log("[INFO] Percent : " + resultPercent);
            log("[INFO] Country : " + resultCountry);
            log("[INFO] City : " + resultCity.replace(' /', ''));
            log("[INFO] Time Lokal : " + lokal);
            log("[INFO] Time Zone : " + zone);
            log("[INFO] Device : " + resultDevice);
            log("[INFO] Browser : " + resultString + "\n");
        }
    } catch (error) {
        log(`[ERROR] ${error}`)
        await browser.close()
    }
}

const scrollFuncAds = async (newPage, data, log) => {
    const startTimes = Date.now();
    const min = parseInt(data.adsTimes[0]);
    const max = parseInt(data.adsTimes[1]);
    const duration = Math.round(Math.random() * (max - min)) + min;
    const sleepDuration = duration * 60 * 1000;
    const convertMinutes = Math.floor((sleepDuration / 1000 / 60) % 60);
    log("[INFO] Scrolling page  for random range " + convertMinutes + " minute 🕐");
    while (Date.now() - startTimes < sleepDuration) {
        await newPage.evaluate(() => {
            window.scrollBy(0, 100);
        });
        await newPage.waitForTimeout(3000);
        await newPage.evaluate(() => {
            window.scrollBy(0, -10);
        });
        await newPage.waitForTimeout(3000);
    }
};

async function scrollDownToBottom(page) {
    let lastScrollPosition = 0;
    let retries = 3;

    while (retries > 0) {
        const currentScrollPosition = await page.evaluate(() => window.scrollY);
        if (currentScrollPosition === lastScrollPosition) {
            retries--;
        } else {
            retries = 3;
        }

        lastScrollPosition = currentScrollPosition;
        await page.evaluate(() => window.scrollBy(0, 1000));
        await page.waitForTimeout(1000);
    }
}

const workFlow = async (log, progress, data) => {
    try {
        let loopCount = 0;
        const files = fs.readFileSync(data.files, 'utf-8').split('\n').filter(line => line.trim() !== "");

        const totalIterations = files.length * data.loop;
        let currentIteration = 0;

        while (loopCount < data.loop) {
            let i = 0;
            while (i < files.length) {
                const line = files[i];

                let result;
                if (data.googleMode) {
                    const [keyword, url] = line.split(';');
                    result = {
                        keyword: keyword.trim(),
                        url: url.trim()
                    };
                } else if (data.blogMode) {
                    result = {
                        keyword: "",
                        url: line.trim()
                    };
                }

                try {
                    await mainProccess(log, result.keyword, result.url, data);
                    currentIteration++;
                    const progressPercentage = parseInt((currentIteration / totalIterations) * 100);
                    progress(progressPercentage);
                } catch (error) {
                    log(error);
                }

                if (stop) {
                    log("[INFO] Stop Success");
                    await browser.close();
                    break;
                }

                i++;
            }

            if (stop) {
                log("[INFO] Stop Success");
                await browser.close();
                break;
            }
            loopCount++;
        }

        await browser.close();
    } catch (err) {
        log(err);
        await browser.close();
    }
};

const stopProccess = (log) => {
    stop = true;
    log("[INFO] Stop Proccess, waiting until this proccess done")
}

module.exports = {
    workFlow,
    stopProccess
}