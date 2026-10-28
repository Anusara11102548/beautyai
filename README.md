# BeautyAI — AI Beauty Advisor

BeautyAI เป็นเว็บแอปพลิเคชันสำหรับวิเคราะห์ลักษณะผิวและแนะนำเครื่องสำอางให้เหมาะสมกับผู้ใช้ โดยพัฒนาด้วย HTML, CSS และ JavaScript และใช้ Supabase สำหรับ Authentication, Database และ Storage

**Live Website:** https://beautyai-tau.vercel.app  
**GitHub Repository:** https://github.com/Anusara11102548/beautyai

## Features

- User Authentication สำหรับสมัครสมาชิกและเข้าสู่ระบบ
- อัปโหลดและตรวจสอบไฟล์รูปภาพก่อนการวิเคราะห์
- วิเคราะห์รูปภาพด้วย Local Image Analysis
- ประเมิน Skin Tone, Undertone, Face Shape และ Skin Type
- สร้างคำแนะนำด้านเครื่องสำอางและผลิตภัณฑ์ดูแลผิว
- บันทึกผลการวิเคราะห์ลงใน Supabase Database
- ดูประวัติการวิเคราะห์ย้อนหลังผ่านหน้า History
- จัดการข้อมูลโปรไฟล์ผู้ใช้

## วิธีเข้าใช้งานเว็บไซต์

สามารถเปิดเว็บไซต์ BeautyAI ผ่านเบราว์เซอร์ได้จากลิงก์:

https://beautyai-tau.vercel.app

เว็บไซต์ที่ Deploy แล้วสามารถเข้าถึงผ่านอินเทอร์เน็ตได้โดยไม่จำเป็นต้องเปิด VS Code หรือรัน Local Web Server บนคอมพิวเตอร์ของผู้ใช้ อย่างไรก็ตาม การทำงานของ Authentication, Database และ Storage ขึ้นอยู่กับการตั้งค่า Supabase และสถานะของบริการที่เกี่ยวข้อง

## วิธีรันโปรเจกต์บนเครื่อง (Local Development)

โปรเจกต์นี้เป็นเว็บแอปพลิเคชันที่พัฒนาด้วย HTML, CSS และ JavaScript สามารถรันผ่าน Local Web Server ได้ เช่น Live Server ใน Visual Studio Code หรือ Python HTTP Server

### วิธีที่ 1: ใช้ Live Server ใน VS Code

1. เปิดโฟลเดอร์โปรเจกต์ด้วย Visual Studio Code
2. ติดตั้ง Extension ชื่อ Live Server หากยังไม่มี
3. คลิกขวาที่ไฟล์ `index.html`
4. เลือก **Open with Live Server**

### วิธีที่ 2: ใช้ Python

เปิด Terminal ในโฟลเดอร์โปรเจกต์ แล้วรันคำสั่ง:

```bash
python -m http.server 8000
```

จากนั้นเปิดเบราว์เซอร์และเข้า:

```text
[http://localhost:8000](https://beautyai-tau.vercel.app)
```

หมายเหตุ: `localhost` ใช้เข้าถึงเว็บไซต์ที่กำลังรันอยู่บนเครื่องของตนเอง ส่วนเว็บไซต์ออนไลน์ให้เข้าใช้งานผ่าน `https://beautyai-tau.vercel.app`

## Supabase Configuration

ก่อนใช้งานระบบที่เชื่อมต่อกับ Supabase ต้องตั้งค่าข้อมูลการเชื่อมต่อในไฟล์:

```text
js/supabase.js
```

ตรวจสอบ Supabase Project URL และ Publishable Key หรือ Anon Key ให้ถูกต้องตามรูปแบบที่โปรเจกต์ใช้งาน

จากนั้นนำ SQL ในไฟล์ต่อไปนี้ไปดำเนินการใน Supabase SQL Editor ตามลำดับและตรวจสอบผลการทำงาน:

```text
supabase/schema.sql
supabase/storage-policies.sql
```

การตั้งค่าให้ครบถ้วนมีความสำคัญต่อ Authentication, Database, Storage และสิทธิ์การเข้าถึงข้อมูล

สำหรับเว็บไซต์ที่ Deploy บน Vercel ต้องตรวจสอบด้วยว่าค่าการเชื่อมต่อที่จำเป็นพร้อมใช้งานใน Production และมีการตั้งค่า Redirect URL หรือ Site URL ของ Supabase ให้ตรงกับโดเมนเว็บไซต์จริง หากระบบ Authentication ต้องใช้การตั้งค่าเหล่านี้

**Security Note:** ห้ามนำ Supabase `service_role` key หรือ Secret Key ไปไว้ใน JavaScript ฝั่ง Client หรือเผยแพร่ใน Repository สาธารณะ และควรตรวจสอบ Row Level Security (RLS) และ Storage Policies ก่อนเปิดให้ผู้ใช้ทั่วไปใช้งาน

## System Workflow

BeautyAI ทำงานตามลำดับดังนี้:

`Upload Image → Validation → Upload → Face Analysis → Recommendation → Save Result`

1. ผู้ใช้เลือกและอัปโหลดรูปภาพ
2. ระบบตรวจสอบประเภทและความถูกต้องของไฟล์รูปภาพ
3. อัปโหลดรูปภาพไปยัง Supabase Storage
4. สร้างรายการ `face_analysis` และกำหนดสถานะเป็น `processing`
5. วิเคราะห์รูปภาพด้วย Local Image Analysis
6. ตรวจสอบ Face Detection และประเมิน Skin Tone, Undertone, Face Shape และ Skin Type
7. สร้างคำแนะนำด้านเครื่องสำอางจากผลการวิเคราะห์
8. บันทึกผลการวิเคราะห์และคำแนะนำลงใน Database
9. เปลี่ยนสถานะการวิเคราะห์เป็น `completed`
10. ผู้ใช้สามารถดูผลลัพธ์และประวัติการวิเคราะห์ย้อนหลังได้

หากการวิเคราะห์ไม่สำเร็จ ระบบจะกำหนดสถานะเป็น `failed` ตามเงื่อนไขที่ระบบรองรับ และแจ้งให้ผู้ใช้ตรวจสอบรูปภาพหรือดำเนินการใหม่

## Database Schema

ระบบใช้ Supabase Database โดยมีตารางข้อมูลหลัก 3 ตาราง

### 1. `users`

จัดเก็บข้อมูลผู้ใช้ เช่น:

- `id`
- `username`
- `email`
- `profile_image`
- `created_at`
- `updated_at`

### 2. `face_analysis`

จัดเก็บผลการวิเคราะห์ใบหน้า เช่น:

- `skin_tone`
- `undertone`
- `face_shape`
- `skin_type`
- `beauty_style`
- `recommendation_result`
- `analysis_status`

### 3. `cosmetic_recommendations`

จัดเก็บคำแนะนำผลิตภัณฑ์ เช่น:

- `foundation`
- `cushion`
- `lipstick`
- `blush`
- `eyeshadow`
- `eyebrow`
- `sunscreen`
- `skincare`

ความสัมพันธ์ของข้อมูล:

- ตาราง `face_analysis` เชื่อมโยงกับ `users` ผ่าน `user_id`
- ตาราง `cosmetic_recommendations` เชื่อมโยงกับ `face_analysis` ผ่าน `analysis_id`

รายละเอียดคอลัมน์และข้อกำหนดของแต่ละตารางให้ยึดตามไฟล์ SQL Schema ของโปรเจกต์

## Data Quality

ระบบตรวจสอบข้อมูลก่อนเข้าสู่ขั้นตอนการวิเคราะห์ โดยเฉพาะไฟล์รูปภาพ เช่น ประเภทไฟล์และความถูกต้องของไฟล์

หากระบบไม่พบใบหน้าในรูปภาพ ระบบจะไม่ถือว่ารายการนั้นเป็นการวิเคราะห์ที่สำเร็จ แต่จะเปลี่ยน `analysis_status` เป็น `failed` และแจ้งให้ผู้ใช้เลือกรูปภาพใหม่ที่มีความชัดเจนและมีแสงเพียงพอ

แนวทางนี้ช่วยลดการบันทึกผลการวิเคราะห์ที่ไม่สมบูรณ์ และทำให้สามารถติดตามสถานะของแต่ละรายการได้

## Image Analysis

BeautyAI ใช้ **Local Image Analysis** โดยประมวลผลรูปภาพภายในเว็บเบราว์เซอร์ผ่าน Canvas API โดยไม่ต้องใช้ API Key หรือ AI API ภายนอกสำหรับขั้นตอนการวิเคราะห์ภาพตามที่ออกแบบไว้

ระบบนำข้อมูล Pixel จากบริเวณกึ่งกลางของภาพมาประมวลผล โดยใช้ค่า RGB, Brightness และ Variance เพื่อประเมินลักษณะต่าง ๆ

ผลลัพธ์ที่ระบบประเมิน ได้แก่:

- `Skin Tone`
- `Undertone`
- `Face Shape`
- `Skin Type`
- `Image Quality`
- `Lighting Quality`

ระบบยังใช้ SHA-256 Hash กับไฟล์รูปภาพ เพื่อสร้างตัวระบุที่คงที่สำหรับการตรวจสอบรูปภาพเดิม

ข้อควรทราบ: การประเมินด้วย Pixel และ Color Variance เป็นการวิเคราะห์เบื้องต้น ไม่ใช่การวินิจฉัยทางการแพทย์หรือการตรวจจับใบหน้าด้วยโมเดล AI เฉพาะทาง

## Security

ระบบใช้ Supabase Authentication สำหรับจัดการบัญชีผู้ใช้และ Session

สำหรับการป้องกันข้อมูล ระบบใช้ Row Level Security (RLS) กับตารางหลัก เพื่อจำกัดการเข้าถึงข้อมูลตามสิทธิ์ที่กำหนด

ตัวอย่างเช่น ผู้ใช้ควรสามารถอ่านหรือแก้ไขข้อมูลใน `face_analysis` ได้เฉพาะรายการที่เชื่อมโยงกับบัญชีของตนเองผ่าน `user_id` ตามนโยบายที่กำหนดไว้

การรักษาความปลอดภัยต้องอาศัยการตั้งค่า RLS, Database Policies และ Storage Policies ที่ถูกต้อง รวมถึงการตรวจสอบสิทธิ์ทุกครั้งที่มีการอ่านหรือแก้ไขข้อมูล

## Recommendation

หลังจากวิเคราะห์รูปภาพ ระบบจะนำข้อมูลต่อไปนี้ไปใช้สร้างคำแนะนำด้าน Beauty และ Cosmetic:

`Skin Tone + Undertone + Face Shape + Skin Type`

ผลลัพธ์จะถูกจัดเก็บใน `cosmetic_recommendations` ตามโครงสร้างที่กำหนดไว้

ประเภทคำแนะนำประกอบด้วย:

- Foundation
- Cushion
- Lipstick
- Blush
- Eyeshadow
- Eyebrow
- Sunscreen
- Skincare

คำแนะนำเป็นข้อมูลเพื่อช่วยเลือกผลิตภัณฑ์เบื้องต้น ไม่ได้รับประกันว่าผลิตภัณฑ์จะเหมาะสมกับทุกคนหรือสามารถแก้ปัญหาผิวได้

## Idempotency and Analysis History

ระบบใช้ SHA-256 Hash ของรูปภาพเพื่อสร้างตัวระบุที่คงที่สำหรับไฟล์เดียวกัน ช่วยให้สามารถตรวจสอบรูปภาพเดิมและผลการวิเคราะห์ที่เกี่ยวข้องได้

ผลการวิเคราะห์จะถูกบันทึกไว้ใน `face_analysis` และผู้ใช้สามารถเรียกดูประวัติย้อนหลังผ่านหน้า History โดยแสดงรายการตามลำดับเวลาที่ระบบจัดเก็บ

หากผู้ใช้ลบประวัติการวิเคราะห์ ระบบออกแบบให้ข้อมูล Recommendation ที่เชื่อมโยงกันสามารถถูกลบตามความสัมพันธ์ `ON DELETE CASCADE` และมีการลบไฟล์ที่เกี่ยวข้องออกจาก Supabase Storage ตามกระบวนการของระบบ

ทั้งนี้ การลบข้อมูลใน Database และ Storage เป็นคนละการดำเนินการ จึงควรตรวจสอบว่ากระบวนการลบไฟล์ทำงานสำเร็จด้วย

## Reflection: Availability

Availability มีความสำคัญต่อ BeautyAI เพราะระบบควรสามารถให้บริการผู้ใช้ต่อไปได้ แม้ว่าการวิเคราะห์รูปภาพบางรายการจะเกิดข้อผิดพลาด

ระบบจึงแยกสถานะการวิเคราะห์เป็น:

- `pending`
- `processing`
- `completed`
- `failed`

การแยกสถานะช่วยให้สามารถติดตามความคืบหน้าของแต่ละรายการได้ และช่วยให้ผู้ใช้ทราบเมื่อการวิเคราะห์ไม่สำเร็จ โดยสามารถแก้ไขปัญหาและอัปโหลดรูปภาพใหม่ได้ตามความเหมาะสม

แนวทางนี้ช่วยลดผลกระทบจากข้อผิดพลาดของรายการใดรายการหนึ่งต่อการใช้งานส่วนอื่นของระบบ

## Limitations

- การวิเคราะห์ใช้ Local Image Analysis ไม่ใช่ AI Model สำหรับ Face Recognition โดยตรง
- ผล Skin Tone อาจได้รับผลกระทบจากแสงและคุณภาพของภาพ
- Face Shape เป็นการประเมินเบื้องต้นและไม่ได้ใช้ Facial Landmark Model
- Skin Type เป็นการประมาณจากข้อมูล Pixel และ Color Variance ไม่ใช่การตรวจสภาพผิวทางการแพทย์
- ผลลัพธ์ไม่ควรใช้แทนคำแนะนำจากแพทย์ผิวหนังหรือผู้เชี่ยวชาญด้านความงาม
- ความพร้อมใช้งานของระบบที่เชื่อมต่อกับ Supabase ขึ้นอยู่กับการตั้งค่าและสถานะของบริการ

## Expected Results

เมื่อการวิเคราะห์สำเร็จ ระบบจะแสดงผลการประเมินลักษณะผิวและใบหน้า พร้อมคำแนะนำด้านเครื่องสำอางตามข้อมูลที่ได้จากการวิเคราะห์

ผลลัพธ์ที่ระบบสามารถแสดงได้ ได้แก่:

| Attribute | Possible Results |
|---|---|
| Skin Tone | Fair / Light / Medium / Tan / Deep |
| Undertone | Warm / Cool / Neutral |
| Face Shape | Oval / Round / Square / Heart / Diamond / Rectangle / Oblong |
| Skin Type | Dry / Oily / Combination / Sensitive / Normal |
| Beauty Style | สไตล์ความงามที่เหมาะสมตามผลการประเมิน |
| Cosmetic Recommendation | Foundation, Cushion, Lipstick, Blush, Eyeshadow, Eyebrow, Sunscreen และ Skincare |

ระบบสามารถบันทึกผลการวิเคราะห์และเรียกดูย้อนหลังผ่านหน้า History ได้ เมื่อการเชื่อมต่อและสิทธิ์การเข้าถึงข้อมูลได้รับการตั้งค่าอย่างถูกต้อง

---

**Project:** BeautyAI — AI Beauty Advisor  
**Technology Stack:** HTML, CSS, JavaScript, Supabase  
**Deployment:** Vercel  
**Live URL:** https://beautyai-tau.vercel.app
