import json

f_path = './transaction_EN_level_changed.json'
newf_path = './transaction_EN_level_invoicePrice_changed.json'


def readFile(path):
    with open(path, encoding='utf-8') as f:
        return json.load(f)


def writeFile(path, data):
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, sort_keys=True, indent=4)


f = readFile(f_path)

for i in range(len(f)):
    f[i]["revenue"] = f[i].pop("invoice_price")


writeFile(newf_path, f)
