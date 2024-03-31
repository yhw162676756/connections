var AES = CryptoJS.AES;
async function readJsonFile(filename) {
    try {
        const response = await fetch(filename);
        const jsonData = await response.json();
        return jsonData;
    } catch (error) {
        console.error(error);
        return null;
    }
}

let fileCache = {};

function processData(data) {
    if (data) {
        console.log(data);
        let words = data.words;
        for (let i = 0; i < words.length; i++) {
            // 转为utf-8编码
            document.getElementById('btn' + i).innerText = words[i];
        }
        let answers = data.answers;
        for (let i = 0; i < answers.length; i++) {
            let ans_pair = answers[i]
            answer[ans_pair['md5']] = ans_pair['answer'];
        }
    }
    else {
        alert('File not found!');
    }
}

function loadJsonFile(filename) {
    if (filename in fileCache) {
        processData(fileCache[filename]);
    } else {
        readJsonFile('./data/'+filename).then(data => {
            processData(data);
        });
    }
}

function decryptData(data, keyHex) {
    const key = CryptoJS.enc.Hex.parse(keyHex);
    const iv = CryptoJS.enc.Hex.parse(data.slice(0, 32));
    const ciphertext = CryptoJS.enc.Hex.parse(data.slice(32));
    console.log(keyHex);
    console.log(ciphertext.toString());
    console.log(iv.toString());
    const decrypted = CryptoJS.AES.decrypt({ ciphertext }, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
}


let currentSequence = [];
let answer = {}
let unusedColors = [
    "#70ba70",
    "#803080",
    "#afaf00",
    "#cf7070",
]

function lockButton(button) {
    button.classList.add('clicked');
    button.onclick = null;
}

function lockCurrentSequence() {
    let buttons = document.getElementsByClassName('btn');
    let color = unusedColors.pop();
    for (let i = 0; i < buttons.length; i++) {
        if (currentSequence.includes(buttons[i].innerText)) {
            lockButton(buttons[i]);
            buttons[i].style.backgroundColor = color;
        }
    }
}

function checkWin() {
    if (unusedColors.length == 0) {
        setTimeout(() => {
            alert('Congratulations! You have finished the game!');
        }, 100);
    }
}

function showAnswer(ans_text) {
    let paragraph = document.createElement('p');
    paragraph.textContent = currentSequence.join(', ') + ' :   ' + ans_text;
    document.getElementById('result').appendChild(paragraph);
}

function checkAnswer() {
    currentSequence.sort();
    let result = currentSequence.join(' ');
    let hash = CryptoJS.MD5(result).toString();
    if (hash in answer) {
        let ciphertext = answer[hash];
        let key = CryptoJS.MD5(result + 'salt');
        ans_text = decryptData(ciphertext, key.toString());
        showAnswer(ans_text);
        return true;
    }
    return false;
}

function toggleButton(button, buttonNumber) {
    button.classList.toggle('clicked');
    let word = button.innerText;
    if (button.classList.contains('clicked')) {
        currentSequence.push(word);
    } else {
        currentSequence = currentSequence.filter(item => item !== word);
    }
    if (checkAnswer()) {
        lockCurrentSequence();
        currentSequence = [];
    }
    checkWin();
}

function updateSideBar() {
    document.addEventListener('DOMContentLoaded', function () {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;
        const currentDay = currentDate.getDate();
    
        // 获取每个月的天数
        function getDaysInMonth(year, month) {
            return new Date(year, month, 0).getDate();
        }
    
        // 动态生成日期链接
        const dateList = document.getElementById('dateList');
        for (let year = currentYear; year >= 2024; year--) {
            for (let month = (year === currentYear ? currentMonth : 12); month >= 1; month--) {
                const numDays = year===currentYear && month===currentMonth ? currentDay : getDaysInMonth(year, month);
                const yearMonth = year + '-' + (month < 10 ? '0' + month : month);
                const monthItem = document.createElement('li');
                const monthLink = document.createElement('a');
                monthLink.classList.add('month');
                monthLink.textContent = yearMonth;
                monthLink.setAttribute('href', '#');
                monthLink.setAttribute('data-year-month', yearMonth); // 添加自定义属性
                monthItem.appendChild(monthLink);
                dateList.appendChild(monthItem);
                
                // 添加月份下的日期链接，初始状态为隐藏
                const dayList = document.createElement('ul');
                dayList.setAttribute('id', `days_${yearMonth}`);
                monthItem.appendChild(dayList);
                
                // 生成每天的链接
                for (let day = numDays; day >= 1; day--) {
                    const dayItem = document.createElement('li');
                    const dayLink = document.createElement('a');
                    dayLink.classList.add('day');
                    dayLink.textContent = `${yearMonth}-${day}`;
                    dayLink.setAttribute('href', '#');
                    dayLink.setAttribute('data-year-month-day', `${yearMonth}-${day}`); // 添加自定义属性
                    dayItem.appendChild(dayLink);
                    dayList.appendChild(dayItem);
                }
            }
        }
    
        // 添加事件监听器，实现月份的展开与折叠
        const monthLinks = document.querySelectorAll('#dateList a[data-year-month]');
        monthLinks.forEach(function (link) {
            link.addEventListener('click', function (event) {
                event.preventDefault();
                const clickedYearMonth = this.getAttribute('data-year-month');
                const clickedSubMenu = document.getElementById(`days_${clickedYearMonth}`);
                const allSubMenus = document.querySelectorAll('#dateList ul');
    
                allSubMenus.forEach(function (menu) {
                    if (menu !== clickedSubMenu) {
                        menu.style.display = 'none';
                        menu.parentNode.classList.remove('active');
                    }
                });
    
                if (clickedSubMenu.style.display === 'block') {
                    clickedSubMenu.style.display = 'none';
                    this.parentNode.classList.remove('active');
                } else {
                    clickedSubMenu.style.display = 'block';
                    this.parentNode.classList.add('active');
                }
            });
        });
    
        // 添加事件监听器，加载 JSON 文件
        const dayLinks = document.querySelectorAll('#dateList a[data-year-month-day]');
        dayLinks.forEach(function (link) {
            link.addEventListener('click', function (event) {
                event.preventDefault();
                const yearMonthDay = this.getAttribute('data-year-month-day');
                loadJsonFile(yearMonthDay + '.json');
            });
        });
    });
    // 控制月份下的日期链接显示与隐藏
}


function init() {
    updateSideBar();

    let date = new Date();
    let dateString = date.toISOString().split('T')[0];
    console.log(dateString);
    loadJsonFile(dateString + '.json');
}

init();
