const puppeteer = require('puppeteer-extra')
const path = require('path');
const fs = require('fs')
const stealth = require("puppeteer-extra-plugin-stealth");
const UserAgent = require('user-agents');
puppeteer.use(stealth());

const spoof = path.join(process.cwd(), "extension/spoof/");

(async (repeat = 2) => {
    const timeout = 3000
    let page, pages, checkPop;
    const proxy = true;
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: [
            `--disable-extensions-except=${spoof}`,
            `--load-extension=${spoof}`,
            "--disable-setuid-sandbox",
            "--no-sandbox",
            "--mute-audio",
            proxy ? "--proxy-server=private.residential.proxyrack.net:10003" : null,
        ].filter(Boolean)
    })

    const userAgent = new UserAgent({
        deviceCategory: 'mobile'
    });

    const blackListUrl = [
        'confirm-action'
    ]

    page = await browser.newPage()
    pages = await browser.pages()

    await page.setUserAgent(userAgent.toString())
    checkPop = setInterval(async () => {
        pages = await browser.pages()
        if (pages.length > 2) {
            for (let i = 2; i < pages.length; i++) {
                if (i !== 0 && i !== 1) {
                    await pages[i].close();
                }
            }
        }
    }, 1000)

    page.sleep = function (timeout) {
        return new Promise(function (resolve) {
            setTimeout(resolve, timeout);
        });
    };

    try {
        proxy && await page.authenticate({
            username: `bismillah2023`,
            password: `a6ae10-5354aa-b24a1c-4a1aea-bcc31b`
        });

        page.on('dialog', async dialog => {
            console.log(dialog.message())
            await dialog.dismiss();
        })

        await page.goto('https://millenniumbusiness.my.id/regarding-making-money-online-what-youll-find-here-is-priceless/', {
            waitUntil: ['networkidle2', 'domcontentloaded'],
            timeout: 120000
        })

        console.log('Scroll Page Utama');

        await scrollFuncAds(page, 60)

        let loops = 0;
        while (loops < repeat) {
            console.log(`\nLoop ${loops}`);
            const newTargetPromise = new Promise((resolve) => {
                browser.once('targetcreated', (target) => {
                    resolve(target);
                });
            });

            await page.waitForSelector('body', {
                waitUntil: ['networkidle2', 'domcontentloaded'],
                timeout: 120000
            })

            console.log('Finding the ads element');
            const clickAds = await page.$$('body > div')
            clearInterval(checkPop)

            if (clickAds.length > 0) {
                try {
                    await clickAds[clickAds.length - 1].click();
                    await page.sleep(10000);
                    pages = await browser.pages();
                } catch (error) {
                    console.log('Not Clickable:', error);
                }
            } else {
                return;
            }

            await page.waitForTimeout(timeout)
            if (pages.length > 2) {
                console.log('Ads Found ✅');
                const newTarget = await newTargetPromise;
                const newPage = await newTarget.page();
                await newPage.setUserAgent(userAgent.toString())

                newPage.on('error', (error) => {
                    console.error('Page error:', error);
                });

                await newPage.waitForTimeout(20000)

                console.log('Page Iklan 1');
                console.log('Skenario Scroll');

                blackListUrl.forEach(async (url) => {
                    if (await page.url().includes(url)) {
                        return;
                    }
                })

                await scrollFuncAds(newPage, 60)

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
                            console.log(`Initiate click url href="${hrefValue}"`);

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
                            console.log('Url not found');
                            return;
                        }
                    } catch (error) {
                        return;
                    }

                    console.log('Page Iklan 2');
                    console.log('Skenario scroll current page');
                    await scrollFuncAds(newPage, 60)

                } else {
                    console.log('Ads Not Found ❌');
                }

                pages = await browser.pages()
                console.log('Intiate Close all page except page 1 & 2');
                for (let i = 2; i < pages.length; i++) {
                    if (i !== 0 && i !== 1) {
                        await pages[i].close();
                    }
                }

                page = pages[1]
                console.log('Done Visit Ads');
                await page.sleep(10000)
            } else {
                console.log('Ads Not Found ❌');
                clearInterval(checkPop)
            }
            loops++
        }

        const recentPost = await page.$$('#block-3 > div > div > ul > li > a')
        const randomRecentPost = Math.floor(Math.random() * (recentPost.length - 5))
        const urlRecent = await page.evaluate((e) => e.getAttribute('href'), recentPost[randomRecentPost])

        console.log(`\nGo To Recent Post Page ${urlRecent} No ${randomRecentPost}`);
        recentPost.length > 0 && await page.goto(urlRecent, {
            waitUntil: ['networkidle2', 'domcontentloaded'],
            timeout: 120000
        })

        console.log('Scroll Recent Post Pages');
        await scrollFuncAds(page, 60)

        console.log('Done All');
        await browser.close()
    } catch (error) {
        clearInterval(checkPop)
        console.error(error)
        await browser.close()
    }
})();

const scrollFuncAds = async (newPage, durationInSeconds) => {
    const startTime = Date.now();
    const endTime = startTime + durationInSeconds * 1000;

    while (Date.now() < endTime) {
        await newPage.evaluate(() => {
            window.scrollBy(0, 500);
        });
        await newPage.waitForTimeout(500);
        await newPage.evaluate(() => {
            window.scrollBy(0, -250);
        });
        await newPage.waitForTimeout(500);
    }
};