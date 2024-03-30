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
    print(key.hex())
    print(ct_bytes.hex())
    print(iv.hex())
    return iv + ct_bytes


def Encode(words):
    answer = words[-1]
    words = words[:-1]
    words.sort()
    # 将words拼接为一个字符串,用空格分隔
    # answer = base64.b64encode(answer.encode()).decode()
    all_word = ' '.join(words)
    word_md5 = hashlib.md5(all_word.encode('utf-8')).hexdigest() 
    word_md5_with_salt = hashlib.md5((all_word + 'salt').encode()).hexdigest()
    key = bytearray.fromhex(word_md5_with_salt)
    encrypted = encrypt_data(answer, key).hex()
    # print(decrypt_data(encrypted, key))
    return {'md5': word_md5, 'answer': encrypted}

def word(date):
    # 读取输入
    all_words = []
    encrypted_answer = []
    for i in range(4):
        line = input().split()
        for word in line[:-1]:
            all_words.append(word)
        encrypted_answer.append(Encode(line))
    random.shuffle(all_words)
    # all_words编码为utf8
    for word in all_words:
        word = word.encode('utf-8')
    data = {'words': all_words, 'date': date, 'answers': encrypted_answer}
    with open('./data/'+date+'.json', 'wb') as f:
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
                with open('./data/'+date+'.json', 'r') as f:
                    date = datetime.datetime.strptime(date, '%Y-%m-%d')
                    date += datetime.timedelta(days=1)
                    date = date.strftime('%Y-%m-%d')
            except FileNotFoundError:
                break
        word(date)
    
__main__()