#!/usr/bin/env python3
"""wiki_viewer.py — xem LLM Wiki dạng graph trên trình duyệt (skill llm-wiki). Không phụ thuộc gì ngoài Python.

    python3 -I tools/wiki_viewer.py <llm-wiki-dir> --serve [--port 8770]   # TRỰC TIẾP: sửa wiki rồi F5, không cần build
    python3 -I tools/wiki_viewer.py <llm-wiki-dir> --build [--out FILE] [--lite]   # TĨNH: một file HTML offline để chia sẻ

Graph: mỗi trang .md là một node (màu theo thư mục pages/<nhóm>/), mỗi link markdown tương đối là một cạnh,
node lớn theo số link tới. Bấm node để xem nội dung đã render, frontmatter, số dòng gap, link vào/ra.
--serve chỉ nghe trên 127.0.0.1 và chỉ trả trang viewer + /data.json (đọc lại wiki ở mỗi lần tải).
--build mặc định ghi <wiki>/viewer.html, kèm nội dung mọi trang; --lite bỏ nội dung (chỉ graph + frontmatter + gap) cho
wiki rất lớn. --serve chỉ gửi graph lúc đầu, nội dung trang tải khi bấm node, và cache theo mtime của từng file.
Nội dung wiki được escape khi render (không chạy HTML trong trang).
Quy mô đã đo: 3.000 trang / 36.000 link — đọc wiki < 1 giây; file tĩnh khoảng 10 MB (khoảng 3 MB với --lite).
"""
import argparse
import datetime
import http.server
import json
import os
import re
import socketserver
import sys
from urllib.parse import unquote

LINK = re.compile(r'(?<!!)\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)')
CODE = re.compile(r'```.*?```|`[^`\n]*`', re.S)
SKIP = {'tools', 'raw', 'node_modules'}
DEFAULTS = {'gap_section': 'Khác biệt spec ↔ code', 'doc_section': 'Khác biệt tài liệu ↔ code',
            'open_marker': '[CẦN LÀM RÕ]', 'gap_levels': ['MISSING', 'PARTIAL', 'CONTRADICTS', 'BUG', 'EXTRA', 'OK'],
            'doc_levels': ['STALE', 'WRONG', 'PLANNED', 'OK']}


def config(root):
    cfg = dict(DEFAULTS, name=os.path.basename(os.path.dirname(root)) or 'wiki', mode='unknown')
    p = os.path.join(root, 'wiki.json')
    if os.path.exists(p):
        try:
            cfg.update(json.load(open(p, encoding='utf-8')))
        except ValueError:
            pass
    return cfg


def split_frontmatter(text):
    if not text.startswith('---'):
        return {}, text
    end = text.find('\n---', 3)
    if end < 0:
        return {}, text
    fm, key = {}, None
    for line in text[3:end].splitlines():
        m = re.match(r'^([A-Za-z_][\w-]*):\s*(.*?)\s*(?:#.*)?$', line)
        if m:
            key, val = m.group(1), m.group(2)
            if val.startswith('[') and val.endswith(']'):
                val = [v.strip().strip('"\'') for v in val[1:-1].split(',') if v.strip()]
            fm[key] = val
        elif key and re.match(r'^\s+-\s+', line):
            item = line.strip()[1:].strip().strip('"\'')
            fm[key] = (fm[key] if isinstance(fm[key], list) else ([fm[key]] if fm[key] else [])) + [item]
    return fm, text[end + 4:].lstrip('\n')


def section_rows(body, name):
    rows, inside = [], False
    for line in body.splitlines():
        if line.startswith('## '):
            inside = line[3:].strip().lower().startswith(name.lower())
        elif inside and line.strip().startswith('|') and not re.match(r'^\|[\s:|-]+\|$', line.strip()):
            rows.append([c.strip().strip('`* ') for c in line.strip().strip('|').split('|')])
    return rows


_CACHE = {}  # path -> (mtime, size, parsed) — dùng cho --serve, để mỗi lần F5 chỉ đọc lại file đã đổi


def parse(root, p):
    full = os.path.join(root, p)
    st = os.stat(full)
    hit = _CACHE.get(p)
    if hit and hit[0] == st.st_mtime and hit[1] == st.st_size:
        return hit[2]
    text = open(full, encoding='utf-8', errors='replace').read()
    fm, body = split_frontmatter(text)
    parsed = (text, fm, body)
    _CACHE[p] = (st.st_mtime, st.st_size, parsed)
    return parsed


def collect(root, bodies=True):
    cfg = config(root)
    paths = []
    for dp, dns, fns in os.walk(root):
        dns[:] = sorted(d for d in dns if not d.startswith('.') and d not in SKIP)
        paths += [os.path.relpath(os.path.join(dp, f), root) for f in sorted(fns) if f.endswith('.md')]
    index = {p: i for i, p in enumerate(paths)}
    nodes, edges = [], set()
    for i, p in enumerate(paths):
        text, fm, body = parse(root, p)
        h1 = re.search(r'^#\s+(.+)$', body, re.M)
        t = fm.get('title')
        title = t.strip().strip('"\'') if isinstance(t, str) and t.strip() else (h1.group(1).strip() if h1 else os.path.basename(p)[:-3])
        parts = p.split(os.sep)
        group = parts[1] if parts[0] == 'pages' and len(parts) > 2 else 'root'
        # [[x]] trong block ai-po do harness ghi: đường dẫn tính từ spec root (pages/)
        for wl in re.findall(r'\[\[([^\]|#]+)', CODE.sub('', body)):
            tgt = os.path.normpath(os.path.join('pages', wl.strip()))
            if tgt in index and tgt != p:
                edges.add((i, index[tgt]))
        for href in LINK.findall(CODE.sub('', body)):
            if re.match(r'[a-z][a-z0-9+.-]*:', href) or href.startswith('#'):
                continue
            tgt = os.path.normpath(os.path.join(os.path.dirname(p), unquote(href.split('#')[0])))
            if tgt in index and tgt != p:
                edges.add((i, index[tgt]))
        gap = {}
        for kind, name, levels in (('gap', cfg['gap_section'], cfg['gap_levels']), ('doc', cfg['doc_section'], cfg['doc_levels'])):
            for row in section_rows(body, name):
                lvl = next((c for c in row if c in levels), None)
                if lvl:
                    gap.setdefault(kind, {}).setdefault(lvl, 0)
                    gap[kind][lvl] += 1
        node = {'path': p.replace(os.sep, '/'), 'title': title, 'type': fm.get('type', ''), 'group': group,
                'fm': fm, 'gap': gap, 'open': text.count(cfg['open_marker'])}
        if bodies:
            node['body'] = body
        nodes.append(node)
    totals = {}
    for n in nodes:
        for kind, lv in n['gap'].items():
            for k, v in lv.items():
                totals.setdefault(kind, {}).setdefault(k, 0)
                totals[kind][k] += v
    return {'meta': {'name': cfg.get('name'), 'mode': cfg.get('mode'), 'pages': sum(1 for n in nodes if n['group'] != 'root'),
                     'notes': len(nodes), 'links': len(edges), 'gaps': totals, 'open': sum(n['open'] for n in nodes),
                     'generated': datetime.datetime.now().strftime('%Y-%m-%d %H:%M'), 'bodies': bodies},
            'nodes': nodes, 'edges': sorted(edges)}


def page(data, live):
    payload = 'null' if data is None else json.dumps(data, ensure_ascii=False).replace('</', '<\\/')
    return TEMPLATE.replace('__LIVE__', 'true' if live else 'false').replace('__DATA__', payload)


def serve(root, port):
    known = set()

    class H(http.server.BaseHTTPRequestHandler):
        def do_GET(self):
            route, _, query = self.path.partition('?')
            if route == '/data.json':
                data = collect(root, bodies=False)
                known.clear()
                known.update(n['path'] for n in data['nodes'])
                body, ctype = json.dumps(data, ensure_ascii=False).encode(), 'application/json'
            elif route == '/body':
                want = unquote(query[2:]) if query.startswith('p=') else ''
                if want not in known:           # chỉ trả nội dung trang .md có trong graph, không trả file tuỳ ý
                    self.send_error(404)
                    return
                body, ctype = json.dumps({'body': parse(root, want.replace('/', os.sep))[2]}, ensure_ascii=False).encode(), 'application/json'
            elif route in ('/', '/index.html'):
                body, ctype = page(None, True).encode(), 'text/html'
            else:
                self.send_error(404)
                return
            self.send_response(200)
            self.send_header('Content-Type', ctype + '; charset=utf-8')
            self.send_header('Cache-Control', 'no-store')
            self.end_headers()
            self.wfile.write(body)

        def log_message(self, *a):
            pass

    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.ThreadingTCPServer(('127.0.0.1', port), H) as srv:
        print(f'wiki viewer: http://127.0.0.1:{port}/  (đọc trực tiếp {root}; sửa wiki rồi F5) — Ctrl+C để dừng')
        try:
            srv.serve_forever()
        except KeyboardInterrupt:
            pass


def build(root, out, lite=False):
    data = collect(root, bodies=not lite)
    out = out or os.path.join(root, 'viewer.html')
    open(out, 'w', encoding='utf-8').write(page(data, False))
    kb = os.path.getsize(out) // 1024
    print(f'viewer: {out}  ({data["meta"]["notes"]} node, {data["meta"]["links"]} cạnh, {kb} KB{", lite" if lite else ""})')
    if kb > 15000 and not lite:
        print('  file lớn: thêm --lite (bỏ nội dung trang) hoặc dùng --serve (tải nội dung khi bấm node)')
    return out


TEMPLATE = r'''<!doctype html>
<html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Wiki viewer</title>
<style>
:root{--bg:#f7f7f5;--panel:#fff;--ink:#1d1d1b;--ink2:#5c5c57;--line:#e2e1dc;--accent:#d9572b;--edge:rgba(60,60,55,.16);--hl:rgba(217,87,43,.75);--code:#f0efea}
@media (prefers-color-scheme:dark){:root{--bg:#141413;--panel:#1d1d1b;--ink:#ecebe6;--ink2:#a3a29b;--line:#34332f;--accent:#f0845a;--edge:rgba(220,220,210,.13);--hl:rgba(240,132,90,.85);--code:#262624}}
*{box-sizing:border-box}html,body{margin:0;height:100%;background:var(--bg);color:var(--ink);font:14px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}
#app{display:grid;grid-template-columns:240px 1fr minmax(320px,36%);height:100vh}
aside,#detail{background:var(--panel);border-right:1px solid var(--line);overflow:auto;padding:14px}
#detail{border-right:0;border-left:1px solid var(--line)}
#stage{position:relative;overflow:hidden}canvas{display:block;width:100%;height:100%;cursor:grab}
h1{font-size:16px;margin:0 0 4px}.muted{color:var(--ink2);font-size:12px}
input[type=search]{width:100%;padding:7px 9px;border:1px solid var(--line);border-radius:8px;background:var(--bg);color:var(--ink);margin:10px 0}
.grp{display:flex;align-items:center;gap:8px;padding:3px 0;cursor:pointer;user-select:none}.dot{width:11px;height:11px;border-radius:50%;flex:none}
.grp.off{opacity:.35}.grp .n{margin-left:auto;color:var(--ink2);font-size:12px}
#results div{padding:4px 6px;border-radius:6px;cursor:pointer;font-size:13px}#results div:hover{background:var(--bg)}
label.tg{display:flex;gap:6px;align-items:center;margin:8px 0;font-size:13px}
button{border:1px solid var(--line);background:var(--bg);color:var(--ink);border-radius:8px;padding:5px 10px;cursor:pointer;font-size:12px}
.chips span,.tag{display:inline-block;font-size:11px;font-weight:600;padding:1px 7px;border-radius:99px;margin:0 4px 4px 0;background:var(--code)}
.L-MISSING,.L-BUG,.L-CONTRADICTS,.L-WRONG{background:#f7d7d2!important;color:#8f2416}.L-PARTIAL,.L-STALE,.L-PLANNED{background:#f8e7c4!important;color:#7a5210}
.L-OK{background:#d5ecd9!important;color:#1f6b33}.L-EXTRA{background:#dde3f7!important;color:#2d3f8f}
@media (prefers-color-scheme:dark){.L-MISSING,.L-BUG,.L-CONTRADICTS,.L-WRONG{background:#4a221d!important;color:#f3b3a8}.L-PARTIAL,.L-STALE,.L-PLANNED{background:#463614!important;color:#f0d08f}.L-OK{background:#1d3b25!important;color:#a7dbb3}.L-EXTRA{background:#232b4a!important;color:#b6c2f3}}
.oq{background:#fde8a8;color:#5e4500;padding:0 3px;border-radius:3px}@media (prefers-color-scheme:dark){.oq{background:#4d3d08;color:#f6dc86}}
#detail .path{font-family:ui-monospace,Menlo,monospace;font-size:12px;color:var(--ink2);word-break:break-all}
table.fm{font-size:12px;border-collapse:collapse;margin:8px 0;width:100%}table.fm td{padding:2px 6px;border-bottom:1px solid var(--line);vertical-align:top}
table.fm td:first-child{color:var(--ink2);white-space:nowrap}
.md h1{font-size:18px}.md h2{font-size:15px;margin:18px 0 6px;padding-top:8px;border-top:1px solid var(--line)}.md h3{font-size:14px}
.md table{border-collapse:collapse;font-size:12px;display:block;overflow-x:auto;margin:6px 0}.md th,.md td{border:1px solid var(--line);padding:3px 6px;vertical-align:top}
.md th{background:var(--code)}.md code{background:var(--code);padding:0 4px;border-radius:4px;font-size:12px}
.md pre{background:var(--code);padding:8px;border-radius:8px;overflow:auto;font-size:12px}.md pre code{padding:0}
.md blockquote{margin:6px 0;padding:2px 10px;border-left:3px solid var(--line);color:var(--ink2)}
a{color:var(--accent);text-decoration:none}a:hover{text-decoration:underline}
.links a{display:block;font-size:13px;padding:1px 0}
#hint{position:absolute;left:12px;bottom:10px;font-size:12px;color:var(--ink2);background:var(--panel);padding:4px 8px;border-radius:8px;border:1px solid var(--line)}
@media (max-width:1000px){#app{grid-template-columns:1fr;grid-template-rows:auto 55vh auto;height:auto}aside,#detail{border:0}}
</style></head><body>
<div id="app">
 <aside><h1 id="wname">Wiki</h1><div class="muted" id="wmeta"></div><div class="chips" id="wgaps" style="margin-top:8px"></div>
  <input type="search" id="q" placeholder="Tìm trang (tên hoặc đường dẫn)…" autocomplete="off"><div id="results"></div>
  <label class="tg"><input type="checkbox" id="local"> Chỉ trang đang chọn và hàng xóm</label>
  <div class="muted" style="margin:10px 0 4px">Nhóm (bấm để ẩn/hiện)</div><div id="groups"></div>
  <div style="margin-top:12px;display:flex;gap:6px"><button id="fit">Vừa khung</button><button id="reload" hidden>Tải lại dữ liệu</button></div>
 </aside>
 <main id="stage"><canvas id="cv"></canvas><div id="hint">Kéo nền để di chuyển · cuộn để phóng to · bấm node để xem</div></main>
 <section id="detail"><div class="muted">Chọn một node trên graph, hoặc tìm ở cột trái.</div></section>
</div>
<script>
const LIVE=__LIVE__;let DATA=__DATA__;
const COLORS={overview:'#e2552f',flows:'#f29b2b',screens:'#3b82f6',entities:'#3fa35b',concepts:'#9b5de5',sources:'#8f8f88',proposals:'#14a3a3',contracts:'#b07a4f',root:'#444'};
const NAMES={overview:'Tổng quan',flows:'Luồng',screens:'Màn hình',entities:'Thực thể',concepts:'Khái niệm',sources:'Nguồn',proposals:'Đề xuất (harness)',contracts:'Contract',root:'Điều hướng'};
const LEVELS=['MISSING','PARTIAL','CONTRADICTS','BUG','EXTRA','OK','STALE','WRONG','PLANNED'];
const cv=document.getElementById('cv'),ctx=cv.getContext('2d');let W=0,H=0,dpr=1;
let HUBMIN=1e9,OUT=[],IN=[],dirty=true,N=[],E=[],adj=[],byPath={},hidden=new Set(),sel=-1,hov=-1,view={x:0,y:0,k:1},alpha=1,drag=null;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function resolve(from,href){const parts=from.split('/');parts.pop();for(const seg of href.split('/')){if(seg==='..')parts.pop();else if(seg&&seg!=='.')parts.push(seg)}return parts.join('/')}
function inline(t,from){t=esc(t);
 t=t.replace(/`([^`]+)`/g,(m,c)=>'<code>'+c+'</code>');
 t=t.replace(/!\[([^\]]*)\]\([^)]*\)/g,'[$1]');
 t=t.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g,(m,txt,href)=>{href=href.replace(/&amp;/g,'&');
   if(/^https?:\/\//.test(href))return '<a href="'+esc(href)+'" target="_blank" rel="noopener">'+txt+'</a>';
   const p=resolve(from,decodeURIComponent(href.split('#')[0]));return byPath[p]!==undefined?'<a href="#'+encodeURIComponent(p)+'">'+txt+'</a>':'<span title="'+esc(href)+'">'+txt+'</span>'});
 t=t.replace(/\[\[([^\]|#]+)[^\]]*\]\]/g,(m,x)=>{const p=byPath['pages/'+x.trim()]!==undefined?'pages/'+x.trim():(byPath[x.trim()]!==undefined?x.trim():null);return p?'<a href="#'+encodeURIComponent(p)+'">'+esc(x.trim())+'</a>':m});
 t=t.replace(/\*\*([^*]+)\*\*/g,'<b>$1</b>').replace(/(^|[^*])\*([^*\s][^*]*)\*/g,'$1<i>$2</i>');
 t=t.replace(/\[CẦN LÀM RÕ\]|\[CHƯA KIỂM CODE\]/g,m=>'<span class="oq">'+m+'</span>');
 return t}
function md(src,from){const L=src.split('\n'),out=[];let i=0;
 while(i<L.length){let l=L[i];
  if(/^```/.test(l)){const b=[];i++;while(i<L.length&&!/^```/.test(L[i]))b.push(L[i++]);i++;out.push('<pre><code>'+esc(b.join('\n'))+'</code></pre>');continue}
  let m=l.match(/^(#{1,6})\s+(.*)$/);if(m){out.push('<h'+m[1].length+'>'+inline(m[2],from)+'</h'+m[1].length+'>');i++;continue}
  if(/^\s*\|/.test(l)){const rows=[];while(i<L.length&&/^\s*\|/.test(L[i]))rows.push(L[i++]);let h='<table>';
   rows.forEach((r,ri)=>{if(/^\s*\|[\s:|-]+\|\s*$/.test(r))return;const cells=r.trim().replace(/^\||\|$/g,'').split('|');const tg=ri===0?'th':'td';
    h+='<tr>'+cells.map(c=>{c=c.trim();const k=c.replace(/[`*]/g,'');return '<'+tg+'>'+(LEVELS.includes(k)?'<span class="tag L-'+k+'">'+k+'</span>':inline(c,from))+'</'+tg+'>'}).join('')+'</tr>'});
   out.push(h+'</table>');continue}
  if(/^\s*([-*]|\d+\.)\s+/.test(l)){const ord=/^\s*\d+\./.test(l),items=[];while(i<L.length&&/^\s*([-*]|\d+\.)\s+/.test(L[i]))items.push(L[i++].replace(/^\s*([-*]|\d+\.)\s+/,''));
   out.push((ord?'<ol>':'<ul>')+items.map(x=>'<li>'+inline(x,from)+'</li>').join('')+(ord?'</ol>':'</ul>'));continue}
  if(/^>\s?/.test(l)){const b=[];while(i<L.length&&/^>\s?/.test(L[i]))b.push(L[i++].replace(/^>\s?/,''));out.push('<blockquote>'+inline(b.join(' '),from)+'</blockquote>');continue}
  if(/^\s*(-{3,}|\*{3,})\s*$/.test(l)){out.push('<hr>');i++;continue}
  if(!l.trim()){i++;continue}
  const p=[];while(i<L.length&&L[i].trim()&&!/^(#{1,6}\s|```|\s*\||\s*([-*]|\d+\.)\s+|>)/.test(L[i]))p.push(L[i++]);out.push('<p>'+inline(p.join(' '),from)+'</p>')}
 return out.join('\n')}
function setup(d){DATA=d;const m=d.meta;
 document.getElementById('wname').textContent='LLM Wiki · '+(m.name||'');document.title='Wiki viewer · '+(m.name||'');
 document.getElementById('wmeta').textContent=m.pages+' trang · '+m.links+' link · chế độ '+m.mode+(LIVE?' · trực tiếp':' · tạo lúc '+m.generated);
 const g=Object.assign({},m.gaps.gap||{},m.gaps.doc||{});document.getElementById('wgaps').innerHTML=Object.keys(g).filter(k=>k!=='OK').map(k=>'<span class="tag L-'+k+'">'+k+' '+g[k]+'</span>').join('')+(m.open?'<span class="tag oq">câu hỏi mở '+m.open+'</span>':'');
 const old={};N.forEach(n=>old[n.path]=n);byPath={};
 N=d.nodes.map((n,i)=>{byPath[n.path]=i;const o=old[n.path],a=i*2.399;return Object.assign(n,{i,x:o?o.x:Math.cos(a)*(30+i*2),y:o?o.y:Math.sin(a)*(30+i*2),vx:0,vy:0,deg:0})});
 E=d.edges.filter(e=>N[e[0]]&&N[e[1]]);adj=N.map(()=>new Set());OUT=N.map(()=>[]);IN=N.map(()=>[]);E.forEach(([a,b])=>{adj[a].add(b);adj[b].add(a);OUT[a].push(b);IN[b].push(a);N[b].deg++});
 N.forEach(n=>n.r=3+Math.sqrt(n.deg)*1.7);HUBMIN=(N.map(n=>n.deg).sort((a,b)=>b-a)[11])||1e9;
 const counts={};N.forEach(n=>counts[n.group]=(counts[n.group]||0)+1);
 document.getElementById('groups').innerHTML=Object.keys(counts).sort((a,b)=>counts[b]-counts[a]).map(k=>'<div class="grp'+(hidden.has(k)?' off':'')+'" data-g="'+k+'"><span class="dot" style="background:'+(COLORS[k]||'#888')+'"></span>'+(NAMES[k]||k)+'<span class="n">'+counts[k]+'</span></div>').join('');
 alpha=1;route();if(!Object.keys(old).length){const t0=performance.now();for(let t=0;t<220&&performance.now()-t0<700;t++)tick();alpha=Math.max(alpha,.2);fit()}dirty=true}
function visible(n){if(hidden.has(n.group))return false;if(document.getElementById('local').checked&&sel>=0)return n.i===sel||adj[sel].has(n.i);return true}
function tick(){if(alpha<0.02)return;const vis=N.filter(visible),k=60,C=120,grid=new Map();
 /* lực đẩy theo lưới không gian: chỉ xét node trong ô lân cận (bán kính C) → gần O(n) thay vì O(n²) */
 vis.forEach(n=>{const key=Math.floor(n.x/C)+','+Math.floor(n.y/C);let c=grid.get(key);if(!c)grid.set(key,c=[]);c.push(n)});
 vis.forEach(p=>{const gx=Math.floor(p.x/C),gy=Math.floor(p.y/C);for(let ix=gx-1;ix<=gx+1;ix++)for(let iy=gy-1;iy<=gy+1;iy++){const c=grid.get(ix+','+iy);if(!c)continue;
  for(const q of c){if(q.i<=p.i)continue;let dx=p.x-q.x,dy=p.y-q.y,d2=dx*dx+dy*dy;if(d2>C*C)continue;if(d2<1){dx=Math.random()-.5;dy=Math.random()-.5;d2=1}
   const d=Math.sqrt(d2),f=Math.min(k*k/d2,4)*alpha*.5;p.vx+=dx/d*f;p.vy+=dy/d*f;q.vx-=dx/d*f;q.vy-=dy/d*f}}});
 E.forEach(([a,b])=>{const p=N[a],q=N[b];if(!visible(p)||!visible(q))return;const dx=q.x-p.x,dy=q.y-p.y,d=Math.sqrt(dx*dx+dy*dy)||1,f=(d-k)/d*.02*alpha;p.vx+=dx*f;p.vy+=dy*f;q.vx-=dx*f;q.vy-=dy*f});
 vis.forEach(n=>{n.vx-=n.x*.002*alpha;n.vy-=n.y*.002*alpha;if(drag&&drag.n===n)return;const v=Math.hypot(n.vx,n.vy);if(v>8){n.vx*=8/v;n.vy*=8/v}n.x+=n.vx;n.y+=n.vy;n.vx*=.6;n.vy*=.6});alpha*=.99}
function color(n){return COLORS[n.group]||'#888'}
function draw(){requestAnimationFrame(draw);const moving=alpha>=0.02;tick();if(!moving&&!dirty)return;dirty=false;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);ctx.translate(W/2+view.x,H/2+view.y);ctx.scale(view.k,view.k);
 const css=getComputedStyle(document.documentElement),focus=hov>=0?hov:sel;
 ctx.lineWidth=1/view.k;E.forEach(([a,b])=>{const p=N[a],q=N[b];if(!visible(p)||!visible(q))return;const on=focus>=0&&(a===focus||b===focus);ctx.strokeStyle=on?css.getPropertyValue('--hl'):css.getPropertyValue('--edge');ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke()});
 N.forEach(n=>{if(!visible(n))return;const dim=focus>=0&&n.i!==focus&&!adj[focus].has(n.i);ctx.globalAlpha=dim?.25:1;ctx.fillStyle=color(n);ctx.beginPath();ctx.arc(n.x,n.y,n.r,0,7);ctx.fill();
  if(n.i===sel){ctx.strokeStyle=css.getPropertyValue('--ink');ctx.lineWidth=2/view.k;ctx.stroke()}});
 ctx.globalAlpha=1;ctx.fillStyle=css.getPropertyValue('--ink');ctx.font=(12/view.k)+'px -apple-system,sans-serif';
 N.forEach(n=>{if(!visible(n))return;const near=focus>=0&&(n.i===focus||adj[focus].has(n.i));if(view.k>1.8||near||(focus<0&&n.deg>=HUBMIN))ctx.fillText(n.title.slice(0,40),n.x+n.r+2/view.k,n.y+4/view.k)})}
function toWorld(ev){const r=cv.getBoundingClientRect();return{x:(ev.clientX-r.left-W/2-view.x)/view.k,y:(ev.clientY-r.top-H/2-view.y)/view.k}}
function hit(ev){const p=toWorld(ev);let best=-1,bd=1e9;N.forEach(n=>{if(!visible(n))return;const d=(n.x-p.x)**2+(n.y-p.y)**2;if(d<(n.r+4/view.k)**2&&d<bd){bd=d;best=n.i}});return best}
function resize(){dirty=true;dpr=window.devicePixelRatio||1;W=cv.clientWidth;H=cv.clientHeight;cv.width=W*dpr;cv.height=H*dpr}
function fit(){const vis=N.filter(visible);if(!vis.length)return;let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;vis.forEach(n=>{x0=Math.min(x0,n.x);x1=Math.max(x1,n.x);y0=Math.min(y0,n.y);y1=Math.max(y1,n.y)});
 const k=Math.min(W/(x1-x0+80),H/(y1-y0+80),3);view.k=isFinite(k)&&k>0.02?k:0.5;dirty=true;view.x=-(x0+x1)/2*view.k;view.y=-(y0+y1)/2*view.k}
function select(i){sel=i;const d=document.getElementById('detail');if(i<0){d.innerHTML='<div class="muted">Chọn một node.</div>';return}
 const n=N[i],fm=n.fm||{},rows=Object.keys(fm).filter(k=>k!=='title').map(k=>'<tr><td>'+esc(k)+'</td><td>'+esc(Array.isArray(fm[k])?fm[k].join(', '):fm[k])+'</td></tr>').join('');
 const gl=Object.assign({},(n.gap||{}).gap||{},(n.gap||{}).doc||{}),chips=Object.keys(gl).map(k=>'<span class="tag L-'+k+'">'+k+' '+gl[k]+'</span>').join('')+(n.open?'<span class="tag oq">câu hỏi mở '+n.open+'</span>':'');
 dirty=true;const out=OUT[i],inn=IN[i];
 const lst=a=>a.map(j=>'<a href="#'+encodeURIComponent(N[j].path)+'"><span class="dot" style="display:inline-block;width:8px;height:8px;background:'+color(N[j])+'"></span> '+esc(N[j].title)+'</a>').join('')||'<span class="muted">—</span>';
 d.innerHTML='<div class="chips"><span class="tag" style="background:'+color(n)+';color:#fff">'+esc(NAMES[n.group]||n.group)+'</span>'+(n.type?'<span class="tag">type: '+esc(n.type)+'</span>':'')+'</div><h1>'+esc(n.title)+'</h1><div class="path">'+esc(n.path)+'</div>'+
  (chips?'<div class="chips" style="margin-top:8px">'+chips+'</div>':'')+(rows?'<table class="fm">'+rows+'</table>':'')+
  '<div class="links" style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:8px 0"><div><div class="muted">Link ra ('+out.length+')</div>'+lst(out)+'</div><div><div class="muted">Link vào ('+inn.length+')</div>'+lst(inn)+'</div></div>'+
  '<div class="md" id="mdbody">'+(n.body!==undefined?md(n.body,n.path):(LIVE?'<div class="muted">Đang tải nội dung…</div>':'<div class="muted">Bản lite: không kèm nội dung trang. Dùng <code>wiki_viewer.py --serve</code> hoặc build không có <code>--lite</code>.</div>'))+'</div>';d.scrollTop=0;
 if(n.body===undefined&&LIVE)fetch('body?p='+encodeURIComponent(n.path),{cache:'no-store'}).then(r=>r.json()).then(j=>{n.body=j.body;if(sel===i){const el=document.getElementById('mdbody');if(el)el.innerHTML=md(n.body,n.path)}}).catch(()=>{})}
function route(){const p=decodeURIComponent(location.hash.slice(1));if(byPath[p]!==undefined){select(byPath[p]);const n=N[byPath[p]];if(drag===null&&n){view.x=-n.x*view.k;view.y=-n.y*view.k}}else if(sel>=N.length)select(-1)}
window.addEventListener('hashchange',route);window.addEventListener('resize',resize);
cv.addEventListener('wheel',ev=>{ev.preventDefault();dirty=true;const f=Math.exp(-ev.deltaY*.0015),r=cv.getBoundingClientRect(),mx=ev.clientX-r.left-W/2,my=ev.clientY-r.top-H/2;view.x=mx-(mx-view.x)*f;view.y=my-(my-view.y)*f;view.k*=f},{passive:false});
cv.addEventListener('mousedown',ev=>{const i=hit(ev);drag={n:i>=0?N[i]:null,x:ev.clientX,y:ev.clientY,vx:view.x,vy:view.y,moved:false}});
window.addEventListener('mousemove',ev=>{if(!drag){const h=hit(ev);if(h!==hov){hov=h;dirty=true;cv.style.cursor=h>=0?'pointer':'grab'}return}
 if(Math.abs(ev.clientX-drag.x)+Math.abs(ev.clientY-drag.y)>3)drag.moved=true;if(drag.n){const p=toWorld(ev);drag.n.x=p.x;drag.n.y=p.y;alpha=Math.max(alpha,.3)}else{view.x=drag.vx+ev.clientX-drag.x;view.y=drag.vy+ev.clientY-drag.y}dirty=true});
window.addEventListener('mouseup',ev=>{if(drag&&!drag.moved&&drag.n){const p=drag.n.path;drag=null;location.hash=encodeURIComponent(p);return}drag=null});
document.getElementById('groups').addEventListener('click',ev=>{const g=ev.target.closest('.grp');if(!g)return;const k=g.dataset.g;hidden.has(k)?hidden.delete(k):hidden.add(k);g.classList.toggle('off');alpha=.6;dirty=true});
document.getElementById('local').addEventListener('change',()=>{alpha=.6;setTimeout(fit,400)});
document.getElementById('fit').addEventListener('click',fit);
const q=document.getElementById('q'),res=document.getElementById('results');
q.addEventListener('input',()=>{const s=q.value.trim().toLowerCase();if(!s){res.innerHTML='';return}
 res.innerHTML=N.filter(n=>(n.title+' '+n.path).toLowerCase().includes(s)).slice(0,30).map(n=>'<div data-p="'+esc(n.path)+'"><span class="dot" style="display:inline-block;width:8px;height:8px;background:'+color(n)+'"></span> '+esc(n.title)+'</div>').join('')||'<div class="muted">Không thấy</div>'});
q.addEventListener('keydown',ev=>{if(ev.key==='Enter'){const f=res.querySelector('[data-p]');if(f)location.hash=encodeURIComponent(f.dataset.p)}});
res.addEventListener('click',ev=>{const d=ev.target.closest('[data-p]');if(d)location.hash=encodeURIComponent(d.dataset.p)});
async function load(){const r=await fetch('data.json',{cache:'no-store'});setup(await r.json())}
if(LIVE){const b=document.getElementById('reload');b.hidden=false;b.addEventListener('click',load);window.addEventListener('focus',load)}
resize();if(DATA)setup(DATA);else load();requestAnimationFrame(draw);
</script></body></html>'''


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('wiki', nargs='?', default='.')
    mode = ap.add_mutually_exclusive_group(required=True)
    mode.add_argument('--serve', action='store_true', help='xem trực tiếp qua http://127.0.0.1:<port>/')
    mode.add_argument('--build', action='store_true', help='ghi một file HTML tĩnh')
    ap.add_argument('--port', type=int, default=8770)
    ap.add_argument('--out', default=None, help='đường dẫn file khi --build (mặc định <wiki>/viewer.html)')
    ap.add_argument('--lite', action='store_true', help='--build không kèm nội dung trang (cho wiki rất lớn)')
    a = ap.parse_args(argv)
    root = os.path.abspath(a.wiki)
    if not os.path.isdir(os.path.join(root, 'pages')):
        sys.exit(f'không thấy {root}/pages — đây có phải thư mục llm-wiki không?')
    if a.serve:
        serve(root, a.port)
    else:
        build(root, a.out, a.lite)


if __name__ == '__main__':
    main()
