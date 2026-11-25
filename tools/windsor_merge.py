#!/usr/bin/env python3
"""Merge the Windsor.ai pulls (private TikTok / YouTube stats) into docs/stats/<date>/.

usage: python3 tools/windsor_merge.py <raw_dir> [<date>]

<raw_dir> holds one file per pull (procedure: docs/stats/windsor.md). Each file is either the
Windsor JSON answer ({"data": [...]}, e.g. copied from a saved tool result) or a CSV with the same
columns. Missing files are skipped.

  tt_videos      video_id, video_create_datetime, video_duration, video_views_count, video_reach,
                 video_average_time_watched, video_full_watched_rate, video_likes, video_shares,
                 video_favorites, video_comments, video_new_followers
  tt_retention   video_id, video_view_retention_second, video_view_retention_percentage
  tt_sources     video_id, video_impression_sources_impression_source, video_impression_sources_percentage
  tt_countries   video_id, video_audience_countries_country, video_audience_countries_percentage
  yt_videos      video, video_title, published_at, views, engaged_views, average_view_duration,
                 average_view_percentage, likes, shares, comments, subscribers_gained
  yt_retention   video, elapsed_video_time_ratio, audience_watch_ratio, relative_retention_performance
  yt_countries   country, views, engaged_views

Writes windsor_tiktok.csv (one line per video, with retention at 1/2/3/5 s, For You share and
French-speaking share), windsor_tiktok_retention.csv, windsor_youtube.csv,
windsor_youtube_retention.csv and windsor_youtube_countries.csv. Folder names come from
docs/stats/videos.csv.
"""
import csv, collections, datetime, json, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRANCO = {'FR', 'BE', 'CH', 'LU', 'MC', 'RE', 'MQ', 'GP', 'GF', 'YT', 'NC', 'PF'}  # France, Benelux/Swiss, DOM-TOM


def load(raw, name):
    for ext in ('.json', '.txt', '.csv'):
        p = os.path.join(raw, name + ext)
        if not os.path.exists(p):
            continue
        if ext == '.csv':
            return list(csv.DictReader(open(p, encoding='utf-8')))
        d = json.load(open(p, encoding='utf-8'))
        return d['data'] if isinstance(d, dict) else d
    return []


def num(x, default=None):
    try:
        return float(x)
    except (TypeError, ValueError):
        return default


def write(path, header, rows):
    with open(path, 'w', newline='', encoding='utf-8') as f:
        w = csv.writer(f)
        w.writerow(header)
        w.writerows(rows)
    print('wrote', os.path.relpath(path, ROOT), f'({len(rows)} rows)')


def main():
    raw = sys.argv[1]
    date = sys.argv[2] if len(sys.argv) > 2 else datetime.date.today().isoformat()
    out = os.path.join(ROOT, 'docs', 'stats', date)
    os.makedirs(out, exist_ok=True)
    folder_tt, folder_yt = {}, {}
    for r in csv.DictReader(open(os.path.join(ROOT, 'docs', 'stats', 'videos.csv'), encoding='utf-8')):
        if r.get('tiktok_id'):
            folder_tt[r['tiktok_id']] = r['folder']
        if r.get('youtube_id'):
            folder_yt[r['youtube_id']] = r['folder']

    # --- TikTok -------------------------------------------------------------------------------
    ret = collections.defaultdict(dict)
    for r in load(raw, 'tt_retention'):
        ret[r['video_id']][int(r['video_view_retention_second'])] = num(r['video_view_retention_percentage'], 0)
    fy = collections.defaultdict(float)
    for r in load(raw, 'tt_sources'):
        if r['video_impression_sources_impression_source'] == 'For You':
            fy[r['video_id']] = num(r['video_impression_sources_percentage'], 0)
    fr, franco = collections.defaultdict(float), collections.defaultdict(float)
    for r in load(raw, 'tt_countries'):
        c, p = r['video_audience_countries_country'], num(r['video_audience_countries_percentage'], 0)
        if c == 'FR':
            fr[r['video_id']] += p
        if c in FRANCO:
            franco[r['video_id']] += p
    rows = []
    for r in load(raw, 'tt_videos'):
        v, dur, avg = r['video_id'], num(r['video_duration'], 0), num(r['video_average_time_watched'], 0)
        R = ret.get(v, {})
        pct = lambda s: f"{R[s]:.2f}" if s in R else ''
        rows.append([folder_tt.get(v, ''), v, (r.get('video_create_datetime') or '')[:16], f'{dur:.1f}',
                     r['video_views_count'], r.get('video_reach') or '', f'{avg:.2f}',
                     f'{avg / dur:.3f}' if dur else '', f"{num(r['video_full_watched_rate'], 0):.4f}",
                     pct(1), pct(2), pct(3), pct(5), r['video_likes'], r['video_shares'], r['video_favorites'],
                     r['video_comments'], r['video_new_followers'],
                     f'{fy[v]:.3f}' if v in fy else '', f'{fr[v]:.3f}' if v in fr else '',
                     f'{franco[v]:.3f}' if v in franco else ''])
    rows.sort(key=lambda x: x[2])
    if rows:
        write(os.path.join(out, 'windsor_tiktok.csv'),
              ['folder', 'tiktok_id', 'posted', 'duration_s', 'views', 'reach', 'avg_watch_s', 'avg_watch_ratio',
               'full_watched_rate', 'ret_1s', 'ret_2s', 'ret_3s', 'ret_5s', 'likes', 'shares', 'favorites', 'comments',
               'new_followers', 'for_you_share', 'france_share', 'francophone_share'], rows)
    if ret:
        write(os.path.join(out, 'windsor_tiktok_retention.csv'), ['folder', 'tiktok_id', 'second', 'retention'],
              [[folder_tt.get(v, ''), v, s, f'{p:.3f}'] for v in ret for s, p in sorted(ret[v].items())])

    # --- YouTube ------------------------------------------------------------------------------
    rows = [[folder_yt.get(r['video'], ''), r['video'], r['video_title'], (r.get('published_at') or '')[:10],
             r['views'], r['engaged_views'], f"{num(r['average_view_duration'], 0):.1f}",
             f"{num(r['average_view_percentage'], 0):.1f}", r['likes'], r['shares'], r['comments'],
             r['subscribers_gained']] for r in load(raw, 'yt_videos')]
    rows.sort(key=lambda x: x[3])
    if rows:
        write(os.path.join(out, 'windsor_youtube.csv'),
              ['folder', 'youtube_id', 'title', 'published', 'views', 'engaged_views', 'avg_view_s', 'avg_view_pct',
               'likes', 'shares', 'comments', 'subscribers_gained'], rows)
    yr = collections.defaultdict(lambda: collections.defaultdict(list))
    for r in load(raw, 'yt_retention'):
        k = round(num(r['elapsed_video_time_ratio'], 0), 2)
        yr[r['video']][k].append((num(r['audience_watch_ratio'], 0), num(r['relative_retention_performance'], 0)))
    if yr:
        write(os.path.join(out, 'windsor_youtube_retention.csv'),
              ['folder', 'youtube_id', 'elapsed_ratio', 'audience_watch_ratio', 'relative_retention'],
              [[folder_yt.get(v, ''), v, k, f'{sum(a for a, _ in L) / len(L):.3f}', f'{sum(b for _, b in L) / len(L):.3f}']
               for v in yr for k, L in sorted(yr[v].items())])
    rows = sorted(([r['country'], r['views'], r['engaged_views']] for r in load(raw, 'yt_countries')),
                  key=lambda x: -num(x[1], 0))
    if rows:
        write(os.path.join(out, 'windsor_youtube_countries.csv'), ['country', 'views', 'engaged_views'], rows)


if __name__ == '__main__':
    main()
