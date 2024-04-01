var AES = CryptoJS.AES;
async function readJsonFile(filename) {
    try {
        console.log(filename);
        const response = await fetch(filename);
        const jsonData = await response.json();
        return jsonData;
    } catch (error) {
        console.error(error);
        return null;
    }
}

let fileCache = {}; // 缓存数据文件

function processData(data) {
    if (data) {
        console.log(data);
        let words = data.words;
        for (let i = 0; i < words.length; i++) {
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
        readJsonFile('./data/' + filename).then(data => {
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
let unusedColors = [    // 正确答案的颜色
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
        const header = document.getElementById('head');
        header.textContent = 'Congratulations!';
        header.style.color = "#df4040";
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

function toggleButton(button, buttonNumber) { // 选择单词
    button.classList.toggle('clicked');
    let word = button.innerText;
    if (button.classList.contains('clicked')) {
        currentSequence.push(word);
    } else {
        currentSequence = currentSequence.filter(item => item !== word);
    }
    if (currentSequence.length >= 4) {
        if (checkAnswer()) {
            lockCurrentSequence();
            currentSequence = [];
            checkWin();
        } else {

            currentSequence = [];
            // 将选中的按钮立即变成红色
            let buttons = document.getElementsByClassName('btn');
            for (let i = 0; i < buttons.length; i++) {
                if (buttons[i].classList.contains('clicked')) {
                    buttons[i].classList.remove('clicked');
                    buttons[i].classList.add('wrong');
                }
            }

            // 渐变回未选中的颜色
            setTimeout(() => {
                for (let i = 0; i < buttons.length; i++) {
                    buttons[i].classList.remove('wrong');
                }
            }, 500); // 渐变时间，单位毫秒
        }
    }
}

async function getFileList() {
    try {
        const response = await fetch('./data/fileList');
        const fileList = (await response.text()).split('\n');
        console.log(fileList);
        return fileList.filter(name => name.endsWith('.json'))
    } catch (error) {
        console.error(error);
        return null;
    }
}

function updateSideBar() { // 动态生成日期链接
    getFileList().then(fileList => {
        generateDateLinks(fileList);
    });
    function generateDateLinks(fileList) {

        const allDate = fileList.map(name => name.slice(0, 10));
        const allYearMonth = allDate.map(date => date.slice(0, 7));
        const allDay = allDate.map(date => date.slice(8));

        // 动态生成日期链接
        const dateList = document.getElementById('dateList');

        let yearMonthToDays = {};

        for (let i = 0; i < allYearMonth.length; i++) {
            const yearMonth = allYearMonth[i];
            const day = allDay[i];
            // 如果日期超过当前日期，则跳过
            const currentDate = new Date();
            const thatDate = new Date(yearMonth + '-' + day);
            thatDate.setHours(0, 0, 0, 0);
            if (thatDate > currentDate) {
                continue;
            }
            if (!(yearMonth in yearMonthToDays)) {
                const monthItem = document.createElement('li');
                const monthLink = document.createElement('a');
                monthLink.classList.add('month');
                monthLink.textContent = yearMonth;
                monthLink.setAttribute('href', '#');
                monthLink.setAttribute('data-year-month', yearMonth); // 添加自定义属性
                monthItem.appendChild(monthLink);
                dateList.appendChild(monthItem);
                const dayList = document.createElement('ul');
                dayList.setAttribute('id', `days_${yearMonth}`);
                monthItem.appendChild(dayList);
                yearMonthToDays[yearMonth] = dayList;
            }
            // 添加月份下的日期链接，初始状态为隐藏
            const dayList = yearMonthToDays[yearMonth];

            // 生成每天的链接
            const dayItem = document.createElement('li');
            const dayLink = document.createElement('a');
            dayLink.classList.add('day');
            dayLink.textContent = `${yearMonth}-${day}`;
            dayLink.setAttribute('href', '#');
            dayLink.setAttribute('id', `${yearMonth}-${day}`);
            dayLink.setAttribute('data-year-month-day', `${yearMonth}-${day}`); // 添加自定义属性
            dayItem.appendChild(dayLink);
            dayList.appendChild(dayItem);
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
                // 将选择的日期保存到 sessionStorage
                sessionStorage.setItem('selectedDate', yearMonthDay);
                window.location.reload(); // 刷新页面
            });
        });
    };
    // 控制月份下的日期链接显示与隐藏
}

function toggleSidebar() {  // 控制侧边栏的显示与隐藏
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('collapsed');
}

function loadJsonFileForDate(date) {
    const yearMonthDay = date;
    loadJsonFile(yearMonthDay + '.json');
}

function init() {
    sidebar.classList.toggle('collapsed');
    updateSideBar();
    let selectedDate = sessionStorage.getItem('selectedDate'); // 获取保存的日期信息
    if (!selectedDate) {
        let date = new Date();
        let year = date.getFullYear();
        let month = (date.getMonth() + 1).toString().padStart(2, '0');
        let day = date.getDate().toString().padStart(2, '0'); 
        selectedDate = `${year}-${month}-${day}`;
        console.log(selectedDate);
    }
    
    loadJsonFileForDate(selectedDate); // 加载保存的日期对应的 JSON 文件
}

init();

