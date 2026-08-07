// ============================================================
// Cosmetic Recommendation Engine
// Based on: skin tone, undertone, face shape, skin type
// ============================================================

// ── Foundation recommendations ────────────────────────────────
const FOUNDATION_MAP = {
  fair: {
    warm:    { shade: 'N10–N15 (Warm Ivory)',    finish: 'Dewy or Satin',    notes: 'เลือกสูตรที่มีอันเดอร์โทนพีช/ทอง หลีกเลี่ยงรองพื้นที่มีเบสสีชมพู' },
    cool:    { shade: 'N10–N15 (Cool Porcelain)', finish: 'Matte or Satin',   notes: 'เลือกสูตรที่มีอันเดอร์โทนชมพูหรือโรส หลีกเลี่ยงเฉดสีเหลือง' },
    neutral: { shade: 'N10–N15 (Natural Ivory)',  finish: 'Satin',            notes: 'รองพื้นอันเดอร์โทนนิวทรัลส่วนใหญ่เหมาะกับคุณ' },
  },
  light: {
    warm:    { shade: 'N20–N25 (Golden Beige)',   finish: 'Dewy or Satin',    notes: 'เฉดพีช/ทองเหมาะกับคุณที่สุด' },
    cool:    { shade: 'N20–N25 (Pink Beige)',      finish: 'Matte or Satin',   notes: 'รองพื้นอันเดอร์โทนชมพูหรือโรสช่วยให้ผิวดูมีชีวิตชีวา' },
    neutral: { shade: 'N20–N25 (Natural Beige)',   finish: 'Satin',            notes: 'สูตรนิวทรัลที่สมดุลให้ผิวดูเป็นธรรมชาติที่สุด' },
  },
  medium: {
    warm:    { shade: 'N30–N40 (Warm Sand)',       finish: 'Satin or Dewy',    notes: 'รองพื้นอันเดอร์โทนทอง/เหลืองเข้ากับผิวของคุณได้ดี' },
    cool:    { shade: 'N30–N40 (Cool Sand)',        finish: 'Matte or Satin',   notes: 'เลือกรองพื้นที่มีอันเดอร์โทนชมพูหรือโอลีฟคูล' },
    neutral: { shade: 'N30–N40 (Natural Sand)',     finish: 'Satin',            notes: 'รองพื้นนิวทรัลที่มีออยล์โทนโอลีฟเล็กน้อยเหมาะกับคุณ' },
  },
  tan: {
    warm:    { shade: 'N45–N55 (Golden Tan)',      finish: 'Satin or Dewy',    notes: 'รองพื้นอันเดอร์โทนทอง/คาราเมลเหมาะกับผิวของคุณมาก' },
    cool:    { shade: 'N45–N55 (Cool Tan)',         finish: 'Matte or Satin',   notes: 'หลีกเลี่ยงสูตรที่เหลืองเกินไป เลือกเฉดแทนที่มีคูลโทน' },
    neutral: { shade: 'N45–N55 (Natural Tan)',      finish: 'Satin',            notes: 'รองพื้นแทนที่สมดุลและมีความอบอุ่นเล็กน้อยเหมาะกับคุณ' },
  },
  deep: {
    warm:    { shade: 'N60–N80 (Rich Mahogany)',   finish: 'Satin or Luminous', notes: 'เลือกรองพื้นที่มีอันเดอร์โทนแดง/ทองเพื่อเพิ่มความลึกให้ผิว' },
    cool:    { shade: 'N60–N80 (Cool Ebony)',       finish: 'Matte or Satin',    notes: 'สูตรอันเดอร์โทนน้ำเงินหรือแดงเย็นช่วยให้ผิวไม่ดูหม่น' },
    neutral: { shade: 'N60–N80 (Neutral Deep)',     finish: 'Satin',             notes: 'รองพื้นโทนเข้มที่มีอันเดอร์โทนสมดุลเหมาะที่สุด' },
  },
};

// ── Cushion recommendations ───────────────────────────────────
const CUSHION_MAP = {
  dry:         { coverage: 'Medium–Full', formula: 'Hydrating Cushion',      finish: 'Dewy',    notes: 'เลือกสูตรที่มีส่วนผสม Hyaluronic Acid หรือ Ceramide เพื่อเพิ่มความชุ่มชื้น' },
  oily:        { coverage: 'Medium–Full', formula: 'Matte Control Cushion',  finish: 'Matte',   notes: 'เลือกสูตร Oil-Free และ Long-Wear เพื่อควบคุมความมัน' },
  combination: { coverage: 'Medium',      formula: 'Balanced Cushion',       finish: 'Satin',   notes: 'คุชชั่นฟินิชซาตินช่วยสมดุลระหว่างความแห้งและความมัน' },
  sensitive:   { coverage: 'Light–Medium', formula: 'Mineral Cushion',       finish: 'Natural', notes: 'เลือกคุชชั่นมิเนอรัลที่ปราศจากน้ำหอม ลดการระคายเคือง' },
  normal:      { coverage: 'Medium',       formula: 'Natural Cushion',       finish: 'Satin',   notes: 'คุชชั่นส่วนใหญ่เหมาะกับผิวปกติ เลือกสูตรที่มี SPF ป้องกันแสงแดด' },
};

// ── Lip color recommendations ─────────────────────────────────
const LIP_MAP = {
  fair: {
    warm: [
      { name: 'Peach Nectar',   hex: '#FFAB76', finish: 'Glossy' },
      { name: 'Coral Bliss',    hex: '#FF6B6B', finish: 'Satin'  },
      { name: 'Nude Peach',     hex: '#E8A987', finish: 'Matte'  },
    ],
    cool: [
      { name: 'Baby Pink',      hex: '#FFB3C1', finish: 'Glossy' },
      { name: 'Rose Berry',     hex: '#C2185B', finish: 'Satin'  },
      { name: 'Mauve Dream',    hex: '#A06470', finish: 'Matte'  },
    ],
    neutral: [
      { name: 'Dusty Rose',     hex: '#C2848A', finish: 'Satin'  },
      { name: 'Blush Nude',     hex: '#D4A0A0', finish: 'Matte'  },
      { name: 'Pink Glaze',     hex: '#F4A7B9', finish: 'Glossy' },
    ],
  },
  light: {
    warm: [
      { name: 'Warm Coral',     hex: '#FF7F50', finish: 'Glossy' },
      { name: 'Peachy Keen',    hex: '#FFAB76', finish: 'Satin'  },
      { name: 'Terracotta',     hex: '#C96A4A', finish: 'Matte'  },
    ],
    cool: [
      { name: 'Raspberry',      hex: '#C2185B', finish: 'Satin'  },
      { name: 'Plum Wine',      hex: '#8E3A59', finish: 'Matte'  },
      { name: 'Pink Latte',     hex: '#E8A0BF', finish: 'Glossy' },
    ],
    neutral: [
      { name: 'Rosy Nude',      hex: '#C9796C', finish: 'Matte'  },
      { name: 'Berry Blush',    hex: '#B05070', finish: 'Satin'  },
      { name: 'Soft Coral',     hex: '#F4845F', finish: 'Glossy' },
    ],
  },
  medium: {
    warm: [
      { name: 'Brick Red',      hex: '#CB4154', finish: 'Matte'  },
      { name: 'Warm Sienna',    hex: '#A0522D', finish: 'Satin'  },
      { name: 'Golden Copper',  hex: '#C97A4A', finish: 'Glossy' },
    ],
    cool: [
      { name: 'Wine Berry',     hex: '#722F37', finish: 'Matte'  },
      { name: 'Deep Rose',      hex: '#A4335E', finish: 'Satin'  },
      { name: 'Cool Plum',      hex: '#6A0E5E', finish: 'Glossy' },
    ],
    neutral: [
      { name: 'Caramel Brown',  hex: '#A05030', finish: 'Matte'  },
      { name: 'Dusty Mauve',    hex: '#9E6070', finish: 'Satin'  },
      { name: 'Terracotta Rose',hex: '#C06050', finish: 'Glossy' },
    ],
  },
  tan: {
    warm: [
      { name: 'Burnt Orange',   hex: '#CC5500', finish: 'Matte'  },
      { name: 'Copper Kiss',    hex: '#B87333', finish: 'Satin'  },
      { name: 'Deep Coral',     hex: '#E05C3A', finish: 'Glossy' },
    ],
    cool: [
      { name: 'Deep Plum',      hex: '#5C2D63', finish: 'Matte'  },
      { name: 'Mulberry',       hex: '#7B0050', finish: 'Satin'  },
      { name: 'Berry Bold',     hex: '#8E2D5E', finish: 'Glossy' },
    ],
    neutral: [
      { name: 'Mocha Brown',    hex: '#8B5E3C', finish: 'Matte'  },
      { name: 'Tawny Rose',     hex: '#9B5B5B', finish: 'Satin'  },
      { name: 'Amber Nude',     hex: '#C28050', finish: 'Glossy' },
    ],
  },
  deep: {
    warm: [
      { name: 'Rich Mahogany',  hex: '#6B2A2A', finish: 'Matte'  },
      { name: 'Golden Brown',   hex: '#7B4F2E', finish: 'Satin'  },
      { name: 'Bronze Beauty',  hex: '#8B6914', finish: 'Glossy' },
    ],
    cool: [
      { name: 'Dark Berry',     hex: '#4A1550', finish: 'Matte'  },
      { name: 'Midnight Plum',  hex: '#3D0C3D', finish: 'Satin'  },
      { name: 'Blackberry',     hex: '#311B4E', finish: 'Glossy' },
    ],
    neutral: [
      { name: 'Deep Sienna',    hex: '#7B2D14', finish: 'Matte'  },
      { name: 'Cocoa',          hex: '#6B3A2A', finish: 'Satin'  },
      { name: 'Espresso Plum',  hex: '#4A2040', finish: 'Glossy' },
    ],
  },
};

// ── Blush recommendations ─────────────────────────────────────
const BLUSH_MAP = {
  fair:   { warm: '#F4A0A0', cool: '#F8BBD9', neutral: '#F4C2C2', warmName: 'Peach Flush',     coolName: 'Baby Pink',      neutralName: 'Soft Rose' },
  light:  { warm: '#F08080', cool: '#E8A0C8', neutral: '#F09090', warmName: 'Coral Glow',       coolName: 'Pink Petal',     neutralName: 'Rose Dust' },
  medium: { warm: '#C07060', cool: '#C060A0', neutral: '#C07080', warmName: 'Warm Terra',       coolName: 'Berry Rose',     neutralName: 'Dusty Mauve' },
  tan:    { warm: '#A05040', cool: '#A04080', neutral: '#A05060', warmName: 'Bronze Coral',     coolName: 'Deep Raspberry', neutralName: 'Warm Wine' },
  deep:   { warm: '#803020', cool: '#802060', neutral: '#803040', warmName: 'Deep Brick',       coolName: 'Dark Berry',     neutralName: 'Rich Plum' },
};

// ── Eyeshadow palette recommendations ────────────────────────
const EYESHADOW_MAP = {
  warm: {
    palettes: ['Amber & Bronze', 'Earth Tones', 'Golden Hour', 'Burnt Sienna'],
    colors: [
      { name: 'Warm Gold',     hex: '#D4A017' },
      { name: 'Bronze',        hex: '#8C6239' },
      { name: 'Burnt Sienna',  hex: '#A0522D' },
      { name: 'Champagne',     hex: '#F7E7CE' },
      { name: 'Copper',        hex: '#B87333' },
    ],
    tips: 'โทนวอร์มเสริมความเปล่งปลั่งตามธรรมชาติ ใช้ทองบนเปลือกตาและบรอนซ์ในร่องตาเพื่อความลึก',
  },
  cool: {
    palettes: ['Smoky Plum', 'Silver & Mauve', 'Cool Berries', 'Icy Neutrals'],
    colors: [
      { name: 'Silver',        hex: '#C0C0C0' },
      { name: 'Lavender',      hex: '#967BB6' },
      { name: 'Steel Blue',    hex: '#4682B4' },
      { name: 'Mauve',         hex: '#8B687F' },
      { name: 'Soft White',    hex: '#F5F5F5' },
    ],
    tips: 'โทนคูลเข้ากับผิวของคุณ มอฟและซิลเวอร์ให้ลุคที่ดูสง่างามและมีระดับ',
  },
  neutral: {
    palettes: ['Everyday Naturals', 'Taupe & Rose', 'Versatile Nudes', 'Classic Smoky'],
    colors: [
      { name: 'Taupe',         hex: '#8B7355' },
      { name: 'Warm Beige',    hex: '#C8A97E' },
      { name: 'Dusty Rose',    hex: '#C2848A' },
      { name: 'Soft Brown',    hex: '#7B5B3A' },
      { name: 'Ivory',         hex: '#FFFFF0' },
    ],
    tips: 'พาเลตนิวทรัลมีความหลากหลายสูงสุด ผสมโทนวอร์มและคูลได้ตามโอกาส',
  },
};

// ── Eyebrow recommendations ───────────────────────────────────
const EYEBROW_MAP = {
  fair:   { warm: 'Warm Blonde / Light Taupe',   cool: 'Ash Blonde / Cool Taupe', neutral: 'Medium Taupe'  },
  light:  { warm: 'Golden Brown / Warm Taupe',   cool: 'Cool Brown / Ash Taupe',  neutral: 'Soft Brown'    },
  medium: { warm: 'Medium Brown / Warm Brunette', cool: 'Cool Brown / Dark Taupe', neutral: 'Medium Brown'  },
  tan:    { warm: 'Dark Brunette / Warm Brown',   cool: 'Deep Brown / Espresso',   neutral: 'Dark Brown'    },
  deep:   { warm: 'Soft Black / Dark Brown',      cool: 'Black / Ebony',           neutral: 'Dark Espresso' },
};

// ── Sunscreen recommendations ─────────────────────────────────
const SUNSCREEN_MAP = {
  dry:         { spf: 'SPF 50+', type: 'Hydrating Chemical Sunscreen', formula: 'Cream or Serum', key_ingredients: 'Hyaluronic Acid, Glycerin, Niacinamide' },
  oily:        { spf: 'SPF 50+', type: 'Oil-Free Matte Sunscreen',     formula: 'Fluid or Gel',   key_ingredients: 'Silica, Zinc Oxide, Niacinamide' },
  combination: { spf: 'SPF 50+', type: 'Lightweight Broad-Spectrum',   formula: 'Fluid or Lotion', key_ingredients: 'Ceramides, Antioxidants, Niacinamide' },
  sensitive:   { spf: 'SPF 50+', type: 'Mineral Sunscreen',            formula: 'Cream',           key_ingredients: 'Zinc Oxide, Titanium Dioxide, Centella Asiatica' },
  normal:      { spf: 'SPF 50+', type: 'Broad-Spectrum Sunscreen',     formula: 'Any texture',     key_ingredients: 'Avobenzone, Antioxidants, Vitamin E' },
};

// ── Skincare routine recommendations ─────────────────────────
const SKINCARE_MAP = {
  dry: {
    morning: ['คลีนเซอร์ครีมอ่อนโยน', 'โทนเนอร์เพิ่มความชุ่มชื้น', 'เซรั่ม Vitamin C', 'มอยส์เจอไรเซอร์เนื้อเข้มข้น', 'กันแดด SPF 50+'],
    evening: ['คลีนเซอร์น้ำมัน (Double Cleanse)', 'คลีนเซอร์โฟมอ่อนโยน', 'เอสเซนส์หรือโทนเนอร์เพิ่มความชุ่มชื้น', 'เซรั่ม Retinol (2–3 ครั้ง/สัปดาห์)', 'สลีปปิ้งมาสก์หรือไนท์ครีมเนื้อเข้มข้น'],
    weekly:  ['ชีทมาสก์เพิ่มความชุ่มชื้น', 'เอนไซม์เอ็กซ์โฟเลียนท์อ่อนโยน'],
    avoid:   ['โทนเนอร์ที่มีส่วนผสมแอลกอฮอล์', 'เอ็กซ์โฟเลียทมากเกินไป', 'ล้างหน้าด้วยน้ำร้อน'],
  },
  oily: {
    morning: ['คลีนเซอร์โฟมหรือเจล', 'โทนเนอร์ปรับสมดุล (Niacinamide)', 'เซรั่มน้ำหนักเบา', 'มอยส์เจอไรเซอร์ Oil-Free', 'กันแดดแมต SPF 50+'],
    evening: ['ไมเซลลาร์วอเตอร์ + คลีนเซอร์โฟม', 'โทนเนอร์ BHA (2 ครั้ง/สัปดาห์)', 'เซรั่ม Niacinamide', 'มอยส์เจอไรเซอร์เนื้อเจล'],
    weekly:  ['เคลย์มาสก์', 'BHA Peel Pad'],
    avoid:   ['น้ำมันเนื้อหนัก', 'ส่วนผสมที่อุดรูขุมขน (Comedogenic)', 'ข้ามขั้นตอนมอยส์เจอไรเซอร์'],
  },
  combination: {
    morning: ['คลีนเซอร์เจลอ่อนโยน', 'โทนเนอร์ปรับสมดุล', 'เซรั่มน้ำหนักเบา', 'มอยส์เจอไรเซอร์แยกโซน', 'กันแดด SPF 50+'],
    evening: ['Double Cleanse', 'เอสเซนส์เพิ่มความชุ่มชื้น', 'เซรั่มเฉพาะจุด', 'มอยส์เจอไรเซอร์น้ำหนักเบา'],
    weekly:  ['เคลย์มาสก์บริเวณ T-Zone', 'ไฮเดรติ้งมาสก์บริเวณที่แห้ง'],
    avoid:   ['ใช้ผลิตภัณฑ์เดียวกันทั้งหน้าโดยไม่แยกโซน'],
  },
  sensitive: {
    morning: ['ไมเซลลาร์วอเตอร์หรือคลีนเซอร์ครีมที่ปราศจากน้ำหอม', 'โทนเนอร์ Centella ช่วยปลอบประโลม', 'เซรั่มซ่อมแซมผิว (Barrier Repair)', 'กันแดดมิเนอรัล SPF 50+'],
    evening: ['คลีนเซอร์ครีมอ่อนโยน', 'เอสเซนส์ปลอบประโลม', 'เซรั่ม Peptide หรือ Ceramide', 'มอยส์เจอไรเซอร์ปลอบประโลมเนื้อเข้มข้น'],
    weekly:  ['มาสก์ปลอบประโลมที่มีส่วนผสมว่านหางจระเข้หรือ Centella'],
    avoid:   ['น้ำหอม', 'สารออกฤทธิ์แรงที่ไม่ได้ทดสอบก่อน', 'สครับเนื้อหยาบ'],
  },
  normal: {
    morning: ['คลีนเซอร์อ่อนโยน', 'โทนเนอร์ต้านอนุมูลอิสระ', 'เซรั่ม Vitamin C', 'มอยส์เจอไรเซอร์', 'กันแดด SPF 50+'],
    evening: ['Double Cleanse', 'โทนเนอร์ AHA เอ็กซ์โฟเลียท (2–3 ครั้ง/สัปดาห์)', 'เซรั่ม Retinol หรือ Peptide', 'มอยส์เจอไรเซอร์'],
    weekly:  ['ไบรท์เทนนิ่งมาสก์', 'เอ็กซ์โฟเลียทเบาๆ'],
    avoid:   ['ละเว้นกันแดด', 'ไม่ใส่ใจความชุ่มชื้น'],
  },
};

// ── Beauty style recommendations ──────────────────────────────
function getBeautyStyle(skinTone, undertone, faceShape) {
  const styles = [];

  // Face shape based styles
  const shapeStyles = {
    oval:      ['Natural Glam', 'Soft Glam', 'Clean Girl', 'Korean Beauty', 'Classic'],
    round:     ['Sculpted Glam', 'Angular Liner', 'Bold Brow', 'Defined Cheekbone'],
    square:    ['Soft Glam', 'Blended Contour', 'Rounded Features', 'Korean Beauty'],
    heart:     ['Clean Girl', 'Soft Glam', 'Natural Beauty', 'Peachy Fresh'],
    diamond:   ['Natural Glam', 'Defined Eyes', 'Soft Focus', 'Ethereal'],
    rectangle: ['Rounded Glam', 'Soft Contour', 'Korean Beauty', 'No-Makeup Makeup'],
    oblong:    ['Bold Brow', 'Wide Liner', 'Soft Glam', 'Natural Beauty'],
  };

  // Undertone based styles
  const undertoneStyles = {
    warm:    ['Golden Hour', 'Sun-Kissed', 'Warm Glam', 'Earthy Tones'],
    cool:    ['Icy Glam', 'Rosy Flush', 'Classic Hollywood', 'Cool Girl'],
    neutral: ['Versatile Glam', 'Editorial', 'Minimalist Chic', 'Clean Girl'],
  };

  const shapeList = shapeStyles[faceShape] || ['Natural Glam'];
  const undertoneList = undertoneStyles[undertone] || ['Versatile Glam'];

  // Return 2 from each
  return [...shapeList.slice(0, 2), ...undertoneList.slice(0, 2)];
}

// ── Face shape makeup tips ────────────────────────────────────
const FACE_SHAPE_TIPS = {
  oval: {
    contour: 'ไม่จำเป็นต้องคอนทัวร์มาก — ใบหน้าของคุณมีสัดส่วนที่สมดุลอยู่แล้ว',
    highlight: 'ไฮไลต์บริเวณสันคิ้ว หัวตาด้านใน และปากสองชั้น',
    blush: 'ปัดบลัชที่ลูกแก้มแล้วกวาดขึ้นไปหาขมับ',
    tips: 'ใบหน้ารูปไข่เข้ากับเกือบทุกสไตล์การแต่งหน้า ลองได้เลย!',
  },
  round: {
    contour: 'คอนทัวร์ขมับและกราม ใช้บรอนเซอร์ปัดกลางหน้าผากเพื่อให้ใบหน้าดูยาวขึ้น',
    highlight: 'ไฮไลต์กลางหน้าผากและคางเพื่อยืดใบหน้า',
    blush: 'ปัดบลัชจากหูเฉียงเข้าหาจมูกเพื่อเพิ่มมิติ',
    tips: 'อายแมคอัพแนวยาวและคิ้วที่ชัดเจนช่วยให้ใบหน้าดูมีโครงสร้างมากขึ้น',
  },
  square: {
    contour: 'คอนทัวร์มุมหน้าผากและกรามให้ดูนุ่มนวล เบลนด์ให้เรียบที่ขมับ',
    highlight: 'ไฮไลต์กลางใบหน้า: หน้าผาก สันจมูก คาง',
    blush: 'ปัดบลัชวนเป็นวงกลมที่กลางแก้มเพื่อความนุ่มนวล',
    tips: 'อายแชโดว์ทรงโค้งมนและคิ้วโค้งอ่อนๆ เข้ากับใบหน้าสี่เหลี่ยมได้สวย',
  },
  heart: {
    contour: 'คอนทัวร์ข้างหน้าผากและขมับ เพิ่มคอนทัวร์เล็กน้อยที่ปลายคาง',
    highlight: 'ไฮไลต์โหนกแก้มและกรามเพื่อเพิ่มความกว้างให้ครึ่งล่าง',
    blush: 'ปัดบลัชใต้โหนกแก้มแล้วกวาดลงเล็กน้อย',
    tips: 'เน้นอายแมคอัพที่ขนตาล่างเพื่อสร้างสมดุลกับหน้าผากที่กว้าง',
  },
  diamond: {
    contour: 'คอนทัวร์ขมับและกรามเพื่อเพิ่มความกว้างเล็กน้อย',
    highlight: 'ไฮไลต์กลางหน้าผากและคางเพื่อเพิ่มความกว้างในส่วนนั้น',
    blush: 'ปัดบลัชบนโหนกแก้มแนวนอนเพื่อเน้นความกว้าง',
    tips: 'อายไลเนอร์แบบ Cat-eye และโหนกแก้มที่ชัดเจนดูสวยมากบนใบหน้ารูปเพชร',
  },
  rectangle: {
    contour: 'คอนทัวร์บนสุดของหน้าผากและกรามเพื่อให้ใบหน้าดูสั้นลง',
    highlight: 'ไฮไลต์โหนกแก้มแนวนอนเพื่อเพิ่มความกว้าง',
    blush: 'ปัดบลัชแนวนอนทั่วแก้มเพื่อเพิ่มความกว้างทางสายตา',
    tips: 'ผมปัดข้างและอายแมคอัพแนวนอนช่วยสร้างสมดุลให้ใบหน้ายาว',
  },
  oblong: {
    contour: 'คอนทัวร์บนสุดหน้าผากและคางเพื่อให้ดูสั้นลง เพิ่มที่ขมับ',
    highlight: 'ไฮไลต์โหนกแก้มเพื่อเพิ่มความกว้าง',
    blush: 'ปัดบลัชแนวนอนเพื่อเพิ่มความกว้างให้กลางใบหน้า',
    tips: 'คิ้วหนาและอายแมคอัพแนวนอนช่วยสร้างสมดุลให้ใบหน้ายาว',
  },
};

// ── Main recommendation generator ────────────────────────────

/**
 * Generate a complete cosmetic recommendation
 * @param {{ skinTone, undertone, faceShape, skinType }} analysisResult
 * @returns {object} Full recommendation object
 */
function generateRecommendation(analysisResult) {
  const { skinTone, undertone, faceShape, skinType } = analysisResult;

  const st = skinTone || 'medium';
  const ut = undertone || 'neutral';
  const fs = faceShape || 'oval';
  const skt = skinType || 'normal';

  const foundation = FOUNDATION_MAP[st]?.[ut] || FOUNDATION_MAP.medium.neutral;
  const cushion = CUSHION_MAP[skt] || CUSHION_MAP.normal;

  const lipColors = LIP_MAP[st]?.[ut] || LIP_MAP.medium.neutral;
  const blushData = BLUSH_MAP[st] || BLUSH_MAP.medium;
  const blushColor = ut === 'warm' ? blushData.warm : ut === 'cool' ? blushData.cool : blushData.neutral;
  const blushName  = ut === 'warm' ? blushData.warmName : ut === 'cool' ? blushData.coolName : blushData.neutralName;

  const eyeshadow = EYESHADOW_MAP[ut] || EYESHADOW_MAP.neutral;
  const eyebrow = EYEBROW_MAP[st]?.[ut] || EYEBROW_MAP.medium.neutral;
  const sunscreen = SUNSCREEN_MAP[skt] || SUNSCREEN_MAP.normal;
  const skincare = SKINCARE_MAP[skt] || SKINCARE_MAP.normal;
  const beautyStyles = getBeautyStyle(st, ut, fs);
  const faceShapeTips = FACE_SHAPE_TIPS[fs] || FACE_SHAPE_TIPS.oval;

  return {
    foundation: {
      ...foundation,
      skinTone: st,
      undertone: ut,
    },
    cushion: {
      ...cushion,
      skinType: skt,
    },
    lipstick: {
      colors: lipColors,
      recommendation: `ลิปสีที่เหมาะกับอันเดอร์โทน${ut === 'warm' ? 'วอร์ม' : ut === 'cool' ? 'คูล' : 'นิวทรัล'} — ${lipColors[0].name} หรือ ${lipColors[1].name}`,
    },
    blush: {
      color: blushColor,
      name: blushName,
      application: FACE_SHAPE_TIPS[fs]?.blush || 'ปัดบลัชที่ลูกแก้มแล้วเบลนด์ขึ้น',
    },
    eyeshadow: {
      palettes: eyeshadow.palettes,
      colors: eyeshadow.colors,
      tips: eyeshadow.tips,
    },
    eyebrow: {
      shade: eyebrow,
      tips: 'เลือกสีคิ้วใกล้เคียงกับสีผม — อ่อนกว่าหนึ่งเฉดเพื่อความเป็นธรรมชาติ',
    },
    sunscreen: sunscreen,
    skincare: skincare,
    beautyStyles: beautyStyles,
    faceShapeTips: faceShapeTips,
    description: `แนะนำสำหรับผิว${st === 'fair' ? 'ขาวมาก' : st === 'light' ? 'ขาว' : st === 'medium' ? 'สองสี' : st === 'tan' ? 'แทน' : 'เข้ม'} อันเดอร์โทน${ut === 'warm' ? 'วอร์ม' : ut === 'cool' ? 'คูล' : 'นิวทรัล'} รูปทรงใบหน้า${fs === 'oval' ? 'ไข่' : fs === 'round' ? 'กลม' : fs === 'square' ? 'สี่เหลี่ยม' : fs === 'heart' ? 'หัวใจ' : fs === 'diamond' ? 'เพชร' : fs === 'rectangle' ? 'สี่เหลี่ยมผืนผ้า' : 'ยาว'} และผิว${skt === 'dry' ? 'แห้ง' : skt === 'oily' ? 'มัน' : skt === 'combination' ? 'ผสม' : skt === 'sensitive' ? 'บอบบาง' : 'ปกติ'}`,
  };
}

export {
  generateRecommendation,
  FOUNDATION_MAP,
  LIP_MAP,
  BLUSH_MAP,
  EYESHADOW_MAP,
  EYEBROW_MAP,
  SUNSCREEN_MAP,
  SKINCARE_MAP,
  FACE_SHAPE_TIPS,
};
