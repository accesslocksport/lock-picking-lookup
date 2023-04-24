import json
import re
import sys
import time

import requests


# To get:
#   - Create Google Cloud project
#   - Enable the YouTube Data API v3
#   - Create an API key
API_KEY = ''

PLAYLIST_ID = 'PLpIvUbO_777y3bRSAKeh4Tq_I9TxbbAm4'
TITLE_RE = re.compile(f'\[(\d+)\]\s+(.*)')


def extract(item):
    video_id = item['snippet']['resourceId']['videoId']
    full_title = item['snippet']['title']
    match = TITLE_RE.match(full_title)
    if match is None:
        return

    number, short_title = match.groups()
    return {
        'id': video_id,
        'number': int(number),
        'fullTitle': full_title,
        'shortTitle': short_title,
        'url': f'https://www.youtube.com/watch?v={video_id}'
    }


def main(page_size=50, sleep=0.5):
    dataset = {}

    url = 'https://youtube.googleapis.com/youtube/v3/playlistItems'
    page_token = None
    while True:
        payload = requests.get(
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
            ).json()

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

    with open('dataset.json', 'w') as df:
        df.write(json.dumps({'dataset': dataset}, sort_keys=True, indent=2))


if __name__ == '__main__':
    main()
