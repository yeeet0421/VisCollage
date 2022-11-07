import json

f_path = './transaction_EN.json'
newf_path = './transaction_EN_level_changed.json'


def readFile(path):
    with open(path, encoding='utf-8') as f:
        return json.load(f)


def writeFile(path, data):
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, sort_keys=True, indent=4)


f = readFile(f_path)

for i in range(len(f)):
    if f[i]['user_level'] == 'A':
        f[i]['user_level'] = 'Platinum'
    elif f[i]['user_level'] == 'B':
        f[i]['user_level'] = 'Gold'
    elif f[i]['user_level'] == 'C':
        f[i]['user_level'] = 'General'


writeFile(newf_path, f)
