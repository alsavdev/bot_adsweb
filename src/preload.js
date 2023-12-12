const gMode = document.getElementById('gMode');
const bMode = document.getElementById('bMode');
const files = document.getElementById('files');
const mView = document.getElementById('mView');
const mBanner = document.getElementById('mBanner');
const mBannerBla = document.getElementById('mBannerBla');
const mSB = document.getElementById('mSB');
const mPU = document.getElementById('mPU');
const countVisitAds = document.getElementById('countVisitAds');
const loop = document.getElementById('loop');
const visibleMode = document.getElementById('visibleMode');
const whoer = document.getElementById('whoer');
const ipsaya = document.getElementById('ipsaya');
const uMobile = document.getElementById('uMobile');
const uDesktop = document.getElementById('uDesktop');
const uRandom = document.getElementById('uRandom');
const modeVisit = document.querySelectorAll('.modeVisit')
const startBtn = document.getElementById('start')
const stopBtn = document.getElementById('stop')
const proxy = document.getElementById('proxy')
const proxyField = document.getElementById('proxyField')
const captcha = document.getElementById('captcha')
const apikey = document.getElementById('apikey')

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

    let resultModeVisit;

    modeVisit.forEach(switchItem => {
        switchItem.addEventListener('change', () => {
            if (switchItem.checked) {
                resultModeVisit = switchItem.checked
                modeVisit.forEach(otherSwitch => {
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

})