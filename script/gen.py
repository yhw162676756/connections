# json库
import json
import hashlib
import datetime
import random
from Cryptodome.Cipher import AES
from Cryptodome.Util.Padding import pad, unpad


def decrypt_data(ciphertext:bytes, key:bytes):
    iv = ciphertext[:AES.block_size]
    cipher = AES.new(key, AES.MODE_CBC, iv=iv)
    pt_bytes = cipher.decrypt(ciphertext[AES.block_size:])
    return unpad(pt_bytes, AES.block_size).decode()

def encrypt_data(data:str, key:bytes):
    cipher = AES.new(key, AES.MODE_CBC)
    ct_bytes = cipher.encrypt(pad(data.encode(), AES.block_size))
    iv = cipher.iv
    return iv + ct_bytes


def Encode(words):
    answer = words[4:]
    answer = ' '.join(answer)
    words = words[:4]
    words.sort()
    all_word = ' '.join(words)
    word_md5 = hashlib.md5(all_word.encode('utf-8')).hexdigest() 
    word_md5_with_salt = hashlib.md5((all_word + 'salt').encode()).hexdigest()
    key = bytearray.fromhex(word_md5_with_salt)
    encrypted = encrypt_data(answer, key).hex()
    return {'md5': word_md5, 'answer': encrypted}

def myInput():
    res = input()
    # 如果行内只有空白字符，重新输入
    while not res.strip():
        res = input()
    return res

path = './data/'

def word(date):
    # 读取输入
    all_words = []
    encrypted_answer = []
    for i in range(4):
        line = myInput().split()
        print('#', i+1, ' ', line)
        for word in line[:4]:
            all_words.append(word)
        encrypted_answer.append(Encode(line))
    print('生成中...')
    random.shuffle(all_words)
    # all_words编码为utf8
    for word in all_words:
        word = word.encode('utf-8')
    data = {'words': all_words, 'date': date, 'answers': encrypted_answer}
    print('生成成功！')
    with open(path+date+'.json', 'wb') as f:
        f.write(json.dumps(data, indent=4, ensure_ascii=False).encode('utf-8'))

def __main__():
    print('按顺序输入四组词，以空格分隔，并附加解析，例如：')
    print('苹果 香蕉 橘子 李子 水果')
    print('...')
    while True:
        date = datetime.datetime.now().strftime('%Y-%m-%d')
        # 检查是否有以当前日期命名的文件，如果有则日期加一
        while True:
            try:
                with open(path+date+'.json', 'r') as f:
                    date = datetime.datetime.strptime(date, '%Y-%m-%d')
                    date += datetime.timedelta(days=1)
                    date = date.strftime('%Y-%m-%d')
            except FileNotFoundError:
                break
        word(date)
    
__main__()

# 吉巳 正午 真丑 良辰 [表示对的字][地支]
# 守岁 灯谜 窗花 鞭炮 春节文化习俗
# 关羽 分解 手抓 次元 开头可以加表示2的字 （二）次元 （两）手抓 （双）关羽 （复）分解
# 两对 径直 满座 红脸 英文是poker牌型 径直-straight-顺子 红脸-flush-同花 满座-full house-葫芦