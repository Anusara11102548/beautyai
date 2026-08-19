BeautyAI

BeautyAI คือเว็บแอปพลิเคชัน Personal Beauty Advisor ที่ช่วยวิเคราะห์ลักษณะใบหน้าและแนะนำผลิตภัณฑ์เครื่องสำอางให้เหมาะกับผู้ใช้ โดยผู้ใช้สามารถอัปโหลดรูปภาพเพื่อรับผลการวิเคราะห์ เช่น สีผิว (Skin Tone), โทนผิว (Undertone), รูปหน้า (Face Shape) และสภาพผิว (Skin Type) พร้อมดูคำแนะนำผลิตภัณฑ์และประวัติการวิเคราะห์ย้อนหลัง

Features

สมัครสมาชิกและเข้าสู่ระบบ

จัดการข้อมูลโปรไฟล์ผู้ใช้

อัปโหลดรูปภาพสำหรับการวิเคราะห์ใบหน้า

วิเคราะห์ข้อมูลจากภาพด้วย Local Image Analysis

วิเคราะห์ Skin Tone และ Undertone

ประเมิน Face Shape และ Skin Type

ตรวจสอบคุณภาพและแสงของภาพ

แนะนำผลิตภัณฑ์เครื่องสำอาง เช่น

Foundation

Cushion

Lipstick

Blush

Eyeshadow

Eyebrow

Sunscreen

Skincare

บันทึกและดูประวัติการวิเคราะห์

จัดเก็บข้อมูลผู้ใช้และผลการวิเคราะห์ด้วย Supabase

มีระบบ Row Level Security (RLS) เพื่อจำกัดการเข้าถึงข้อมูลของผู้ใช้

Technologies

HTML5 — โครงสร้างหน้าเว็บไซต์

CSS3 — การออกแบบและ Responsive UI

JavaScript (ES Modules) — Logic และการทำงานของระบบ

Supabase — Authentication และ Database

Canvas API — ประมวลผลข้อมูล Pixel จากรูปภาพ

Web Crypto API — สร้าง SHA-256 hash สำหรับรูปภาพ

Google Fonts — Lora และ Raleway

Project Structure

beautyai-main/
├── assets/
│   └── css/
│       └── custom.css
├── components/
│   ├── navbar.js
│   └── sidebar.js
├── design-system/
│   └── beautyai/
│       └── MASTER.md
├── js/
│   ├── ai-service.js
│   ├── auth.js
│   ├── face-analysis.js
│   ├── history.js
│   ├── profile.js
│   ├── recommendation.js
│   ├── supabase.js
│   ├── toast.js
│   ├── upload.js
│   └── validation.js
├── supabase/
│   ├── schema.sql
│   └── storage-policies.sql
├── index.html
├── login.html
├── register.html
├── forgot-password.html
├── dashboard.html
├── face-analysis.html
├── cosmetic-recommendation.html
├── history.html
└── profile.html

Main Pages

Page

Description

index.html

หน้าแรกและแนะนำ BeautyAI

login.html

เข้าสู่ระบบ

register.html

สมัครสมาชิก

forgot-password.html

ขอเปลี่ยนรหัสผ่าน

dashboard.html

หน้าหลักหลังเข้าสู่ระบบ

face-analysis.html

อัปโหลดรูปและวิเคราะห์ใบหน้า

cosmetic-recommendation.html

แสดงคำแนะนำเครื่องสำอาง

history.html

ดูประวัติการวิเคราะห์

profile.html

จัดการโปรไฟล์

How the Analysis Works

BeautyAI ใช้การวิเคราะห์ภาพภายใน Browser โดยไม่จำเป็นต้องเรียกใช้ AI API ภายนอก

รับรูปภาพจากผู้ใช้

สร้าง SHA-256 hash ของไฟล์เพื่อใช้เป็นตัวระบุรูปภาพ

ปรับขนาดรูปภาพให้เหมาะสมก่อนประมวลผล

ใช้ Canvas API อ่านข้อมูล Pixel บริเวณส่วนกลางของภาพ

คำนวณค่า RGB, Brightness และ Variance

นำค่าที่ได้ไปประเมิน Skin Tone, Undertone และ Skin Type

ใช้ค่า Hash เพื่อสร้างผล Face Shape แบบ deterministic

ตรวจสอบคุณภาพและสภาพแสงของภาพ

นำผลการวิเคราะห์ไปใช้สร้างคำแนะนำเครื่องสำอาง

บันทึกผลลัพธ์และประวัติลงใน Supabase

หมายเหตุ: ระบบวิเคราะห์ในโปรเจกต์นี้เป็น Local Image Analysis ที่อาศัยการประมวลผล Pixel และกฎที่กำหนดไว้ใน JavaScript ไม่ใช่โมเดล Computer Vision/AI ที่ตรวจจับใบหน้าแบบเต็มรูปแบบ ดังนั้นผลลัพธ์เป็นการประเมินเบื้องต้นและไม่ควรใช้แทนคำแนะนำจากผู้เชี่ยวชาญ

Database

โปรเจกต์ใช้ Supabase โดยมีตารางหลักดังนี้

users

เก็บข้อมูลโปรไฟล์ของผู้ใช้ เช่น username, email และรูปโปรไฟล์

face_analysis

เก็บผลการวิเคราะห์ใบหน้า ได้แก่

Skin Tone

Undertone

Face Shape

Skin Type

Beauty Style

Analysis Status

Recommendation Result

cosmetic_recommendations

เก็บคำแนะนำผลิตภัณฑ์เครื่องสำอางที่สัมพันธ์กับผลการวิเคราะห์

ระบบมีการเปิดใช้ Row Level Security (RLS) เพื่อให้ผู้ใช้สามารถเข้าถึงข้อมูลของตนเองตามสิทธิ์ที่กำหนด

Setup

1. Clone หรือดาวน์โหลดโปรเจกต์

git clone <repository-url>
cd beautyai-main

2. ตั้งค่า Supabase

สร้างโปรเจกต์บน Supabase จากนั้นตั้งค่าฐานข้อมูลโดยนำไฟล์ต่อไปนี้ไปรันใน Supabase SQL Editor

supabase/schema.sql
supabase/storage-policies.sql

3. ตรวจสอบ Supabase Configuration

ไฟล์สำหรับเชื่อมต่อ Supabase อยู่ที่

js/supabase.js

หากนำโปรเจกต์ไปใช้กับ Supabase project ใหม่ ให้เปลี่ยน SUPABASE_URL และ SUPABASE_ANON_KEY ให้ตรงกับโปรเจกต์ของตนเอง

4. เปิดเว็บไซต์

เนื่องจากโปรเจกต์ใช้ JavaScript ES Modules แนะนำให้เปิดผ่าน Local Web Server แทนการเปิดไฟล์ HTML โดยตรง

ตัวอย่างด้วย VS Code:

ติดตั้ง Extension Live Server

เปิดโฟลเดอร์ beautyai-main

คลิกขวาที่ index.html

เลือก Open with Live Server

หรือใช้ Python:

python -m http.server 8000

จากนั้นเปิด:

http://localhost:8000

Design System

BeautyAI ใช้แนวทางการออกแบบ Soft UI Evolution โดยมีโทนสีหลักเป็นชมพูและม่วงอ่อน เพื่อให้ภาพลักษณ์สอดคล้องกับ Beauty / Wellness

Primary: #EC4899

Secondary: #F9A8D4

CTA: #8B5CF6

Background: #FDF2F8

Text: #831843

ฟอนต์หลัก:

Lora — Heading

Raleway — Body

รายละเอียดเพิ่มเติมอยู่ใน:

design-system/beautyai/MASTER.md

Security

ใช้ Supabase Authentication สำหรับการจัดการบัญชีผู้ใช้

ใช้ Row Level Security (RLS) สำหรับจำกัดการเข้าถึงข้อมูล

ใช้ Session persistence และ Auto Refresh Token

มีระบบ Validation สำหรับข้อมูลที่ผู้ใช้กรอก

ควรใช้เฉพาะ Supabase key ที่ออกแบบมาสำหรับฝั่ง Client และไม่ควรนำ service_role key ไปไว้ใน Frontend

Limitations

การวิเคราะห์ใบหน้าเป็นการประเมินจาก Pixel และกฎที่กำหนดไว้ ไม่ใช่การตรวจจับใบหน้าด้วยโมเดล AI ขั้นสูง

Face Shape ไม่ได้ถูกตรวจจับจากจุด landmark ของใบหน้าโดยตรง

ผล Skin Tone และ Skin Type อาจเปลี่ยนแปลงตามแสง สีของภาพ และคุณภาพของรูป

ระบบควรใช้เป็นเครื่องมือช่วยแนะนำเบื้องต้น ไม่ใช่การวินิจฉัยสภาพผิวทางการแพทย์

Future Improvements

เพิ่ม Face Detection และ Facial Landmark Model

เพิ่ม AI Model สำหรับวิเคราะห์ผิวที่แม่นยำขึ้น

เพิ่มระบบ Personalized Recommendation จากประวัติการใช้งาน

เพิ่มการให้คะแนนและ Feedback จากผู้ใช้

เพิ่มฐานข้อมูลผลิตภัณฑ์จริงและข้อมูลส่วนผสม

เพิ่มระบบค้นหาและเปรียบเทียบผลิตภัณฑ์

เพิ่มระบบ Recommendation ที่เรียนรู้จากพฤติกรรมของผู้ใช้

License

โปรเจกต์นี้จัดทำขึ้นเพื่อการศึกษาและการพัฒนาโปรเจกต์ BeautyAI
