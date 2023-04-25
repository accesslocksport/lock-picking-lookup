import json
import re
import sys
import time

import requests


# To get:
#   - Create Google Cloud project in https://console.cloud.google.com/
#   - Enable the YouTube Data API v3
#   - Create an API key
API_KEY = ''

PLAYLIST_ID = 'PLpIvUbO_777y3bRSAKeh4Tq_I9TxbbAm4'
TITLE_RE = re.compile(r'\[(\d+)\]\s+(.*)')


def guess_manufacturer(title):
    with open('supporting_data.json') as f:
        manufacturers = sorted(json.load(f)['manufacturers'], key=len)[::-1]
        searchable_title = ' ' + ' '.join(re.split(r'[^\w\-]', title.casefold())) + ' '
        for manufacturer in manufacturers:
            if f' {manufacturer.casefold()} ' in searchable_title:
                return manufacturer


def extract(item):
    video_id = item['snippet']['resourceId']['videoId']
    full_title = item['snippet']['title']
    match = TITLE_RE.match(full_title)
    if match is None:
        return

    number, short_title = match.groups()

    manufacturer = guess_manufacturer(short_title)

    return {
        'id': video_id,
        'number': int(number),
        'fullTitle': full_title,
        'shortTitle': short_title,
        'manufacturer': manufacturer,
        'url': f'https://www.youtube.com/watch?v={video_id}'
    }


def main(page_size=50, sleep=0.1):
    dataset = {}

    url = 'https://youtube.googleapis.com/youtube/v3/playlistItems'
    page_token = None
    while True:
        payload = json.loads(
            requests.get(
                url,
                params={
                    'playlistId': PLAYLIST_ID,
                    'key': API_KEY,
                    'maxResults': page_size,
                    'pageToken': page_token,
                    'part': 'snippet'
                },
                headers={
                    'Accept': 'application/json'
                }
            ).text
        )

        for item in payload['items']:
            data = extract(item)
            if data is None:
                continue
            dataset[data['number']] = data

        if payload.get('nextPageToken') is None:
            break

        page_token = payload['nextPageToken']

        time.sleep(sleep)
        sys.stdout.write('.')
        sys.stdout.flush()

    with open('docs/data/dataset.json', 'w', encoding='utf-8') as f:
        json.dump({'dataset': dataset}, f, sort_keys=True, indent=2, ensure_ascii=False)


if __name__ == '__main__':
    main()
