const { ipcRenderer } = require('electron');
const { default: Swal } = require('sweetalert2');
const gMode = document.getElementById('gMode');
const bMode = document.getElementById('bMode');
const files = document.getElementById('files');
const loop = document.getElementById('loop');
const visibleMode = document.getElementById('visibleMode');
const whoer = document.getElementById('whoer');
const ipsaya = document.getElementById('ipsaya');
const uMobile = document.getElementById('uMobile');
const uDesktop = document.getElementById('uDesktop');
const iphone = document.getElementById('iphone');
const uRandom = document.getElementById('uRandom');
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
const country = document.getElementById('country')
const vpnCookies = document.getElementById('vpnCookies')
const boxCountry = document.getElementById('boxCountry')
const cookiesBox = document.getElementById('cookiesBox')
const cghost = document.getElementById('cghost')
const surf = document.getElementById('surf')
const recentPost = document.getElementById('recentPost')
const [articleMin, articleMax] = document.querySelectorAll('.articleTimes')
const log = document.getElementById('log')
const version = document.getElementById('version')
const progs = document.getElementById('progs')
const warp = document.getElementById('warp');
const message = document.getElementById('message');
const restartButton = document.getElementById('restart-button');
const loaderDownload = document.getElementById('warp-loader')
const [success, failed] = document.querySelectorAll('.status-view')

document.addEventListener('DOMContentLoaded', () => {

    document.querySelector("header").style.webkitAppRegion = 'drag'
    proxyField.disabled = true
    apikey.classList.add('d-none')
    busterkey.classList.add('d-none')
    stopBtn.disabled = true

    const allElement = [loop, captcha, apikey, articleMin, articleMax, visibleMode, whoer, ipsaya, uMobile, uDesktop, uRandom, iphone, proxy, ProxySequence, proxyField, files, buster, busterkey, country, vpnCookies, cghost, recentPost, surf]

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
            apikey.classList.remove('d-none')
        } else {
            apikey.classList.add('d-none')
            apikey.value = ""
        }

        if (buster.checked) {
            busterkey.classList.remove('d-none')
        } else {
            busterkey.classList.add('d-none')
            busterkey.value = ""
        }
    })

    captcha.addEventListener('change', () => {
        if (captcha.checked) {
            buster.checked = false
            apikey.classList.add('mb-3')
        }
    })
    buster.addEventListener('change', () => {
        if (buster.checked) {
            captcha.checked = false
            busterkey.classList.add('mb-3')
        }
    })

    surf.addEventListener('change', () => {
        if (surf.checked) {
            cghost.checked = false
            cookiesBox.classList.remove('d-none')
            boxCountry.classList.remove('d-none')
        } else {
            cookiesBox.classList.add('d-none')
            boxCountry.classList.add('d-none')
        }
    })

    cghost.addEventListener('change', () => {
        if (cghost.checked) {
            surf.checked = false
            cookiesBox.classList.remove('d-none')
            boxCountry.classList.remove('d-none')
        } else {
            cookiesBox.classList.add('d-none')
            boxCountry.classList.add('d-none')
        }
    })

    gMode.addEventListener('change', () => {
        if (gMode.checked) {
            Swal.fire({
                icon: "info",
                title: "Information !",
                text: "Remember google mode need captcha service !"
            })
        }
    })

    function Toast(model, msg) {
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
            loop: loop.value,
            recentPost: recentPost.checked,
            captcha: captcha.checked,
            apikey: apikey.value,
            articleTimes: [articleMin.value, articleMax.value],
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
            busterKey: busterkey.value,
            cghost: cghost.checked,
            country: country.files[0]?.path,
            vpnCookies: vpnCookies.files[0]?.path,
            surf: surf.checked
        }

        let valid;


        if (files.value === "") {
            Toast("error", "Files can't be null")
        } else if (captcha.checked && apikey.value == "") {
            Toast("question", "Captcha is on but apikey is null")
        } else if (proxy.checked && proxyField.value == "") {
            Toast("question", "Proxy is on but proxyfield is null")
        } else if (cghost.checked && country.value === "") {
            Toast("question", "File Country cant be null")
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
        success.innerText = 0
        failed.innerText = 0
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

    ipcRenderer.on('status', (event, status, count) => {
        status ? success.innerText = count : failed.innerText = count
    })

    ipcRenderer.send('app_version');
    ipcRenderer.on('app_version', (event, arg) => {
        version.innerText = 'v' + arg.version;
    });

    ipcRenderer.on('update_available', () => {
        ipcRenderer.removeAllListeners('update_available');
        message.innerText = 'A new update is available. Downloading now...';
        warp.classList.remove('hidden');
        loaderDownload.classList.remove('hidden');
    });

    ipcRenderer.on('update_progress', (event, progress) => {
        updateProgress = progress;
        const progsDown = document.getElementById('download-progress')
        progsDown.style.width = updateProgress + '%'
        progsDown.setAttribute('aria-valuenow', updateProgress)
    });

    ipcRenderer.on('update_downloaded', () => {
        ipcRenderer.removeAllListeners('update_downloaded');
        message.innerText = 'Update Downloaded. It will be installed on restart. Restart now?';
        restartButton.classList.remove('d-none');
        warp.classList.remove('hidden');

        loaderDownload.classList.add('hidden');
    });

    restartButton.addEventListener("click", (e) => {
        ipcRenderer.send('restart_app');
    })
})