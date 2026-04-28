// ============================================================
// SVG Path Data — All visual assets for Mia's Bakery video
// ============================================================

// --- CHARACTERS ---

// Woman standing (Mia) — side view, hair, bag
export const MIA_STANDING = {
  body: "M50,15 C50,7 57,0 65,0 C73,0 80,7 80,15 C80,23 73,30 65,30 C57,30 50,23 50,15 Z M55,32 L75,32 L78,70 L82,72 L82,78 L72,75 L74,110 L68,110 L65,80 L62,110 L56,110 L58,75 L48,78 L48,72 L52,70 Z",
  hair: "M50,14 C50,4 58,-2 66,-2 C74,-2 80,4 80,12 C80,8 76,4 66,4 C56,4 52,8 50,14 Z",
  bag: "M82,55 L96,58 L94,80 L80,77 Z",
  viewBox: "0 0 130 115",
};

// Person standing neutral (neighbor/generic)
export const PERSON_STANDING = {
  body: "M50,15 C50,7 57,0 65,0 C73,0 80,7 80,15 C80,23 73,30 65,30 C57,30 50,23 50,15 Z M57,32 L73,32 L76,70 L73,110 L67,110 L65,78 L63,110 L57,110 L54,70 Z",
  viewBox: "0 0 130 115",
};

// Person laughing (head tilted back, mouth open)
export const PERSON_LAUGHING = {
  body: "M50,18 C48,10 54,2 63,1 C72,0 79,7 79,16 C79,24 73,30 65,30 C57,30 50,25 50,18 Z M57,32 L73,32 L75,68 L78,72 L75,75 L73,110 L67,110 L65,78 L63,110 L57,110 L55,75 L52,72 L55,68 Z",
  mouth: "M58,20 Q65,28 72,20",
  viewBox: "0 0 130 115",
};

// Person sitting (neighbor tasting bread)
export const PERSON_SITTING = {
  body: "M50,15 C50,7 57,0 65,0 C73,0 80,7 80,15 C80,23 73,30 65,30 C57,30 50,23 50,15 Z M57,32 L73,32 L75,60 L90,62 L90,68 L75,66 L75,72 L80,100 L74,100 L70,75 L60,75 L56,100 L50,100 L55,72 L55,66 L40,68 L40,62 L55,60 Z",
  viewBox: "0 0 130 105",
};

// Child (smaller, hand raised)
export const CHILD = {
  body: "M52,10 C52,5 56,0 62,0 C68,0 72,5 72,10 C72,16 68,20 62,20 C56,20 52,16 52,10 Z M56,22 L68,22 L70,40 L74,36 L76,38 L70,46 L70,65 L66,65 L64,50 L60,50 L58,65 L54,65 L54,46 L48,38 L50,36 L54,40 Z",
  viewBox: "0 0 124 70",
};

// --- OBJECTS ---

// Bus stop (shelter with sign, bench)
export const BUS_STOP = {
  shelter: "M20,10 L100,10 L105,15 L105,120 L100,120 L100,20 L20,20 L20,120 L15,120 L15,15 Z",
  sign: "M45,0 L75,0 L75,18 L45,18 Z",
  bench: "M25,100 L95,100 L95,108 L90,120 L85,120 L88,108 L32,108 L35,120 L30,120 L27,108 L25,108 Z",
  viewBox: "0 0 120 125",
};

// Croissant (detailed bread shape)
export const CROISSANT = "M30,35 C20,30 10,20 15,10 C20,2 35,0 45,5 C48,2 52,0 55,0 C58,0 62,2 65,5 C75,0 90,2 95,10 C100,20 90,30 80,35 C75,38 70,40 60,40 C50,40 40,38 30,35 Z M25,32 C30,28 40,35 50,36 M85,32 C80,28 70,35 60,36 M45,8 C48,12 52,15 55,12 C58,15 62,12 65,8";

// Baguette
export const BAGUETTE = "M10,25 C10,15 20,5 40,3 C60,1 90,5 100,15 C105,20 105,30 100,35 C90,42 60,45 40,43 C20,41 10,35 10,25 Z M20,10 L25,8 M40,5 L42,3 M60,4 L62,2 M80,8 L83,5";

// Cake (layered with cherry)
export const CAKE = {
  base: "M15,80 L15,50 C15,45 20,40 30,38 L70,38 C80,40 85,45 85,50 L85,80 Z",
  frosting: "M15,50 C18,42 25,38 30,38 L70,38 C75,38 82,42 85,50 C80,46 70,44 50,44 C30,44 20,46 15,50 Z",
  cherry: "M48,30 C48,25 52,22 55,22 C58,22 62,25 62,30 C62,35 58,38 55,38 C52,38 48,35 48,30 Z",
  stem: "M55,22 C55,18 58,14 62,12",
  viewBox: "0 0 100 85",
};

// Recipe book (open, with pages)
export const BOOK = {
  cover: "M5,10 L45,5 L45,85 L5,90 Z M55,5 L95,10 L95,90 L55,85 Z",
  spine: "M45,5 L55,5 L55,85 L45,85 Z",
  pages: "M12,18 L40,14 M12,28 L40,24 M12,38 L40,34 M12,48 L40,44 M60,14 L88,18 M60,24 L88,28 M60,34 L88,38",
  viewBox: "0 0 100 95",
};

// Glass jar with lid
export const JAR = {
  glass: "M25,20 C22,20 20,22 20,28 L18,85 C18,92 25,95 40,95 C55,95 62,92 62,85 L60,28 C60,22 58,20 55,20 Z",
  lid: "M22,15 L58,15 L58,22 L22,22 Z",
  highlight: "M28,30 L28,80",
  viewBox: "0 0 80 100",
};

// Coin
export const COIN = "M0,8 C0,3 4,0 10,0 C16,0 20,3 20,8 C20,13 16,16 10,16 C4,16 0,13 0,8 Z";

// Shop building (detailed bakery)
export const SHOP = {
  building: "M20,40 L180,40 L180,180 L20,180 Z",
  roof: "M10,40 L100,10 L190,40 Z",
  door: "M80,120 L120,120 L120,180 L80,180 Z",
  doorFrame: "M78,118 L122,118 L122,180 L78,180 Z",
  window: "M35,60 L70,60 L70,100 L35,100 Z M130,60 L165,60 L165,100 L130,100 Z",
  windowFrame: "M52,60 L52,100 M35,80 L70,80 M147,60 L147,100 M130,80 L165,80",
  signBoard: "M50,22 L150,22 L150,38 L50,38 Z",
  viewBox: "0 0 200 185",
};

// Streetlight
export const STREETLIGHT = {
  pole: "M48,40 L52,40 L52,180 L48,180 Z",
  lamp: "M35,25 C35,15 45,8 50,8 C55,8 65,15 65,25 L65,40 L35,40 Z",
  glow: "M50,40 L30,100 L70,100 Z",
  viewBox: "0 0 100 185",
};

// Bunting flags (celebration)
export const BUNTING = "M0,0 L20,0 L10,18 Z";

// Smile face (for neighbor)
export const SMILE = {
  leftEye: "M40,35 C40,32 42,30 45,30 C48,30 50,32 50,35",
  rightEye: "M55,35 C55,32 57,30 60,30 C63,30 65,32 65,35",
  mouth: "M38,48 Q52,62 67,48",
};

// --- ATMOSPHERE ---

// Heavy dark clouds
export const CLOUD = "M25,60 C10,60 0,50 0,35 C0,20 15,10 30,15 C35,5 55,0 70,10 C85,5 100,20 100,35 C100,50 90,60 75,60 Z";

// Lightning bolt
export const LIGHTNING = "M40,0 L10,60 L35,60 L15,120 L60,40 L30,40 L50,0 Z";
