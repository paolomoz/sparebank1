import re,sys,difflib
def load(f): return [tuple(map(int,m.groups())) for l in open(f) for m in [re.match(r'\s*(\d+) h\s*(\d+) x\s*(\d+)-\s*(\d+)',l)] if m]
L=load(sys.argv[1]); E=load(sys.argv[2])
kl=[(h,x0//4,x1//4) for y,h,x0,x1 in L]; ke=[(h,x0//4,x1//4) for y,h,x0,x1 in E]
sm=difflib.SequenceMatcher(None,kl,ke,autojunk=False); last=None
for op,i1,i2,j1,j2 in sm.get_opcodes():
    if op=='equal':
        for i,j in zip(range(i1,i2),range(j1,j2)):
            d=E[j][0]-L[i][0]
            if d!=last: print(f'live y{L[i][0]:6} h{L[i][1]:4} x{L[i][2]}-{L[i][3]}  emu dy {d:+4}'); last=d
    elif '-v' in sys.argv:
        for i in range(i1,i2): print(f'  - live y{L[i][0]} h{L[i][1]} x{L[i][2]}-{L[i][3]}')
        for j in range(j1,j2): print(f'  + emu  y{E[j][0]} h{E[j][1]} x{E[j][2]}-{E[j][3]}')
