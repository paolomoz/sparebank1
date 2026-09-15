# rows.py <png> <y0> <y1> [x0 x1] [gap] — ink-row runs (rows whose pixels differ from the row's edge colour) + background colour changes
import sys
from PIL import Image
f,y0,y1=sys.argv[1],int(sys.argv[2]),int(sys.argv[3]); x0=int(sys.argv[4]) if len(sys.argv)>4 else 0; x1=int(sys.argv[5]) if len(sys.argv)>5 else None
gap=int(sys.argv[6]) if len(sys.argv)>6 else 1
im=Image.open(f).convert('RGB'); W,H=im.size; x1=x1 or W; y1=min(y1,H); px=im.load()
def bg(y): return px[max(x0,2),y] if x0>0 else px[2,y]
runs=[]; cur=None; lastbg=None
for y in range(y0,y1):
    b=bg(y)
    if lastbg is None or max(abs(b[i]-lastbg[i]) for i in range(3))>3:
        print(f'  bg y{y}: rgb{b}'); lastbg=b
    n=0; xs=[]
    for x in range(x0,x1):
        p=px[x,y]
        if max(abs(p[i]-b[i]) for i in range(3))>40: n+=1; xs.append(x)
    if n>0:
        if cur and y-cur[1]<=gap: cur[1]=y; cur[2]=min(cur[2],xs[0]); cur[3]=max(cur[3],xs[-1])
        else:
            if cur: runs.append(cur)
            cur=[y,y,xs[0],xs[-1]]
if cur: runs.append(cur)
for r in runs: print(f'{r[0]:6} h{r[1]-r[0]+1:4} x{r[2]:4}-{r[3]:4}')
