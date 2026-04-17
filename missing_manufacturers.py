import json


def main(data='docs/data/dataset.json', manufacturers='supporting_data.json'):
    with open(manufacturers, 'r', encoding='utf-8') as f:
        manufacturers = set(json.load(f)['manufacturers'])

    with open(data, 'r', encoding='utf-8') as f:
        dataset = json.load(f)['dataset']
        for item in dataset:
            if item['manufacturer'] is None:
                print(item['fullTitle'])


if __name__ == '__main__':
    main()
