import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from "remotion";
import { noise2D } from "@remotion/noise";

const FONT = "'Impact','Arial Black',sans-serif";
const C = {
  bg1:"#0A0118", bg2:"#120628", ego:"#FF2D55", egoG:"rgba(255,45,85,0.4)",
  truth:"#00E5FF", truthG:"rgba(0,229,255,0.5)", accept:"#FFD700",
  acceptG:"rgba(255,215,0,0.4)", white:"#FFF",
};
const PC = ["#FF6B9D","#7B68EE","#00E5FF","#FFD700","#FF4500","#39FF14","#FF2D55","#00E5FF"];

// ACCEPTANCE letters + layout
const AL = "ACCEPTANCE".split("");
const LS = 85; const TW = AL.length * LS;
const AX = (i: number) => -TW/2 + LS/2 + i * LS;

// 50 fragments — each assigned to one ACCEPTANCE letter
// source: 0=EGO(red), 1=TRUTH(cyan)
const FRAGS = Array.from({length:50},(_,i)=>({
  angle: (i/50)*Math.PI*2 + noise2D("a",i,0)*0.9,
  dist: 180 + noise2D("d",i,0)*280,
  rot: noise2D("r",i,0)*6,
  phase: noise2D("p",i,0)*Math.PI*2,
  color: i < 20 ? PC[i%3] : PC[3 + i%5], // first 20 = EGO colors, rest = TRUTH colors
  sz: 12 + noise2D("s",i,0)*20,
  src: i < 20 ? 0 : 1,
  target: i % AL.length, // which ACCEPTANCE letter
  shape: i % 4, // 0=circle, 1=square, 2=diamond, 3=rect
}));

export const EgoShatter: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // TIMING: Act1 0-50 | Act2 50-88 | IMPACT 88 | Act3 88-165 | Act4 165-240
  const IMPACT = 88;

  // ── BG ──
  const bgN = noise2D("bg",0,frame*0.005)*12;

  // ── ACT 1: EGO drops ──
  const egoDrop = spring({frame, fps, from:-600, to:0, config:{stiffness:100,damping:9,mass:1.8}});
  const sh1 = interpolate(frame,[14,18,35],[0,16,0],{extrapolateLeft:"clamp",extrapolateRight:"clamp"});

  // ── ACT 2: TRUTH flies from left ──
  const truthX = interpolate(frame,[50,IMPACT],[-1200,0],{
    easing:Easing.in(Easing.poly(3)),extrapolateLeft:"clamp",extrapolateRight:"clamp"});
  const truthOp = interpolate(frame,[50,55],[0,1],{extrapolateLeft:"clamp",extrapolateRight:"clamp"});

  // ── COLLISION at frame 88: both vanish instantly ──
  const bothVisible = frame < IMPACT + 2;
  const bothOp = interpolate(frame,[IMPACT,IMPACT+2],[1,0],{extrapolateLeft:"clamp",extrapolateRight:"clamp"});

  // Impact shake + flash
  const sh2 = interpolate(frame,[IMPACT,IMPACT+3,IMPACT+18],[0,28,0],{extrapolateLeft:"clamp",extrapolateRight:"clamp"});
  const flash = interpolate(frame,[IMPACT,IMPACT+3,IMPACT+10],[0,0.6,0],{extrapolateLeft:"clamp",extrapolateRight:"clamp"});
  const totalSh = sh1 + sh2;
  const shX = totalSh * noise2D("sx",0,frame*0.7);
  const shY = totalSh * noise2D("sy",1,frame*0.7);

  // Shockwaves
  const swScale = interpolate(frame,[IMPACT,IMPACT+30],[0,6],{easing:Easing.out(Easing.cubic),extrapolateLeft:"clamp",extrapolateRight:"clamp"});
  const swOp = interpolate(frame,[IMPACT,IMPACT+30],[0.6,0],{extrapolateLeft:"clamp",extrapolateRight:"clamp"});

  // ── ACT 3-4: Fragments burst → float → converge to ACCEPTANCE letters ──
  const fragData = FRAGS.map((f,i)=>{
    // Burst (power4.out)
    const bp = interpolate(frame,[IMPACT,IMPACT+30],[0,1],{
      easing:Easing.out(Easing.poly(4)),extrapolateLeft:"clamp",extrapolateRight:"clamp"});
    const bx = Math.cos(f.angle)*f.dist*bp;
    const by = Math.sin(f.angle)*f.dist*bp;
    // Float
    const ft = Math.max(0,frame-IMPACT-20);
    const fx = Math.sin(ft*0.03+f.phase)*28;
    const fy = Math.cos(ft*0.025+f.phase*1.3)*22;
    // Converge to target ACCEPTANCE letter position
    const tx = AX(f.target), ty = 0;
    const cp = interpolate(frame,[165,215],[0,1],{
      easing:Easing.inOut(Easing.cubic),extrapolateLeft:"clamp",extrapolateRight:"clamp"});
    const cx = bx+fx, cy = by+fy;
    const rx = cx+(tx-cx)*cp, ry = cy+(ty-cy)*cp;
    // Rotation slows
    const rot = (Math.max(0,frame-IMPACT))*f.rot*(1-cp);
    // Opacity: appear at impact, stay, fade as letter forms
    const op = interpolate(frame,[IMPACT,IMPACT+4,210,228],[0,1,1,0],{
      extrapolateLeft:"clamp",extrapolateRight:"clamp"});
    // Scale down as converging
    const sc = interpolate(frame,[IMPACT,IMPACT+5,210,225],[0,1,1,0.2],{
      extrapolateLeft:"clamp",extrapolateRight:"clamp"});
    return {x:rx,y:ry,rot,op,sc,f};
  });

  // ── ACCEPTANCE letters form from fragments ──
  const acceptData = AL.map((letter,i)=>{
    const delay = 210 + i*2;
    const op = interpolate(frame,[delay,delay+10],[0,1],{
      easing:Easing.out(Easing.cubic),extrapolateLeft:"clamp",extrapolateRight:"clamp"});
    const sc = interpolate(frame,[delay,delay+8],[1.3,1],{
      easing:Easing.out(Easing.cubic),extrapolateLeft:"clamp",extrapolateRight:"clamp"});
    const ly = interpolate(frame,[delay,delay+10],[15,0],{
      easing:Easing.out(Easing.cubic),extrapolateLeft:"clamp",extrapolateRight:"clamp"});
    return {letter,op,sc,ly,x:AX(i)};
  });

  const glowP = frame>=220 ? 0.3+Math.sin((frame-220)*0.15)*0.12 : 0;
  const lineW = interpolate(frame,[222,238],[0,700],{
    easing:Easing.out(Easing.cubic),extrapolateLeft:"clamp",extrapolateRight:"clamp"});

  return (
    <AbsoluteFill style={{overflow:"hidden"}}>
      {/* BG */}
      <AbsoluteFill style={{background:`radial-gradient(ellipse at ${50+bgN}% 45%,${C.bg2},${C.bg1} 70%,#000 100%)`}}/>
      {/* Grid */}
      <svg style={{position:"absolute",width:1920,height:1080,opacity:0.03}}>
        {Array.from({length:20},(_,i)=><line key={i} x1={0} y1={i*56} x2={1920} y2={i*56} stroke="#fff" strokeWidth={0.5}/>)}
        {Array.from({length:35},(_,i)=><line key={`v${i}`} x1={i*56} y1={0} x2={i*56} y2={1080} stroke="#fff" strokeWidth={0.5}/>)}
      </svg>

      {/* Shake wrapper */}
      <div style={{width:"100%",height:"100%",position:"relative",transform:`translate(${shX}px,${shY}px)`}}>
        {/* Flash */}
        <AbsoluteFill style={{background:`radial-gradient(circle,${C.white} 5%,${C.truth} 25%,${C.ego} 45%,transparent 65%)`,opacity:flash,pointerEvents:"none"}}/>
        {/* Shockwaves */}
        {swOp>0&&[1,0.7].map((s,i)=>(
          <div key={i} style={{position:"absolute",left:"50%",top:"50%",width:100,height:100,borderRadius:"50%",
            border:`2px solid ${i===0?C.truth:C.ego}`,
            transform:`translate(-50%,-50%) scale(${swScale*s})`,opacity:swOp*(1-i*0.3),pointerEvents:"none"}}/>
        ))}

        {/* EGO (Act 1-2, vanishes at impact) */}
        {bothVisible&&(
          <div style={{position:"absolute",left:"50%",top:"50%",
            transform:`translate(-50%,-50%) translateY(${egoDrop}px)`,opacity:bothOp}}>
            <div style={{position:"absolute",top:"50%",left:"50%",width:600,height:400,borderRadius:"50%",
              background:`radial-gradient(ellipse,${C.egoG},transparent 60%)`,transform:"translate(-50%,-50%)",filter:"blur(30px)"}}/>
            <span style={{fontSize:280,fontWeight:900,fontFamily:FONT,color:C.ego,lineHeight:1,
              textShadow:`0 0 60px ${C.egoG},0 0 120px ${C.egoG}`,letterSpacing:20}}>EGO</span>
          </div>
        )}

        {/* TRUTH (Act 2, same size, flies in, vanishes at impact) */}
        {frame>=50&&bothVisible&&(
          <div style={{position:"absolute",left:"50%",top:"50%",
            transform:`translate(calc(-50% + ${truthX}px),-50%)`,opacity:bothOp*truthOp}}>
            <div style={{position:"absolute",top:"50%",left:"50%",width:700,height:400,borderRadius:"50%",
              background:`radial-gradient(ellipse,${C.truthG},transparent 60%)`,transform:"translate(-50%,-50%)",filter:"blur(30px)"}}/>
            {/* Speed lines */}
            {frame>=60&&frame<IMPACT&&(
              <svg style={{position:"absolute",top:"50%",right:"100%",width:500,height:160,transform:"translateY(-50%)"}}>
                {Array.from({length:6},(_,i)=>{
                  const ly=15+i*22, lw=80+noise2D("sl",i,frame*0.1)*180;
                  return <line key={i} x1={500} y1={ly} x2={500-lw} y2={ly} stroke={C.truth} strokeWidth={2} opacity={0.3+noise2D("so",i,frame*0.12)*0.2}/>;
                })}
              </svg>
            )}
            <span style={{fontSize:260,fontWeight:900,fontFamily:FONT,color:C.truth,lineHeight:1,
              textShadow:`0 0 60px ${C.truthG},0 0 120px ${C.truthG}`,letterSpacing:12}}>TRUTH</span>
          </div>
        )}

        {/* FRAGMENTS — burst from collision, then converge to form ACCEPTANCE letters */}
        {frame>=IMPACT&&fragData.map((fd,i)=>{
          const sh = fd.f.shape;
          const br = sh===0?fd.f.sz:sh===2?0:sh===3?2:4;
          const w = sh===3?fd.f.sz*1.6:fd.f.sz;
          const h = sh===3?fd.f.sz*0.6:fd.f.sz;
          const rot2 = sh===2?45:0;
          return (
            <div key={i} style={{
              position:"absolute",left:"50%",top:"50%",
              transform:`translate(${fd.x}px,${fd.y}px) rotate(${fd.rot+rot2}deg) scale(${fd.sc})`,
              width:w,height:h,borderRadius:br,backgroundColor:fd.f.color,
              opacity:fd.op,boxShadow:`0 0 ${fd.f.sz*0.8}px ${fd.f.color}`,
            }}/>
          );
        })}

        {/* Extra dust particles */}
        {frame>=IMPACT+2&&Array.from({length:25},(_,i)=>{
          const a=(i/25)*Math.PI*2+noise2D("da",i,0)*1.2;
          const d=interpolate(frame,[IMPACT+2,IMPACT+35],[0,120+noise2D("dd",i,0)*180],{
            easing:Easing.out(Easing.poly(3)),extrapolateLeft:"clamp",extrapolateRight:"clamp"});
          const px=Math.cos(a)*d+noise2D("dx",i,frame*0.015)*15;
          const py=Math.sin(a)*d+noise2D("dy",i,frame*0.015)*15;
          const po=interpolate(frame,[IMPACT+2,IMPACT+8,195,215],[0,0.5,0.3,0],{
            extrapolateLeft:"clamp",extrapolateRight:"clamp"});
          return <div key={`d${i}`} style={{position:"absolute",left:"50%",top:"50%",
            transform:`translate(${px}px,${py}px)`,width:3+noise2D("ds",i,0)*3,height:3+noise2D("ds",i,0)*3,
            borderRadius:10,backgroundColor:PC[i%8],opacity:po}}/>;
        })}

        {/* ACCEPTANCE letters — emerge from fragment clusters */}
        {acceptData.map((ad,i)=>(
          <span key={i} style={{
            position:"absolute",left:`calc(50% + ${ad.x}px)`,top:"50%",
            transform:`translate(-50%,-50%) scale(${ad.sc}) translateY(${ad.ly}px)`,
            fontSize:110,fontWeight:900,fontFamily:FONT,color:C.accept,lineHeight:1,
            opacity:ad.op,display:"inline-block",
            textShadow:`0 0 35px ${C.acceptG},0 0 70px ${C.acceptG}`,
          }}>{ad.letter}</span>
        ))}

        {/* Glow behind ACCEPTANCE */}
        {glowP>0&&<div style={{position:"absolute",left:"50%",top:"50%",width:900,height:300,borderRadius:"50%",
          background:`radial-gradient(ellipse,${C.acceptG},transparent 60%)`,transform:"translate(-50%,-50%)",
          filter:"blur(40px)",opacity:glowP,pointerEvents:"none"}}/>}

        {/* Gradient accent line */}
        {lineW>0&&<div style={{position:"absolute",left:"50%",top:"58%",transform:"translateX(-50%)",
          width:lineW,height:4,borderRadius:4,background:`linear-gradient(90deg,${C.truth},${C.accept},${C.ego})`,
          opacity:0.6}}/>}

        {/* Sparkles around ACCEPTANCE */}
        {frame>=218&&Array.from({length:14},(_,i)=>{
          const a=(i/14)*Math.PI*2;
          const d=220+noise2D("sd",i,frame*0.01)*60;
          const tw=(noise2D("tw",i,frame*0.06)+1)*0.5;
          const so=tw*interpolate(frame,[218,230],[0,0.6],{extrapolateLeft:"clamp",extrapolateRight:"clamp"});
          return <div key={`s${i}`} style={{position:"absolute",left:`calc(50% + ${Math.cos(a+frame*0.004)*d}px)`,
            top:`calc(50% + ${Math.sin(a+frame*0.004)*d}px)`,width:5,height:5,borderRadius:5,
            backgroundColor:PC[i%8],opacity:so,boxShadow:`0 0 8px ${PC[i%8]}`}}/>;
        })}
      </div>
    </AbsoluteFill>
  );
};
