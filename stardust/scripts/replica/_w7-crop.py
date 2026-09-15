# crop.py <gatedir> <out> <y0> <y1> <yB0> [scale] — live rows y0..y1 beside eds rows from yB0
import sys
from PIL import Image
G,out,y0,y1,yb=sys.argv[1],sys.argv[2],int(sys.argv[3]),int(sys.argv[4]),int(sys.argv[5]); sc=float(sys.argv[6]) if len(sys.argv)>6 else 1.0
a=Image.open(f'{G}/live.png'); b=Image.open(f'{G}/proto.png'); h=y1-y0
ca=a.crop((0,y0,a.size[0],y1)); cb=b.crop((0,yb,b.size[0],yb+h))
c=Image.new('RGB',(a.size[0]*2+20,h),'red'); c.paste(ca,(0,0)); c.paste(cb,(a.size[0]+20,0))
c.resize((int(c.size[0]*sc),int(h*sc))).save(out); print(out)
