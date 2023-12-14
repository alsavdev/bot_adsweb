const swal = require('sweetalert2/dist/sweetalert2')
const {
    ipcRenderer
} = require('electron')
const gMode = document.getElementById('gMode');
const bMode = document.getElementById('bMode');
const files = document.getElementById('files');
const mView = document.getElementById('mView');
const mBanner = document.getElementById('mBanner');
const mSB = document.getElementById('mSB');
const mPU = document.getElementById('mPU');
const countVisitAds = document.getElementById('countVisitAds');
const loop = document.getElementById('loop');
const visibleMode = document.getElementById('visibleMode');
const whoer = document.getElementById('whoer');
const ipsaya = document.getElementById('ipsaya');
const uMobile = document.getElementById('uMobile');
const uDesktop = document.getElementById('uDesktop');
const iphone = document.getElementById('iphone');
const uRandom = document.getElementById('uRandom');
const modeVisit = document.querySelectorAll('.modeVisit')
const modeDirect = document.querySelectorAll('.modeDirect')
const ua = document.querySelectorAll('.ua')
const startBtn = document.getElementById('start')
const stopBtn = document.getElementById('stop')
const proxy = document.getElementById('proxy')
const ProxySequence = document.getElementById('ProxySequence')
const proxyField = document.getElementById('proxyField')
const captcha = document.getElementById('captcha')
const apikey = document.getElementById('apikey')
const yt = document.getElementById('yt')
const twitter = document.getElementById('twitter')
const ig = document.getElementById('ig')
const moz = document.getElementById('moz')
const directLink = document.getElementById('directLink')
const blogDirect = document.getElementById('blogDirect')
const recentPost = document.getElementById('recentPost')
const [articleMin, articleMax] = document.querySelectorAll('.articleTimes')
const [adsMin, adsMax] = document.querySelectorAll('.adsTimes')
const log = document.getElementById('log')
const progs = document.getElementById('progs')


document.addEventListener('DOMContentLoaded', () => {

    document.querySelector("header").style.webkitAppRegion = 'drag'
    proxyField.disabled = true
    apikey.disabled = true
    stopBtn.disabled = true

    gMode.addEventListener('change', function () {
        if (gMode.checked) {
            bMode.checked = false;
        }
    });

    bMode.addEventListener('change', function () {
        if (bMode.checked) {
            gMode.checked = false;
        }
    });

    modeVisit.forEach(switchItem => {
        switchItem.addEventListener('change', () => {
            if (switchItem.checked) {
                modeVisit.forEach(otherSwitch => {
                    if (otherSwitch !== switchItem) {
                        otherSwitch.checked = false;
                    }
                });
            }
        });
    });

    modeDirect.forEach(switchItem => {
        switchItem.addEventListener('change', () => {
            if (switchItem.checked) {
                modeDirect.forEach(otherSwitch => {
                    if (otherSwitch !== switchItem) {
                        otherSwitch.checked = false;
                    }
                });
            }
        });
    });

    ua.forEach(switchItem => {
        switchItem.addEventListener('change', () => {
            if (switchItem.checked) {
                ua.forEach(otherSwitch => {
                    if (otherSwitch !== switchItem) {
                        otherSwitch.checked = false;
                    }
                });
            }
        });
    });

    document.addEventListener('change', () => {
        if (proxy.checked) {
            proxyField.disabled = false
        } else {
            proxyField.disabled = true
        }

        if (captcha.checked) {
            apikey.disabled = false
        } else {
            apikey.disabled = true
        }
    })

    function extractdata() {
        const data = {
            googleMode: gMode.checked,
            blogMode: bMode.checked,
            files: files.files[0]?.path,
            modeBanner: mBanner.checked,
            modeSocialBar: mSB.checked,
            modePopUnder: mPU.checked,
            modeDirectLink: directLink.checked,
            yt: yt.checked,
            twitter: twitter.checked,
            ig: ig.checked,
            moz: moz.checked,
            blogDirect: blogDirect.checked,
            repeat: countVisitAds.value,
            loop: loop.value,
            recentPost: recentPost.checked,
            captcha: captcha.checked,
            captapiCaptcha: apikey.value,
            articleTimes: [articleMin.value, articleMax.value],
            adsTimes: [adsMin.value, adsMax.value],
            view: visibleMode.checked ? false : 'new',
            whoer: whoer.checked,
            ipsaya: ipsaya.checked,
            proxy: proxy.checked,
            ProxySequence: ProxySequence.checked,
            proxyField: proxyField.value,
            uDesktop : uDesktop.checked,
            uMobile : uMobile.checked,
            uRandom : uRandom.checked,
            iphone : iphone.checked,
        }

        ipcRenderer.send('main-proccess', data);
    }

    startBtn.addEventListener('click', extractdata)

    stopBtn.addEventListener('click', () => {
        if (confirm("Realy want to stop the proccess ?") == true) {
            ipcRenderer.send('stop');
            startBtn.classList.remove("hidden")
            stopBtn.classList.add("hidden")
        }
    })

    ipcRenderer.on('log', (event, logs) => {
        log.value = logs;
        log.scrollTop = log.scrollHeight
    })

    function proggress(prog) {
        progs.style.width = prog + '%'
        progs.setAttribute('aria-valuenow', prog)
        progs.innerHTML = prog + '%'

    }

    ipcRenderer.on('proggress', (event, prog) => {
        for (const pros of prog) {
            proggress(pros);
        }
    });
})