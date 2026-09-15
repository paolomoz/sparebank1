import sys,re,difflib
def load(f):
    rows=[]
    for l in open(f):
        m=re.match(r'\s*(\d+)\s+(\d+)\s+x\s*(-?\d+)\s+w\s*(\d+)\s+(\S+)\s+(\S+ \S+ \d+)\s+(.*)$',l.rstrip('\n'))
        if m: rows.append(dict(y=int(m[1]),h=int(m[2]),x=int(m[3]),w=int(m[4]),tag=m[5],font=m[6],t=m[7].strip()))
    return rows
A,B=load(sys.argv[1]),load(sys.argv[2])
ka=[r['t'][:30] for r in A]; kb=[r['t'][:30] for r in B]
sm=difflib.SequenceMatcher(None,ka,kb,autojunk=False)
for op,i1,i2,j1,j2 in sm.get_opcodes():
    if op=='equal':
        for i,j in zip(range(i1,i2),range(j1,j2)):
            a,b=A[i],B[j]; dy=b['y']-a['y']; dh=b['h']-a['h']; dx=b['x']-a['x']; dw=b['w']-a['w']
            flag=' ' if (abs(dy)<=2 and dh==0 and abs(dx)<=2 and abs(dw)<=4 and a['font']==b['font']) else '*'
            print(f"{flag} y{a['y']:5} dy{dy:+4} dh{dh:+4} dx{dx:+4} dw{dw:+4} {a['tag']:5}/{b['tag']:5} {a['font'] if a['font']==b['font'] else a['font']+' => '+b['font']:60.60} {a['t'][:38]}")
    else:
        for i in range(i1,i2): a=A[i]; print(f"- y{a['y']:5} h{a['h']:4} x{a['x']:4} w{a['w']:4} {a['tag']:5} {a['font']:44.44} {a['t'][:38]}")
        for j in range(j1,j2): b=B[j]; print(f"+ y{b['y']:5} h{b['h']:4} x{b['x']:4} w{b['w']:4} {b['tag']:5} {b['font']:44.44} {b['t'][:38]}")
