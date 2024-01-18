const {
    ipcRenderer
} = require('electron');
const {
    default: Swal
} = require('sweetalert2');
const gMode = document.getElementById('gMode');
const bMode = document.getElementById('bMode');
const files = document.getElementById('files');
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
const buster = document.getElementById('buster')
const busterkey = document.getElementById('busterkey')
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
const version = document.getElementById('version')
const progs = document.getElementById('progs')

document.addEventListener('DOMContentLoaded', () => {

    document.querySelector("header").style.webkitAppRegion = 'drag'
    proxyField.disabled = true
    apikey.disabled = true
    busterkey.disabled = true
    stopBtn.disabled = true

    const firstMode = [gMode, bMode, mBanner, mSB, mPU, directLink, recentPost]
    const secondMode = [yt, twitter, ig, moz, blogDirect]
    const allElement = [...firstMode, ...secondMode, countVisitAds, loop, captcha, apikey, articleMin, articleMax, adsMin, adsMax, visibleMode, whoer, ipsaya, uMobile, uDesktop, uRandom, iphone, proxy, ProxySequence, proxyField, files, buster, busterkey]

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
            proxyField.value = ""
        }

        if (captcha.checked) {
            apikey.disabled = false
        } else {
            apikey.disabled = true
            apikey.value = ""
        }
        
        if (buster.checked) {
            busterkey.disabled = false
        } else {
            busterkey.disabled = true
            busterkey.value = ""
        }

    })
    
    gMode.addEventListener('change', () => {
        if (gMode.checked) {
            Swal.fire({
                icon : "info",
                title: "Information !",
                text : "Remember google mode need captcha service !"
            })
        }
    })

    function Toast(model,msg) {
        Swal.fire({
            icon: model,
            title: model === "error" ? "Oops..." : "Is there something wrong ?",
            text: msg,
        });
    } 

    function extractData() {
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
            apikey: apikey.value,
            articleTimes: [articleMin.value, articleMax.value],
            adsTimes: [adsMin.value, adsMax.value],
            view: visibleMode.checked ? false : 'new',
            whoer: whoer.checked,
            ipsaya: ipsaya.checked,
            proxy: proxy.checked,
            ProxySequence: ProxySequence.checked,
            proxyField: proxyField.value,
            uDesktop: uDesktop.checked,
            uMobile: uMobile.checked,
            uRandom: uRandom.checked,
            iphone: iphone.checked,
            buster: buster.checked,
            busterKey: busterkey.value
        }

        let valid;

        let firstModeValidate = false;
        let secondModeValidate = false;

        firstMode.forEach((modeObject) => {
            if (modeObject.checked) {
                firstModeValidate = true;
            }
        });

        secondMode.forEach((modeObject) => {
            if (modeObject.checked) {
                secondModeValidate = true;
            }
        });

        if (!firstModeValidate && !secondModeValidate) {
            Toast("error", "Visit mode or visit direct link mode must be selected")
        } else if (files.value === "") {
            Toast("error", "Files can't be null")
        } else if (captcha.checked && apikey.value == "") {
            Toast("question", "Captcha is on but apikey is null")
        } else if (proxy.checked && proxyField.value == "") {
            Toast("question", "Proxy is on but proxyfield is null")
        } else {
            valid = true
        }

        if (valid) {
            progs.style.width = ''
            progs.setAttribute('aria-valuenow', '0')
            progs.innerHTML = '0%'
            ipcRenderer.send('main-proccess', data);
        }
    }

    startBtn.addEventListener('click', extractData)

    ipcRenderer.on('run', () => {
        allElement.forEach(e => {
            e.disabled = true
            startBtn.disabled = true
            stopBtn.disabled = false
        })
    })

    ipcRenderer.on('force', () => {
        allElement.forEach(e => {
            e.disabled = false
            startBtn.disabled = false
            stopBtn.disabled = true
        })
    })

    stopBtn.addEventListener('click', () => {
        if (confirm("Realy want to stop the proccess ?") == true) {
            ipcRenderer.send('stop');
            startBtn.disabled = false
            stopBtn.disabled = true
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

    secondMode.forEach((e, i) => {
        firstMode.forEach((j) => {
            e.addEventListener('change', () => {
                if (e.checked) {
                    j.checked = false
                }
            })
            j.addEventListener('change', () => {
                if (j.checked) {
                    e.checked = false
                }
            })
        })
    })

    ipcRenderer.send('app_version');
    ipcRenderer.on('app_version', (event, arg) => {
        version.innerText = 'v' + arg.version;
    });
})