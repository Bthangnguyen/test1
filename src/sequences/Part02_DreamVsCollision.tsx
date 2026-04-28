import React from "react";
import { useCurrentFrame, AbsoluteFill, interpolate } from "remotion";
import { DotTyper } from "../components/DotTyper";
import { seededRandom, power4Out, screenShake, backOut } from "../utils/PhysicsUtils";

/* ═══════════════════════════════════════════════════════════
   PART 2: DREAM vs COLLISION — V3 PHYSICS REWRITE
   600 frames (20s @ 30fps)

   A (0–140):     Trapped dot SMASHING walls + squash/stretch + red flash
   B (140–145):   BLACK SILENCE
   C (145–175):   Wall EXPLODE as 4 line segments
   D (175–230):   Dot settles on horizontal line, line SAGS
   E (230–260):   Line SNAPS in half, halves recoil+fall
   F (260–410):   Free fall + bar bounces + FLOOR SLAM + shockwave + particles
   G (410–530):   Hexagon POP-IN 0→110%→100%, massive, glow
   H (530–600):   Lesson text + fade
   ═══════════════════════════════════════════════════════════ */

const ACCENT = "#FF4D00";
const DOT_R = 7;
const BOX = 160;
const CX = 960, CY = 540;
const HALF = BOX / 2 - DOT_R;

// ═══ Deterministic trapped-dot physics ═══
interface TState { x:number; y:number; sx:number; sy:number; flash:boolean; shakeX:number; shakeY:number }

function simTrapped(frame: number): TState {
  let x=CX, y=CY, vx=4.2, vy=3.1;
  let sx=1, sy=1, flash=false, shakeX=0, shakeY=0;
  for (let f=0; f<=frame; f++) {
    x+=vx; y+=vy;
    flash=false; sx=1; sy=1; shakeX=0; shakeY=0;
    // Right wall
    if (x > CX+HALF) { x=CX+HALF; vx=-Math.abs(vx)*0.97; flash=true; sx=0.6; sy=1.35; shakeX=8; vy+=(seededRandom(f*13)-0.5)*0.8; }
    // Left wall
    if (x < CX-HALF) { x=CX-HALF; vx=Math.abs(vx)*0.97; flash=true; sx=0.6; sy=1.35; shakeX=-8; vy+=(seededRandom(f*17)-0.5)*0.8; }
    // Bottom wall
    if (y > CY+HALF) { y=CY+HALF; vy=-Math.abs(vy)*0.97; flash=true; sy=0.6; sx=1.35; shakeY=8; vx+=(seededRandom(f*23)-0.5)*0.8; }
    // Top wall
    if (y < CY-HALF) { y=CY-HALF; vy=Math.abs(vy)*0.97; flash=true; sy=0.6; sx=1.35; shakeY=-8; vx+=(seededRandom(f*29)-0.5)*0.8; }
    const spd=Math.sqrt(vx*vx+vy*vy);
    if(spd>6){vx*=6/spd;vy*=6/spd;} if(spd<3){vx*=3.5/spd;vy*=3.5/spd;}
  }
  return {x,y,sx,sy,flash,shakeX,shakeY};
}

// ═══ Free fall physics with bar bounces ═══
const BARS = [
  {y:150, w:260, xOff:-60}, {y:300, w:200, xOff:100},
  {y:440, w:300, xOff:-30}, {y:580, w:220, xOff:70},
];

interface FState { x:number; y:number; vy:number; sx:number; sy:number; spark:boolean; sparkX:number; sparkY:number }

function simFall(ff: number): FState {
  let y=0, vy=0, sx=1, sy=1, spark=false, sparkX=CX, sparkY=0;
  const g=0.22;
  const x = CX + Math.sin(ff*0.04)*25;
  for (let f=0; f<=ff; f++) {
    vy+=g; y+=vy; spark=false;
    // Motion blur: stretch based on velocity
    sy = 1 + Math.min(Math.abs(vy)*0.04, 0.8);
    sx = 1 / sy;
    for (const bar of BARS) {
      if (y>=bar.y-4 && y<=bar.y+4 && vy>0) {
        vy=-vy*0.5; y=bar.y-4; spark=true; sparkX=CX+bar.xOff; sparkY=bar.y;
        sx=1.6; sy=0.45; break;
      }
    }
    // Floor slam at y=750
    if (y>=750 && vy>0) { vy=-vy*0.2; y=750; spark=true; sparkX=CX; sparkY=750; sx=2.0; sy=0.3; }
  }
  return {x,y,vy,sx,sy,spark,sparkX,sparkY};
}

// ═══ Particles for floor slam ═══
const PARTICLES = Array.from({length:12}, (_,i) => ({
  angle: (i/12)*Math.PI*2 + seededRandom(i*41)*0.5,
  speed: 3 + seededRandom(i*67)*5,
  size: 2 + seededRandom(i*83)*3,
}));

export const Part02_DreamVsCollision: React.FC = () => {
  const frame = useCurrentFrame();

  const masterOp = interpolate(frame, [0,5,570,600], [0,1,1,0], {extrapolateLeft:"clamp",extrapolateRight:"clamp"});

  // Phase flags
  const phA = frame < 140;
  const phB = frame>=140 && frame<=142;
  const phC = frame>=143 && frame<175;
  const phD = frame>=175 && frame<230;
  const phE = frame>=230 && frame<260;
  const phF = frame>=260 && frame<410;
  const phG = frame>=410 && frame<530;
  const phH = frame>=530;

  // ═══ TRAPPED DOT ═══
  const t = phA ? simTrapped(frame) : {x:CX,y:CY,sx:1,sy:1,flash:false,shakeX:0,shakeY:0};

  // Red flash decays over 10 frames
  const recentFlash = phA && t.flash;
  // Find last flash frame for decay
  let flashIntensity = 0;
  if (phA) {
    for (let lookback=0; lookback<10; lookback++) {
      if (frame-lookback >= 0) {
        const prev = simTrapped(frame-lookback);
        if (prev.flash) { flashIntensity = 1 - lookback/10; break; }
      }
    }
  }

  // Box recoil (Newton's 3rd law)
  const boxRecoilX = phA ? t.shakeX * 0.5 : 0;
  const boxRecoilY = phA ? t.shakeY * 0.5 : 0;

  // High-freq wiggle on impact
  const wiggleX = recentFlash ? Math.sin(frame*23)*3 : 0;
  const wiggleY = recentFlash ? Math.cos(frame*31)*3 : 0;

  // ═══ WALL EXPLODE ═══
  const exP = interpolate(frame, [143,170], [0,1], {extrapolateLeft:"clamp",extrapolateRight:"clamp"});
  const exE = power4Out(exP);
  const exShake = screenShake(frame, 143, 22, 10);

  // ═══ LINE SAG ═══
  const lineAppear = interpolate(frame, [180,195], [0,1], {extrapolateLeft:"clamp",extrapolateRight:"clamp"});
  const dotOnLine = phD;
  const sagAmount = dotOnLine ? interpolate(frame, [195,225], [0,30], {extrapolateLeft:"clamp",extrapolateRight:"clamp"}) : 0;
  // Dot settles on line
  const dotLineY = CY + sagAmount;

  // ═══ LINE SNAP ═══
  const snapFrame = 232;
  const snapP = interpolate(frame, [snapFrame, snapFrame+25], [0,1], {extrapolateLeft:"clamp",extrapolateRight:"clamp"});
  const snapShake = screenShake(frame, snapFrame, 15, 10);
  // Left half recoils up then falls
  const leftRecoil = snapP > 0 ? -20 * Math.sin(snapP*Math.PI*0.5) * (1-snapP) + snapP*snapP*400 : 0;
  const leftRot = snapP * -25;
  const leftOp = 1 - snapP*0.9;
  // Right half
  const rightRecoil = snapP > 0 ? -15 * Math.sin(snapP*Math.PI*0.5) * (1-snapP) + snapP*snapP*350 : 0;
  const rightRot = snapP * 20;
  const rightOp = 1 - snapP*0.8;

  // ═══ FREE FALL ═══
  const ff = frame - 260;
  const fall = phF ? simFall(ff) : {x:CX,y:0,vy:0,sx:1,sy:1,spark:false,sparkX:CX,sparkY:0};

  // Floor slam detection (dot hits y=750)
  const floorSlam = phF && fall.y >= 745;
  const floorSlamFrame = (() => {
    if (!phF) return 999;
    for (let f=0; f<=ff; f++) { if (simFall(f).y >= 745) return 260+f; }
    return 999;
  })();
  const slamShake = screenShake(frame, floorSlamFrame, 35, 20);

  // Shockwave from floor slam
  const slamDiff = frame - floorSlamFrame;
  const shockR = slamDiff >= 0 && slamDiff < 25 ? power4Out(slamDiff/25) * 500 : 0;
  const shockOp = slamDiff >= 0 && slamDiff < 25 ? (1 - slamDiff/25) * 0.6 : 0;

  // Particles from floor slam
  const particlesActive = slamDiff >= 0 && slamDiff < 30;

  // Camera follow
  const camY = phF ? Math.max(0, fall.y - 350) : phG||phH ? Math.max(0, 750 - 350) : 0;

  // ═══ HEXAGON POP-IN ═══
  const hexDelay = 430;
  const hexRaw = interpolate(frame, [hexDelay, hexDelay+5], [0,1], {extrapolateLeft:"clamp",extrapolateRight:"clamp"});
  // Overshoot: 0→110%→100%
  const hexScale = hexRaw > 0 ? (hexRaw < 1
    ? hexRaw * 1.15
    : 1.15 - interpolate(frame, [hexDelay+5, hexDelay+15], [0, 0.15], {extrapolateLeft:"clamp",extrapolateRight:"clamp"})
  ) : 0;
  const hexSize = 100; // 200% bigger than before (was 50)
  const hexClip = "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)";
  const hexGlow = interpolate(frame, [hexDelay+15, hexDelay+25], [0,1], {extrapolateLeft:"clamp",extrapolateRight:"clamp"});
  const hexShake = screenShake(frame, hexDelay, 12, 8);

  // Global shake composite
  const gsx = (phA ? wiggleX : 0) + exShake.x + snapShake.x + slamShake.x + hexShake.x;
  const gsy = (phA ? wiggleY : 0) + exShake.y + snapShake.y + slamShake.y + hexShake.y;

  return (
    <AbsoluteFill style={{backgroundColor:"#0a0a0a", opacity:masterOp, overflow:"hidden"}}>
      {/* Black silence */}
      {phB && <div style={{position:"absolute",inset:0,backgroundColor:"#000",zIndex:100}} />}

      <div style={{position:"absolute",inset:0, transform:`translate(${gsx}px,${gsy - camY}px)`}}>

        {/* ═══ A: TRAPPED — Box + Dot ═══ */}
        {phA && <>
          {/* Box with recoil + red flash */}
          <div style={{
            position:"absolute", left:CX-BOX/2+boxRecoilX, top:CY-BOX/2+boxRecoilY,
            width:BOX, height:BOX,
            border:`1px solid rgba(${flashIntensity>0.3 ? '255,60,60' : '245,245,245'},${0.12 + flashIntensity*0.4})`,
            boxShadow: flashIntensity > 0.1
              ? `inset 0 0 ${flashIntensity*20}px rgba(255,50,50,${flashIntensity*0.15}), 0 0 ${flashIntensity*10}px rgba(255,50,50,${flashIntensity*0.1})`
              : "none",
          }} />
          {/* Dot with squash/stretch + red flash */}
          <div style={{
            position:"absolute", left:t.x-DOT_R, top:t.y-DOT_R,
            width:DOT_R*2, height:DOT_R*2, borderRadius:"50%",
            backgroundColor: flashIntensity > 0.5 ? `rgba(255,${Math.floor(80+175*(1-flashIntensity))},${Math.floor(80+175*(1-flashIntensity))},1)` : "#f5f5f5",
            transform:`scale(${t.sx},${t.sy})`,
            boxShadow: flashIntensity > 0.3
              ? `0 0 ${flashIntensity*12}px rgba(255,60,60,${flashIntensity*0.5})`
              : "0 0 6px rgba(245,245,245,0.2)",
          }} />
        </>}

        {/* ═══ C: WALL EXPLODE — 4 line segments ═══ */}
        {phC && <>
          <div style={{position:"absolute",left:CX-BOX/2,top:CY-BOX/2,width:BOX,height:1,backgroundColor:"rgba(245,245,245,0.15)",
            transform:`translateY(${-exE*350}px) rotate(${exE*-18}deg)`,opacity:1-exE}} />
          <div style={{position:"absolute",left:CX-BOX/2,top:CY+BOX/2,width:BOX,height:1,backgroundColor:"rgba(245,245,245,0.15)",
            transform:`translateY(${exE*350}px) rotate(${exE*14}deg)`,opacity:1-exE}} />
          <div style={{position:"absolute",left:CX-BOX/2,top:CY-BOX/2,width:1,height:BOX,backgroundColor:"rgba(245,245,245,0.15)",
            transform:`translateX(${-exE*400}px) rotate(${exE*22}deg)`,opacity:1-exE}} />
          <div style={{position:"absolute",left:CX+BOX/2,top:CY-BOX/2,width:1,height:BOX,backgroundColor:"rgba(245,245,245,0.15)",
            transform:`translateX(${exE*400}px) rotate(${exE*-20}deg)`,opacity:1-exE}} />
          {/* Freed dot */}
          <div style={{position:"absolute",left:CX-DOT_R,top:CY-DOT_R,width:DOT_R*2,height:DOT_R*2,borderRadius:"50%",backgroundColor:"#f5f5f5"}} />
        </>}

        {/* ═══ D: DOT ON LINE — line sags ═══ */}
        {phD && <>
          <svg width={1920} height={1080} style={{position:"absolute",inset:0,opacity:lineAppear}}>
            <path d={`M 300 ${CY} Q ${CX} ${CY + sagAmount} 1620 ${CY}`} fill="none" stroke="rgba(245,245,245,0.5)" strokeWidth={1} />
          </svg>
          <div style={{position:"absolute",left:CX-DOT_R,top:dotLineY-DOT_R,width:DOT_R*2,height:DOT_R*2,borderRadius:"50%",backgroundColor:"#f5f5f5",
            boxShadow:"0 0 6px rgba(245,245,245,0.2)"}} />
        </>}

        {/* ═══ E: LINE SNAPS ═══ */}
        {phE && <>
          {/* Left half */}
          <div style={{position:"absolute",left:300,top:CY+sagAmount*0.3+leftRecoil,width:CX-300,height:1,
            backgroundColor:"rgba(245,245,245,0.5)",transformOrigin:"right center",
            transform:`rotate(${leftRot}deg)`,opacity:leftOp}} />
          {/* Right half */}
          <div style={{position:"absolute",left:CX,top:CY+sagAmount*0.3+rightRecoil,width:1620-CX,height:1,
            backgroundColor:"rgba(245,245,245,0.5)",transformOrigin:"left center",
            transform:`rotate(${rightRot}deg)`,opacity:rightOp}} />
          {/* Dot falls */}
          <div style={{position:"absolute",left:CX-DOT_R,
            top:CY+sagAmount + interpolate(frame,[snapFrame,260],[0,60],{extrapolateLeft:"clamp",extrapolateRight:"clamp"}) - DOT_R,
            width:DOT_R*2,height:DOT_R*2,borderRadius:"50%",backgroundColor:"#f5f5f5"}} />
        </>}

        {/* ═══ F: FREE FALL + BARS + SLAM ═══ */}
        {phF && <>
          {/* Collision bars */}
          {BARS.map((bar,i) => {
            const d = Math.abs(fall.y - bar.y);
            const lit = d < 35 ? 1-d/35 : 0;
            return <div key={`b${i}`} style={{position:"absolute",left:CX+bar.xOff-bar.w/2,top:bar.y,width:bar.w,height:1,
              backgroundColor:`rgba(245,245,245,${0.04+lit*0.5})`,
              boxShadow:lit>0?`0 0 ${lit*12}px rgba(245,245,245,${lit*0.3})`:"none"}} />;
          })}

          {/* Floor line */}
          <div style={{position:"absolute",left:200,top:750,width:1520,height:1,backgroundColor:"rgba(245,245,245,0.06)"}} />

          {/* Spark flash on bar hit */}
          {fall.spark && <div style={{position:"absolute",left:fall.sparkX-25,top:fall.sparkY-25,width:50,height:50,borderRadius:"50%",
            background:"radial-gradient(circle,rgba(255,200,100,0.7) 0%,rgba(255,100,50,0.3) 40%,transparent 70%)"}} />}

          {/* Shockwave from floor slam */}
          {shockOp > 0 && <div style={{position:"absolute",left:CX-shockR,top:750-shockR,width:shockR*2,height:shockR*2,borderRadius:"50%",
            border:`2px solid rgba(255,77,0,${shockOp})`}} />}

          {/* Particles from floor slam */}
          {particlesActive && PARTICLES.map((p,i) => {
            const pT = slamDiff / 30;
            const px = CX + Math.cos(p.angle) * p.speed * slamDiff;
            const py = 750 + Math.sin(p.angle) * p.speed * slamDiff * 0.7 - slamDiff * 0.5;
            const pOp = (1-pT) * 0.7;
            if (pOp <= 0) return null;
            return <div key={`p${i}`} style={{position:"absolute",left:px-p.size/2,top:py-p.size/2,
              width:p.size,height:p.size,borderRadius:"50%",
              backgroundColor:`rgba(255,200,150,${pOp})`}} />;
          })}

          {/* The falling dot */}
          {!floorSlam && <div style={{position:"absolute",left:fall.x-DOT_R,top:fall.y-DOT_R,
            width:DOT_R*2,height:DOT_R*2,borderRadius:"50%",backgroundColor:"#f5f5f5",
            transform:`scale(${fall.sx},${fall.sy})`}} />}

          {/* Squashed dot on floor */}
          {floorSlam && slamDiff < 30 && <div style={{position:"absolute",left:CX-DOT_R*1.5,top:750-DOT_R*0.4,
            width:DOT_R*3,height:DOT_R*0.8,borderRadius:"40%",backgroundColor:"#f5f5f5",
            transform:`scaleX(${1 + Math.max(0, 1-slamDiff/15)*0.6})`,
            opacity:interpolate(slamDiff,[20,30],[1,0],{extrapolateLeft:"clamp",extrapolateRight:"clamp"})}} />}
        </>}

        {/* ═══ G: HEXAGON POP-IN ═══ */}
        {(phG||phH) && hexScale > 0 && <div style={{
          position:"absolute",left:CX-hexSize/2,top:750-hexSize/2,width:hexSize,height:hexSize,
          backgroundColor:"#f5f5f5",clipPath:hexClip,
          transform:`scale(${hexScale})`,
          border:`2px solid rgba(255,77,0,${hexGlow*0.7})`,
          boxShadow: hexGlow > 0
            ? `0 0 ${hexGlow*35}px rgba(255,77,0,${hexGlow*0.35}), 0 0 ${hexGlow*70}px rgba(255,77,0,${hexGlow*0.15})`
            : "none",
        }} />}
      </div>

      {/* ═══ TEXT OVERLAYS (fixed position) ═══ */}
      {phA && <div style={{position:"absolute",bottom:70,left:"50%",transform:"translateX(-50%)",maxWidth:500}}>
        <DotTyper text="You sit down. You think very hard..." startFrame={15} fontSize={22} charsPerFrame={2} color="rgba(245,245,245,0.45)" />
      </div>}

      {phC && <div style={{position:"absolute",left:"50%",top:"50%",transform:"translate(-50%,-50%)",
        opacity:interpolate(frame,[148,155,168,174],[0,1,1,0],{extrapolateLeft:"clamp",extrapolateRight:"clamp"})}}>
        <div style={{fontFamily:"'Inter',sans-serif",fontSize:40,fontWeight:800,color:"#f5f5f5"}}>It won't come.</div>
      </div>}

      {phF && <div style={{position:"absolute",bottom:50,left:"50%",transform:"translateX(-50%)",maxWidth:550}}>
        <DotTyper text="Clarity comes from collision, not contemplation." startFrame={290} fontSize={20} charsPerFrame={2} color="rgba(245,245,245,0.4)" />
      </div>}

      {(phG||phH) && <div style={{position:"absolute",bottom:100,left:"50%",transform:"translateX(-50%)",maxWidth:450,
        opacity:interpolate(frame,[470,500],[0,1],{extrapolateLeft:"clamp",extrapolateRight:"clamp"})}}>
        <DotTyper text="Real insight is bruise-shaped." startFrame={500} fontSize={28} fontFamily="'Inter',sans-serif" charsPerFrame={3} style={{fontWeight:600}} />
      </div>}

      {/* Fade to black */}
      <div style={{position:"absolute",inset:0,backgroundColor:"#000",pointerEvents:"none",
        opacity:interpolate(frame,[560,600],[0,1],{extrapolateLeft:"clamp",extrapolateRight:"clamp"})}} />

      {/* Vignette */}
      <div style={{position:"absolute",inset:0,pointerEvents:"none",
        background:"radial-gradient(ellipse 70% 70% at 50% 50%, transparent 40%, rgba(0,0,0,0.6) 100%)"}} />
    </AbsoluteFill>
  );
};
