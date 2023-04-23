import time

import requests


CHANNEL_ID = 'UCm9K6rby98W8JigLoZOh6FQ'

# To get:
#   - Create Google Cloud project
#   - Enable the YouTube Data API v3
#   - Create an API key
API_KEY = ''


def main(page_size=50):
    video_ids = set()
    url = f'https://youtube.googleapis.com/youtube/v3/search'

    page_token = None
    while True:
        payload = requests.get(
            url,
            params={
                'channelId': CHANNEL_ID,
                'key': API_KEY,
                'maxResults': page_size,
                'pageToken': page_token,
                'type': 'video'
            },
            headers={
                'Accept': 'application/json'
            }
        ).json()

        ids = [item['id']['videoId']
               for item
               in payload['items']]

        video_ids.update(ids)

        if payload.get('nextPageToken') is None:
            print(payload)
            break

        page_token = payload['nextPageToken']

        time.sleep(1)


    print(sorted(list(video_ids)))

if __name__ == '__main__':
    main()
