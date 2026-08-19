## วิธีรัน

โปรเจกต์นี้เป็นเว็บแอปพลิเคชันที่พัฒนาด้วย HTML, CSS และ JavaScript โดยใช้ Supabase สำหรับ Authentication และ Database

สามารถรันโปรเจกต์ผ่าน Local Web Server ได้ เช่น **Live Server ใน VS Code** หรือ Python

```bash
python -m http.server 8000
```

จากนั้นเปิดเว็บไซต์ที่

```text
http://localhost:8000
```

ก่อนใช้งานระบบต้องตั้งค่า Supabase ในไฟล์

```text
js/supabase.js
```

และนำ SQL ใน

```text
supabase/schema.sql
supabase/storage-policies.sql
```

ไปสร้าง Database และ Storage Policies ใน Supabase

## การทำงานของระบบ

BeautyAI ทำงานตามลำดับ `Upload Image → Validation → Upload → Face Analysis → Recommendation → Save Result`

1. ผู้ใช้เลือกและอัปโหลดรูปภาพ
2. ระบบตรวจสอบประเภทและความถูกต้องของไฟล์รูปภาพ
3. อัปโหลดรูปไปยัง Supabase Storage
4. สร้างรายการ `face_analysis` และกำหนดสถานะเป็น `processing`
5. วิเคราะห์รูปภาพด้วย Local Image Analysis
6. ตรวจสอบ Face Detection และประเมินข้อมูล ได้แก่ Skin Tone, Undertone, Face Shape และ Skin Type
7. สร้างคำแนะนำด้านเครื่องสำอางจากผลการวิเคราะห์
8. บันทึกผลการวิเคราะห์และคำแนะนำลงใน Database
9. เปลี่ยนสถานะการวิเคราะห์เป็น `completed`
10. ผู้ใช้สามารถดูผลลัพธ์และประวัติการวิเคราะห์ย้อนหลังได้

## Database Schema

ระบบใช้ Supabase Database โดยแบ่งข้อมูลหลักออกเป็น 3 ตาราง

* `users`: เก็บข้อมูลผู้ใช้ เช่น `id`, `username`, `email`, `profile_image`, `created_at` และ `updated_at`
* `face_analysis`: เก็บผลการวิเคราะห์ เช่น `skin_tone`, `undertone`, `face_shape`, `skin_type`, `beauty_style`, `recommendation_result` และ `analysis_status`
* `cosmetic_recommendations`: เก็บคำแนะนำผลิตภัณฑ์ เช่น `foundation`, `cushion`, `lipstick`, `blush`, `eyeshadow`, `eyebrow`, `sunscreen` และ `skincare`

ตาราง `face_analysis` เชื่อมโยงกับ `users` ผ่าน `user_id` และตาราง `cosmetic_recommendations` เชื่อมโยงกับ `face_analysis` ผ่าน `analysis_id`

## Data Quality

ระบบมีการตรวจสอบข้อมูลก่อนเข้าสู่ขั้นตอนการวิเคราะห์ โดยเฉพาะไฟล์รูปภาพ เช่น ประเภทไฟล์และความถูกต้องของไฟล์

นอกจากนี้ระบบมีการตรวจสอบผลการวิเคราะห์ หากไม่พบใบหน้าในรูปภาพ ระบบจะไม่บันทึกผลเป็นข้อมูลที่สำเร็จ แต่จะเปลี่ยน `analysis_status` เป็น `failed` และแจ้งให้ผู้ใช้เลือกรูปภาพใหม่ที่มีความชัดเจนและมีแสงเพียงพอ

## Image Analysis

BeautyAI ใช้ **Local Image Analysis** โดยไม่ต้องใช้ API Key หรือ AI API ภายนอก

ระบบประมวลผลข้อมูลจากรูปภาพด้วย **Canvas API** โดยวิเคราะห์ข้อมูล Pixel บริเวณกึ่งกลางของภาพ แล้วนำค่า RGB, Brightness และ Variance มาใช้ในการประเมินลักษณะต่าง ๆ

ผลลัพธ์ที่ได้ประกอบด้วย

* `Skin Tone`
* `Undertone`
* `Face Shape`
* `Skin Type`
* `Image Quality`
* `Lighting Quality`

ระบบยังใช้ **SHA-256 Hash** กับไฟล์รูปภาพเพื่อให้รูปภาพเดียวกันสามารถระบุผลการวิเคราะห์เดิมได้อย่างสม่ำเสมอ

## Security

ระบบใช้ **Supabase Authentication** สำหรับจัดการบัญชีผู้ใช้และ Session

สำหรับการป้องกันข้อมูล ระบบเปิดใช้งาน **Row Level Security (RLS)** กับตารางหลัก เพื่อให้ผู้ใช้สามารถเข้าถึงข้อมูลที่เป็นของตนเองเท่านั้น

ตัวอย่างเช่น ผู้ใช้สามารถดูหรือแก้ไขข้อมูลใน `face_analysis` ที่มี `user_id` ตรงกับบัญชีที่กำลังเข้าสู่ระบบ และไม่สามารถเข้าถึงข้อมูลของผู้ใช้อื่นได้

## Recommendation

หลังจากวิเคราะห์ใบหน้า ระบบจะนำข้อมูล

`Skin Tone + Undertone + Face Shape + Skin Type`

ไปใช้สร้างคำแนะนำด้าน Beauty และ Cosmetic โดยผลลัพธ์จะถูกจัดเก็บใน `cosmetic_recommendations`

ประเภทคำแนะนำประกอบด้วย

* Foundation
* Cushion
* Lipstick
* Blush
* Eyeshadow
* Eyebrow
* Sunscreen
* Skincare

## Idempotency / Analysis History

ระบบใช้ **SHA-256 Hash ของรูปภาพ** เพื่อสร้างตัวระบุที่คงที่สำหรับไฟล์เดียวกัน ทำให้สามารถตรวจสอบผลการวิเคราะห์เดิมของรูปภาพได้

ผลการวิเคราะห์ที่สำเร็จจะถูกบันทึกไว้ใน `face_analysis` และผู้ใช้สามารถเรียกดูประวัติย้อนหลังได้ โดยระบบเรียงข้อมูลจากการวิเคราะห์ล่าสุดไปยังรายการเก่า

หากผู้ใช้ลบประวัติการวิเคราะห์ ระบบจะลบข้อมูล Recommendation ที่เชื่อมโยงกันด้วย `ON DELETE CASCADE` และลบไฟล์รูปภาพจาก Supabase Storage

## Reflection

**Availability มีความสำคัญต่อระบบ BeautyAI เพราะระบบควรสามารถให้บริการผู้ใช้ต่อได้ แม้ว่าการวิเคราะห์รูปภาพบางรายการจะเกิดข้อผิดพลาด**

ระบบจึงแยกสถานะของการวิเคราะห์เป็น `pending`, `processing`, `completed` และ `failed` ทำให้ข้อผิดพลาดของรูปภาพหนึ่งรายการไม่ส่งผลให้ระบบทั้งหมดหยุดทำงาน ผู้ใช้สามารถแก้ไขปัญหาโดยอัปโหลดรูปใหม่ได้ ขณะที่ข้อมูลของการวิเคราะห์รายการอื่นที่สำเร็จแล้วจะยังคงอยู่ในระบบ

แนวทางนี้ช่วยให้ระบบมีความต่อเนื่องในการให้บริการ และสามารถติดตามสถานะของการวิเคราะห์แต่ละรายการได้อย่างชัดเจน

## ข้อจำกัดของระบบ

* การวิเคราะห์เป็น Local Image Analysis ไม่ใช่ AI Model สำหรับ Face Recognition โดยตรง
* ผล Skin Tone อาจได้รับผลกระทบจากแสงและคุณภาพของภาพ
* Face Shape เป็นการประเมินเบื้องต้นและไม่ได้ใช้ Facial Landmark Model
* Skin Type เป็นการประมาณจากข้อมูล Pixel และ Color Variance
* ผลลัพธ์ไม่ควรใช้แทนคำแนะนำจากผู้เชี่ยวชาญด้านผิวหนังหรือความงาม

## ผลการทำงานของระบบ

เมื่อการวิเคราะห์สำเร็จ ระบบจะแสดงข้อมูลผลการวิเคราะห์ให้ผู้ใช้ พร้อมคำแนะนำด้านเครื่องสำอางที่สัมพันธ์กับลักษณะของผู้ใช้

ผลลัพธ์ที่ระบบสามารถแสดงได้ ได้แก่

* **Skin Tone:** Fair / Light / Medium / Tan / Deep
* **Undertone:** Warm / Cool / Neutral
* **Face Shape:** Oval / Round / Square / Heart / Diamond / Rectangle / Oblong
* **Skin Type:** Dry / Oily / Combination / Sensitive / Normal
* **Beauty Style:** สไตล์ที่เหมาะสมกับผลการวิเคราะห์
* **Cosmetic Recommendation:** คำแนะนำ Foundation, Cushion, Lipstick, Blush, Eyeshadow, Eyebrow, Sunscreen และ Skincare

ระบบยังสามารถบันทึกผลการวิเคราะห์และเรียกดูย้อนหลังผ่านหน้า **History** ได้
