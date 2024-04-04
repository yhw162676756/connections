import os
import requests
path = './data/'
fileListPath = path + 'fileList'
# oldFileSet = set()
# if os.path.exists(fileListPath):
#     with open(fileListPath, 'r') as f:
#         for line in f:
#             oldFileSet.add(line.strip())
# newfileSet = set(os.listdir(path))
# newfileSet.remove('fileList')
# addedfileSet = newfileSet - oldFileSet
# if not addedfileSet:
#     print('No new file added.')
#     exit()
# with open(fileListPath, 'a') as f:
#     for file in addedfileSet:
#         f.write(file+'\n')
# print('File list updated.')

url = 'https://connects-update-zwpgxvhxeg.cn-hangzhou.fcapp.run'
# 向url post文件
# for file in addedfileSet:
#     with open(path+file, 'rb') as f:
#         data = f.read()
#         res = requests.post(url, data=data)
#         print(res.text)
with open(fileListPath, 'rb') as f:
    data = f.read()
    # res = requests.post(url, data=data)
    res = requests.post(url, data=data, headers={'Content-Type': 'application/octet-stream'})
    print(res.text)
print('All files uploaded.')