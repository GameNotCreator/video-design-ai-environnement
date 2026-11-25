"""Pull the public stats of the WeLockIn accounts and write them as CSV under docs/stats/<date>/.

  . tools/env.sh && python3 tools/stats.py            # all platforms that answer
What each platform gives without logging in (tested 2026-11-25):
  - YouTube Shorts: the channel RSS feed (exact views, likes, publish time) for the 15 newest; the Shorts tab
    (yt-dlp --flat-playlist) for all of them, views rounded above 1,000. Per-video pages ask for a login (bot check).
  - TikTok: yt-dlp tiktok:user gives every video's views, likes, comments, reposts, duration, time, caption.
  - Instagram (login wall, HTTP 429) and Facebook (reels are not in the public page): no data. Use the client's
    exports from Meta Business Suite instead (docs/stats/<date>/meta_*.csv or screenshots).
Then docs/stats/videos.csv (studio folder ↔ platform ids) joins them; see docs/performance-notes.md.
Network: the environment must allow www.youtube.com, i.ytimg.com and www.tiktok.com."""
import csv, datetime, json, os, subprocess, sys, urllib.request, xml.etree.ElementTree as ET

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
ACCOUNTS = {'youtube': 'https://www.youtube.com/@welockin-students/shorts', 'tiktok': 'https://www.tiktok.com/@welockin.study'}
OUT = os.path.join(ROOT, 'docs', 'stats', datetime.date.today().isoformat())

def ytdlp(url):
    env = dict(os.environ, PYTHONPATH=os.path.join(ROOT, '.tools', 'py'))
    r = subprocess.run([sys.executable, '-m', 'yt_dlp', '--flat-playlist', '-J', '--no-warnings', url], capture_output=True, text=True, env=env, timeout=300)
    if r.returncode: print('!', url, r.stderr.strip()[-200:]); return None
    return json.loads(r.stdout)

def write(name, rows):
    if not rows: return
    os.makedirs(OUT, exist_ok=True); p = os.path.join(OUT, name)
    with open(p, 'w', newline='') as f: w = csv.DictWriter(f, fieldnames=list(rows[0])); w.writeheader(); w.writerows(rows)
    print(f'{len(rows):3d} rows → {os.path.relpath(p, ROOT)}')

def youtube():
    d = ytdlp(ACCOUNTS['youtube']);
    if not d: return
    rows = {e['id']: {'id': e['id'], 'title': e.get('title', ''), 'views': e.get('view_count'), 'likes': '', 'published': ''} for e in d.get('entries', [])}
    cid = d.get('channel_id') or d.get('id')
    try:
        x = urllib.request.urlopen(f'https://www.youtube.com/feeds/videos.xml?channel_id={cid}', timeout=30).read()
        ns = {'a': 'http://www.w3.org/2005/Atom', 'yt': 'http://www.youtube.com/xml/schemas/2015', 'm': 'http://search.yahoo.com/mrss/'}
        for e in ET.fromstring(x).findall('a:entry', ns):
            vid = e.find('yt:videoId', ns).text; st = e.find('m:group/m:community/m:statistics', ns); rt = e.find('m:group/m:community/m:starRating', ns)
            r = rows.setdefault(vid, {'id': vid, 'title': e.find('a:title', ns).text, 'views': '', 'likes': '', 'published': ''})
            r['views'] = st.get('views') if st is not None else r['views']; r['likes'] = rt.get('count') if rt is not None else ''
            r['published'] = e.find('a:published', ns).text[:16]
    except Exception as ex: print('! youtube rss', ex)
    write('youtube.csv', list(rows.values()))

def tiktok():
    d = ytdlp(ACCOUNTS['tiktok'])
    if not d: return
    rows = [{'id': e['id'], 'published': datetime.datetime.fromtimestamp(e['timestamp'], datetime.UTC).strftime('%Y-%m-%dT%H:%M') if e.get('timestamp') else '',
             'views': e.get('view_count'), 'likes': e.get('like_count'), 'comments': e.get('comment_count'), 'reposts': e.get('repost_count'),
             'saves': e.get('save_count'), 'duration': e.get('duration'), 'caption': (e.get('description') or e.get('title') or '').replace('\n', ' ')[:160]} for e in d.get('entries', [])]
    write('tiktok.csv', rows)

if __name__ == '__main__':
    youtube(); tiktok()
    print('Instagram / Facebook: no public stats without login; ask the client for Meta Business Suite exports.')
