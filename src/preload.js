const gMode = document.getElementById('gMode');
const bMode = document.getElementById('bMode');
const modeVisit = document.querySelectorAll('.modeVisit')
const startBtn = document.getElementById('start')
const stopBtn = document.getElementById('stop')

gMode.addEventListener('change', function() {
    if (gMode.checked) {
        bMode.checked = false;
    }
});

bMode.addEventListener('change', function() {
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

startBtn.addEventListener('click', () => {
    console.log(resultModeVisit);
})



