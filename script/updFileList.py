# 将./data/的文件列表写入./data/fileList中
import os
path = './data/'
fileList = os.listdir(path)
# print(fileList)
fileList.remove('fileList')
with open(path + 'fileList', 'w') as f:
    for file in fileList:
        f.write(file + '\n')
