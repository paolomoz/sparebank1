import re,sys,html as H
from html.parser import HTMLParser
f,root,md,maxl=sys.argv[1],sys.argv[2],int(sys.argv[3]),int(sys.argv[4]) if len(sys.argv)>4 else 400
s=open(f,encoding='utf-8').read()
s=re.sub(r'<script.*?</script>','',s,flags=re.S); s=re.sub(r'<style.*?</style>','',s,flags=re.S); s=re.sub(r'<svg(.*?)</svg>',lambda m:'<svg'+(' '+' '.join(re.findall(r'(class="[^"]*"|aria-label="[^"]*"|width="[^"]*"|height="[^"]*")',m.group(1)[:200])))+'/>',s,flags=re.S)
KEEP={'class','src','data-lazy-src','data-lazy-largesrc','alt','type','placeholder','name','href','id','aria-label','value','data-href','aria-expanded','aria-controls','role','width','height','style'}
class P(HTMLParser):
    def __init__(s2): super().__init__(); s2.d=0; s2.out=[]; s2.on=False; s2.stack=[]
    def handle_starttag(s2,tag,attrs):
        a=dict(attrs)
        if not s2.on:
            if (root.startswith('#') and a.get('id')==root[1:]) or (root.startswith('.') and root[1:] in (a.get('class') or '').split()) or tag==root: s2.on=True; s2.d=0
            else: return
        if s2.d<=md: s2.out.append('  '*s2.d+f'<{tag}'+''.join(f' {k}="{v[:90]}"' for k,v in attrs if k in KEEP and v)+'>')
        if tag in('br','img','input','hr','meta','link','source','svg'): return
        s2.stack.append(tag); s2.d+=1
    def handle_endtag(s2,tag):
        if not s2.on: return
        if s2.stack and s2.stack[-1]==tag: s2.stack.pop(); s2.d-=1
        if s2.d<=0: s2.on=False
    def handle_data(s2,data):
        if s2.on and s2.d<=md+1:
            t=re.sub(r'\s+',' ',H.unescape(data)).strip()
            if t: s2.out.append('  '*s2.d+'"'+t[:160]+'"')
p=P(); p.feed(s); print(f'===== {root} ({len(p.out)} lines)'); print('\n'.join(p.out[:maxl]))
