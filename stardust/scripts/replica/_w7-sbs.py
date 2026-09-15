# sbs.py <gatedir> <outprefix> [scale] [chunk] — side-by-side (live | eds) crops
import sys
from PIL import Image
G=sys.argv[1]; out=sys.argv[2]; sc=float(sys.argv[3]) if len(sys.argv)>3 else 0.35; chunk=int(sys.argv[4]) if len(sys.argv)>4 else 1000
a=Image.open(f'{G}/live.png'); b=Image.open(f'{G}/proto.png')
H=max(a.size[1],b.size[1]); W=a.size[0]
canvas=Image.new('RGB',(W*2+20,H),'red'); canvas.paste(a,(0,0)); canvas.paste(b,(W+20,0))
c=canvas.resize((int(canvas.size[0]*sc),int(H*sc)))
n=0
for y in range(0,c.size[1],chunk):
    c.crop((0,y,c.size[0],min(c.size[1],y+chunk))).save(f'{out}-{n}.png'); n+=1
print(n,'chunks', c.size, 'scale', sc, 'chunk px in source', chunk/sc)
