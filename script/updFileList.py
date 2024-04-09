import os
import requests
path = './data/'
fileListPath = path + 'fileList'
oldFileSet = set()
if os.path.exists(fileListPath):
    with open(fileListPath, 'r') as f:
        for line in f:
            oldFileSet.add(line.strip())
newfileList = os.listdir(path)
newfileList.remove('fileList')
newfileList.sort()
if not newfileList:
    print('No new file added.')
    exit()
with open(fileListPath, 'w') as f:
    for file in newfileList:
        f.write(file+'\n')
print('File list updated.')

url = 'https://connects-update-zwpgxvhxeg.cn-hangzhou.fcapp.run'
# 向url post文件
# for file in addedfileSet:
#     with open(path+file, 'rb') as f:
#         data = f.read()
#         res = requests.post(url, data=data)
#         print(res.text)
# with open(fileListPath, 'rb') as f:
#     data = f.read()
#     print(data)
#     # res = requests.post(url, data=data)
#     res = requests.post(url, data=data, headers={'Content-Type': 'text/plain;charset=UTF-8'})
#     print(res.text)
# print('All files uploaded.')