# 🌐 Iroh CDN

**Decentralized Content Delivery Network** - อัปโหลดและแชร์ไฟล์ผ่าน P2P network

Stack: **Next.js + NestJS + Iroh + PostgreSQL + Docker**

---

## 🏗️ การทำงาน

```
อัปโหลดไฟล์ → Iroh สร้าง CID (hash) → เก็บ metadata ใน DB
ดาวน์โหลด → หา CID → Iroh stream ไฟล์ → ส่งกลับ browser
ลบ → ลบ metadata จาก database
```

**Content Addressing:** แต่ละไฟล์มี hash (CID) ที่ไม่ซ้ำกัน สร้างจากเนื้อหาไฟล์

---

## 🚀 Quick Start

### คำสั่งเดียวจบ

```bash
docker-compose up --build
```

รอ 2-3 นาที → เสร็จ!

- **Web UI:** http://localhost:5555  
- **API:** http://localhost:6666

### หรือใช้ Script (Windows)

```powershell
.\setup.ps1
```

---

## 💻 การใช้งาน

```bash
docker-compose up -d      # เริ่ม
docker-compose down       # หยุด
docker-compose logs -f    # ดู logs
```

### คุณสมบัติ

✅ **Database สร้างอัตโนมัติ** - ใช้ `prisma db push` ไม่ต้องรัน migration  
✅ **ทำงานได้ทุกเครื่อง** - ย้ายเครื่องรันคำสั่งเดียวก็ใช้ได้  
✅ **Schema sync อัตโนมัติ** - ไม่ต้องมี migration files

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| Frontend  | Next.js 15 + Tailwind CSS |
| Backend   | NestJS + Prisma |
| Storage   | Iroh v0.28.0 (P2P) |
| Database  | PostgreSQL 16 |
| Deploy    | Docker Compose |

---

## 🌐 API Endpoints

```bash
POST   /assets              # Upload file
GET    /assets              # List files
GET    /assets/:cid/content # Download file
DELETE /assets/:id          # Delete file
```

### ตัวอย่าง

```bash
# Upload
curl -F "file=@test.jpg" http://localhost:6666/assets

# List
curl http://localhost:6666/assets

# Download
curl http://localhost:6666/assets/<CID>/content -o download.jpg

# Delete
curl -X DELETE http://localhost:6666/assets/<ID>
```

---

## 📊 ขนาดไฟล์

**Default:** 1GB  
**ปรับได้:** แก้ไข `limits.fileSize` ใน `api/src/modules/assets/assets.controller.ts`

```typescript
limits: { fileSize: 10 * 1024 * 1024 * 1024 } // 10GB
```

---

## 🚨 Troubleshooting

### เริ่มใหม่ทั้งหมด

```bash
docker-compose down -v
docker-compose up --build
```

### ดู Logs

```bash
docker-compose logs -f api
```

### ตรวจสอบ Database

```bash
docker-compose exec db psql -U iroh -d irohcdn -c '\dt'
```

**หมายเหตุ:** Database สร้างอัตโนมัติโดย entrypoint script

---

## 📁 โครงสร้างโปรเจค

```
iroh-cdn/
├── api/                      # NestJS Backend
│   ├── src/
│   │   └── modules/assets/   # Upload/Download logic
│   ├── prisma/
│   │   └── schema.prisma     # Database schema
│   ├── Dockerfile
│   └── docker-entrypoint.sh  # Auto-setup script
├── web/                      # Next.js Frontend
│   ├── app/
│   └── components/
├── docker-compose.yml
└── setup.ps1                 # Windows setup script
```

---

## 🔑 Environment Variables

สร้างไฟล์ `.env`:

```env
# Database
POSTGRES_USER=iroh
POSTGRES_PASSWORD=iroh
POSTGRES_DB=irohcdn
DATABASE_URL=postgresql://iroh:iroh@db:5432/irohcdn

# Ports
API_PORT=6666
WEB_PORT=5555
POSTGRES_PORT=5432

# API
NEXT_PUBLIC_API_URL=http://localhost:6666
```

---

## 🎯 Features

- ✅ P2P file storage ด้วย Iroh
- ✅ Content addressing (CID/hash)
- ✅ Web UI สำหรับอัปโหลด/ดาวน์โหลด
- ✅ REST API
- ✅ Metadata จัดเก็บใน PostgreSQL
- ✅ Docker Compose (one-command setup)
- ✅ Auto database schema sync

---

## 📝 License

MIT License

Built with [Iroh](https://github.com/n0-computer/iroh) • [NestJS](https://nestjs.com/) • [Next.js](https://nextjs.org/)

