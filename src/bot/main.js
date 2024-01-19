const puppeteer = require('puppeteer-extra')
const path = require('path');
const fs = require('fs');
const RecaptchaPlugin = require('puppeteer-extra-plugin-recaptcha');
const stealth = require("puppeteer-extra-plugin-stealth");
const UserAgent = require('user-agents');
puppeteer.use(stealth());
const spoof = path.join(process.cwd(), "src/bot/extension/spoof/");
const captcha = path.join(process.cwd(), "src/bot/extension/captcha/");
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
    let userAgent;
    if (data.uDesktop) {
         userAgent = new UserAgent({ deviceCategory:  'desktop' });
    }else if (data.uMobile) {
      userAgent = new UserAgent({ deviceCategory: 'mobile' });
    }else if (data.iphone) {
      userAgent = new UserAgent({ platform: 'iPhone' });
    }else if (data.uRandom) {
      userAgent = new UserAgent().random();
    }else{
      userAgent = new UserAgent().random();
    }

    browser = await puppeteer.launch({
        headless: data.view,
        defaultViewport: null,
        args: [
            data.buster ? `--disable-extensions-except=${spoof},${captcha}` : `--disable-extensions-except=${spoof}`,
            data.buster ? `--load-extension=${spoof},${captcha}` : `--load-extension=${spoof}`,
            `--user-agent=${userAgent.toString()}`,
            "--disable-setuid-sandbox",
            "--no-sandbox",
            "--mute-audio",
            data.proxy ? `--proxy-server=${proxyServer}` : null
        ].filter(Boolean)
    })

    const blackListUrl = [
        'confirm-action'
    ]

    page = await browser.newPage()
    pages = await browser.pages()

    data.buster && page.on('load', async () => {
        await solveCaptcha(log)
    })

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
        
        data.buster && await handleBuster(data)

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
                    log("Error solving reCAPTCHA:", err);
                    log("[ERROR] Error solving reCAPTCHA");
                    await browser.close()
                    return;
                }
            }
            await page.sleep(5000)
    
            const accept = await page.$('#L2AGLb');
    
            if (accept) {
                log("Accept Found ✅");
                const bahasa = await page.$('#vc3jof');
                await bahasa.click();
                await page.waitForSelector('li[aria-label="‪English‬"]');
                await page.click('li[aria-label="‪English‬"]');
                await page.sleep(5000)
                const accept = await page.$('#L2AGLb');
                await accept.click()
            } else {
                log("Accept Not Found ❌");
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
                log("[INFO] Article Not Found ❌: " + url);
                return
            }
        } else if (data.blogMode) {
            await page.goto(url, {
                waitUntil: ['networkidle2', 'domcontentloaded'],
                timeout: 120000
            })
        }

            await page.sleep(10000);
            await scrollFuncAds(page, data, log)

        if (data.recentPost) {
            page.sleep(30000)
            log("[INFO] Klik Recent Posts");
            const postLinks = await page.$$('#recent-posts-2 ul li a');
            const randomIndex = Math.floor(Math.random() * postLinks.length);
            const randomLink = postLinks[randomIndex];
            await page.sleep(500);
            randomLink.click(),
            page.sleep(30000)
            log('[INFO] Scroll Recent Post Pages\n');
            await scrollFuncAds(page, data, log)
        }

        log('Done');
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

const handleBuster = async (data) => {
    try {
        const pathId = path.join(process.cwd(), 'src/bot/data/id.txt');
        const id = fs.readFileSync(pathId, 'utf-8')
        if (id === '') {
            await page.goto('chrome://extensions', {
                waitUntil: ['domcontentloaded', "networkidle2"],
                timeout: 120000
            })
        } else {
            await page.goto(`chrome-extension://${id.trim()}/src/options/index.html`, {
                waitUntil: ['domcontentloaded', "networkidle2"],
                timeout: 120000
            })
        }

        if (id === '') {
            const idExtension = await page.evaluateHandle(
                'document.querySelector("body > extensions-manager").shadowRoot.querySelector("#items-list").shadowRoot.querySelectorAll("extensions-item")[0]'
            );
            await page.evaluate(e => e.style = "", idExtension)

            const id = await page.evaluate(e => e.getAttribute('id'), idExtension)

            await page.goto(`chrome-extension://${id}/src/options/index.html`, {
                waitUntil: ['domcontentloaded', "networkidle2"],
                timeout: 60000
            })

            fs.writeFileSync(pathId, id)
        }

        await page.sleep(3000)

        await page.evaluate(() => {
            document.querySelector("#app > div > div:nth-child(1) > div.option-wrap > div.option.select > div > div.v-input__control > div > div.v-field__field > div").click()
        })
        await page.sleep(3000)
        await page.evaluate(() => {
            document.querySelector("body > div.v-overlay-container > div > div > div > div:nth-child(3)").click()
        })

        const addApi = await page.$('#app > div > div:nth-child(1) > div.option-wrap > div.wit-add-api > button')
        addApi && await addApi.click()

        const fieldApi = await page.waitForSelector('#input-18')
        fieldApi && await fieldApi.type(data.busterKey)
    } catch (error) {
        throw error;
    }
}

async function solveCaptcha(log) {
    return new Promise(async (resolve, reject) => {
        try {
            const captchaBox = await page.$('[title="reCAPTCHA"]')
            if (captchaBox) {
                log("Captcha Found Solve....");
                await captchaBox.click()
                const elIframe = await page.waitForSelector('iframe[title="recaptcha challenge expires in two minutes"]');
                if (elIframe) {
                    const iframe = await elIframe.contentFrame();
                    if (iframe) {
                        const body = await iframe.waitForSelector('body');
                        if (body) {
                            const solverButton = await body.waitForSelector('#solver-button');
                            if (solverButton) {
                                try {
                                    await solverButton.click();
                                    await page.sleep(10000);
                                    log("Solved ✅");
                                    resolve();
                                } catch (error) {
                                    log('Error clicking the button:', error.message);
                                    reject(error);
                                }
                            } else {
                                log('Button not found in the iframe body.');
                                reject(new Error('Button not found in the iframe body.'));
                            }
                        } else {
                            log('Body element not found in the iframe.');
                            reject(new Error('Body element not found in the iframe.'));
                        }
                    } else {
                        log('Content frame not found for the iframe.');
                        reject(new Error('Content frame not found for the iframe.'));
                    }
                } else {
                    log('Iframe with title "captcha" not found on the page.');
                    reject(new Error('Iframe with title "captcha" not found on the page.'));
                }
            }
        } catch (error) {
            log(error);
            reject(error);
        }
    });
}

const scrollFuncAds = async (newPage, data, log) => {
    const startTimes = Date.now();
    const min = parseInt(data.articleTimes[0]);
    const max = parseInt(data.articleTimes[1]);
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