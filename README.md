# Iroh CDN - Self-Hosted Decentralized CDN

ระบบ CDN แบบกระจายศูนย์ (Decentralized) ที่ใช้ **Iroh v0.28.0** สำหรับจัดเก็บไฟล์แบบ P2P (Peer-to-Peer) พร้อม Content Addressing

## 🎯 โปรเจคนี้ทำงานยังไง?

### สถาปัตยกรรมระบบ (Architecture)

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Browser   │ ───> │   Next.js   │ ───> │   NestJS    │
│   (User)    │      │  (Web UI)   │      │    (API)    │
└─────────────┘      └─────────────┘      └─────────────┘
                                                  │
                                                  ├──> PostgreSQL
                                                  │    (Metadata)
                                                  │
                                                  └──> Iroh Node
                                                       (P2P Storage)
```

### กระบวนการทำงาน

#### 1. **อัปโหลดไฟล์:**
```
User เลือกไฟล์ → Web UI (Next.js port 5555)
                     ↓
                 POST /assets (multipart/form-data)
                     ↓
                 API (NestJS port 6666) รับไฟล์
                     ↓
                 เรียก: iroh --start blobs add <file>
                     ↓
                 Iroh สร้าง Content Hash (เช่น ry6q4a...)
                     ↓
                 บันทึก metadata ใน PostgreSQL:
                 - id, cid (hash), filename, mime, size
                     ↓
                 ลบไฟล์ชั่วคราว
                     ↓
                 Return { cid, asset } ← ผู้ใช้ได้ hash กลับมา
```

#### 2. **ดาวน์โหลดไฟล์:**
```
User คลิก "ดาวน์โหลด" → GET /assets/:cid/content
                            ↓
                        API หา metadata จาก DB
                            ↓
                        เรียก: iroh --start blobs export <cid> STDOUT
                            ↓
                        Iroh stream ไฟล์จาก P2P network
                            ↓
                        API ส่ง stream กลับไปยัง browser
                            ↓
                        User ได้ไฟล์ดาวน์โหลด
```

#### 3. **ลบไฟล์:**
```
User คลิก "ลบ" → DELETE /assets/:id
                      ↓
                  ลบ metadata จาก PostgreSQL
                      ↓
                  (ข้อมูลใน Iroh ยังอยู่ แต่ไม่มี metadata อ้างอิง)
```

## 🚀 Quick Start

### ติดตั้งและรัน

```bash
# 1. Clone project
git clone <repo-url>
cd iroh-cdn

# 2. Start ทุก service ด้วย Docker Compose
docker-compose up --build

# 3. เปิดใช้งาน
# - Web UI: http://localhost:5555
# - API: http://localhost:6666
# - Database: postgresql://localhost:5432/irohcdn
```

### การใช้งาน

1. **อัปโหลด:** เปิด http://localhost:5555 → คลิก "เลือกไฟล์" → เลือกไฟล์
2. **ดาวน์โหลด:** คลิกปุ่ม "ดาวน์โหลด" (สีเขียว) ที่ไฟล์ที่ต้องการ
3. **ลบ:** คลิกปุ่ม "ลบ" (สีแดง)

## 📦 Services

| Service | Technology | Port | คำอธิบาย |
|---------|-----------|------|----------|
| **web** | Next.js 15 + Tailwind | 5555 | UI สำหรับอัปโหลด/ดาวน์โหลดไฟล์ |
| **api** | NestJS + Prisma + Iroh | 6666 | REST API และ Iroh integration |
| **db** | PostgreSQL 16 | 5432 | เก็บ metadata ของไฟล์ |

## 🔧 เทคโนโลยีที่ใช้

### Backend (API)
- **NestJS** - Framework สำหรับ Node.js
- **Prisma** - ORM สำหรับจัดการ Database
- **Iroh v0.28.0** - P2P storage และ content addressing
- **PostgreSQL** - Database สำหรับ metadata
- **Multer** - File upload middleware

### Frontend (Web)
- **Next.js 15** - React framework (App Router)
- **Tailwind CSS** - Styling
- **TypeScript** - Type safety

### Infrastructure
- **Docker + Docker Compose** - Containerization
- **Rust** - สำหรับ build Iroh binary

## 📊 ขนาดไฟล์สูงสุด

### ปัจจุบัน
```typescript
// api/src/modules/assets/assets.controller.ts
limits: { fileSize: 1024 * 1024 * 1024 } // 1GB
```

### การอัปโหลดไฟล์ 10GB

**ตอบ: ได้ครับ!** แต่ต้องแก้ไข 3 จุด:

#### 1. แก้ไข API Limit
```typescript
// api/src/modules/assets/assets.controller.ts
@UseInterceptors(FileInterceptor('file', {
  storage: diskStorage({ destination: '/tmp', filename: filenameFn }),
  limits: { fileSize: 10 * 1024 * 1024 * 1024 } // 10GB
}))
```

#### 2. แก้ไข NGINX (ถ้ามี)
```nginx
# nginx.conf
client_max_body_size 10G;
```

#### 3. แก้ไข Docker Volume Space
ตรวจสอบว่า Docker มี disk space เพียงพอ:
- `/tmp` ต้องมีพื้นที่อย่างน้อย 10GB
- Iroh data directory ต้องมีพื้นที่เก็บไฟล์

#### 4. พิจารณาเพิ่ม (Recommended)
```typescript
// เพิ่ม timeout สำหรับไฟล์ใหญ่
@UseInterceptors(FileInterceptor('file', {
  storage: diskStorage({ destination: '/tmp', filename: filenameFn }),
  limits: { 
    fileSize: 10 * 1024 * 1024 * 1024, // 10GB
    files: 1 
  }
}))

// เพิ่ม streaming upload แทน buffer ทั้งไฟล์
```

### ข้อควรระวังสำหรับไฟล์ใหญ่

⚠️ **Memory:** Node.js อาจใช้ memory สูงถ้าไฟล์ใหญ่มาก  
⚠️ **Timeout:** อาจต้องเพิ่ม timeout ใน API และ NGINX  
⚠️ **Disk Space:** ตรวจสอบพื้นที่ `/tmp` และ Iroh data directory  
⚠️ **Network:** P2P sync ไฟล์ใหญ่อาจใช้เวลานาน

## 🌐 API Endpoints

| Method | Endpoint | คำอธิบาย |
|--------|----------|----------|
| `POST` | `/assets` | อัปโหลดไฟล์ (multipart/form-data) |
| `GET` | `/assets` | ดูรายการไฟล์ทั้งหมด |
| `GET` | `/assets/:cid` | ดู metadata ของไฟล์ |
| `GET` | `/assets/:cid/content` | ดาวน์โหลดไฟล์ |
| `DELETE` | `/assets/:id` | ลบไฟล์ |

### ตัวอย่าง API Usage

```bash
# อัปโหลด
curl -F "file=@myfile.jpg" http://localhost:4000/assets

# ดูรายการ
curl http://localhost:4000/assets

# ดาวน์โหลด
curl http://localhost:4000/assets/ry6q4a.../content -o downloaded.jpg

# ลบ
curl -X DELETE http://localhost:4000/assets/cmhlo...
```

## 🔑 Environment Variables

```bash
# Database
DATABASE_URL=postgresql://postgres:password@db:5432/irohcdn

# API
IROH_BIN=iroh                    # Path to iroh binary

# Web
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

## 🏗️ โครงสร้างโปรเจค

```
iroh-cdn/
├── api/                        # Backend (NestJS)
│   ├── prisma/
│   │   └── schema.prisma      # Database schema
│   ├── src/
│   │   ├── main.ts            # Entry point
│   │   ├── modules/
│   │   │   ├── app.module.ts
│   │   │   └── assets/
│   │   │       ├── assets.controller.ts  # REST endpoints
│   │   │       ├── assets.service.ts     # Business logic
│   │   │       ├── assets.module.ts
│   │   │       └── iroh.ts               # Iroh integration
│   │   └── shared/
│   │       └── prisma.service.ts
│   ├── Dockerfile             # Build Iroh + NestJS
│   └── docker-entrypoint.sh
├── web/                        # Frontend (Next.js)
│   ├── app/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   └── Uploader.tsx       # Upload/Download UI
│   ├── styles/
│   │   └── globals.css
│   └── Dockerfile
├── docker-compose.yml          # Orchestration
└── README.md
```

## 🛠️ Development

### Local Development

```bash
# API
cd api
npm install
npx prisma migrate dev
npm run start:dev

# Web
cd web
npm install
npm run dev
```

### สร้าง Migration ใหม่

```bash
docker-compose exec api npx prisma migrate dev --name your_migration_name
```

### ดู Database

```bash
docker-compose exec db psql -U postgres -d irohcdn
```

## 📝 Iroh Integration Details

### Iroh v0.28.0 Commands

```bash
# เพิ่มไฟล์
iroh --start blobs add <file>
# Output: Blob: ry6q4a5suvtj... (blob hash)

# Export ไฟล์
iroh --start blobs export <hash> STDOUT
# Output: file content to stdout

# List blobs
iroh --start blobs blobs

# ดู node info
iroh node info
```

### Content Addressing

- ทุกไฟล์มี **unique hash** (CID) ที่สร้างจากเนื้อหาไฟล์
- Hash เดียวกัน = ไฟล์เดียวกัน (deduplication)
- ไฟล์เปลี่ยน → hash เปลี่ยน
- P2P sharing: ไฟล์แชร์ผ่าน Iroh network

## 🚨 Troubleshooting

### ไฟล์ดาวน์โหลดว่าง (0 bytes)
```bash
# ตรวจสอบ API logs
docker-compose logs api --tail 50

# ตรวจสอบว่า Iroh node ทำงาน
docker-compose exec api iroh --start blobs blobs
```

### Upload ล้มเหลว
```bash
# เช็คขนาดไฟล์ limit
# แก้ใน api/src/modules/assets/assets.controller.ts
limits: { fileSize: 10 * 1024 * 1024 * 1024 } // 10GB
```

### Database connection error
```bash
# Restart database
docker-compose restart db

# Reset database
docker-compose exec api npx prisma migrate reset
```

## 📄 License

MIT License

## 🙏 Credits

- [Iroh](https://github.com/n0-computer/iroh) - P2P networking and content addressing
- [NestJS](https://nestjs.com/) - Progressive Node.js framework
- [Next.js](https://nextjs.org/) - React framework
- [Prisma](https://www.prisma.io/) - Next-generation ORM
