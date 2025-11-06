# 📚 สรุปโปรเจค Iroh CDN

## 🎯 โปรเจคนี้คืออะไร?

**Iroh CDN** เป็นระบบจัดเก็บและแชร์ไฟล์แบบกระจายศูนย์ (Decentralized CDN) ที่ใช้เทคโนโลยี:
- **Iroh P2P Network** - เก็บไฟล์แบบ peer-to-peer
- **Content Addressing** - ทุกไฟล์มี unique hash จากเนื้อหาไฟล์
- **Self-Hosted** - รันบนเซิร์ฟเวอร์ของคุณเอง ไม่ต้องพึ่ง cloud

---

## 🔄 ระบบทำงานยังไง?

### สถาปัตยกรรม (Architecture)

```
┌─────────────────┐
│   คุณ (User)    │
└────────┬────────┘
         │
         ↓ (http://localhost:3000)
┌─────────────────┐
│   Web UI        │  ← Next.js 15 + Tailwind
│  (Frontend)     │    ส่วนที่คุณเห็นใน browser
└────────┬────────┘
         │
         ↓ (http://localhost:4000)
┌─────────────────┐
│   API Server    │  ← NestJS + Prisma
│  (Backend)      │    จัดการ request/response
└────┬───────┬────┘
     │       │
     │       ↓
     │   ┌─────────────────┐
     │   │  PostgreSQL     │  ← เก็บ metadata
     │   │  (Database)     │    (ชื่อไฟล์, ขนาด, hash)
     │   └─────────────────┘
     │
     ↓
┌─────────────────┐
│   Iroh Node     │  ← P2P Storage
│  (P2P Network)  │    เก็บไฟล์จริงๆ
└─────────────────┘
```

---

## 📤 การอัปโหลดไฟล์

### ขั้นตอนที่เกิดขึ้น:

```
1. คุณเลือกไฟล์ (เช่น photo.jpg) ที่ Web UI
   ↓
2. Browser ส่งไฟล์ไปที่ API
   POST http://localhost:4000/assets
   ↓
3. API เก็บไฟล์ชั่วคราวที่ /tmp
   ↓
4. API เรียกคำสั่ง Iroh:
   iroh --start blobs add /tmp/photo.jpg
   ↓
5. Iroh วิเคราะห์ไฟล์และสร้าง "hash" (ลายเซ็นของไฟล์)
   → เช่น: ry6q4a5suvtjtnxuaaaln46erw7hvdjuppqv6v4zhthgvidvvciq
   ↓
6. Iroh เก็บไฟล์ใน P2P network
   ↓
7. API บันทึกข้อมูลใน PostgreSQL:
   - hash: ry6q4a...
   - filename: photo.jpg
   - size: 2,500,000 bytes
   - mime: image/jpeg
   ↓
8. API ลบไฟล์ชั่วคราวออกจาก /tmp
   ↓
9. คุณเห็นไฟล์ในรายการพร้อม hash
```

### ทำไมต้องใช้ Hash?

- **ไม่ซ้ำกัน:** ไฟล์เดียวกัน = hash เดียวกัน
- **Deduplication:** ถ้ามีคนอัปโหลดไฟล์เดียวกัน ระบบรู้ว่าซ้ำ
- **Integrity:** ตรวจสอบว่าไฟล์ไม่เสียหายระหว่างดาวน์โหลด

---

## 📥 การดาวน์โหลดไฟล์

### ขั้นตอนที่เกิดขึ้น:

```
1. คุณคลิกปุ่ม "ดาวน์โหลด" ที่ไฟล์
   ↓
2. Browser request:
   GET http://localhost:4000/assets/ry6q4a.../content
   ↓
3. API หา metadata จาก PostgreSQL
   → รู้ว่า hash นี้คือไฟล์อะไร
   ↓
4. API เรียกคำสั่ง Iroh:
   iroh --start blobs export ry6q4a... STDOUT
   ↓
5. Iroh ดึงไฟล์จาก P2P network
   → อาจดึงจากหลายที่พร้อมกัน (P2P)
   ↓
6. Iroh stream ไฟล์ออกมาทาง STDOUT
   ↓
7. API ส่ง stream ไปยัง Browser
   พร้อม headers:
   - Content-Type: image/jpeg
   - Content-Disposition: attachment; filename="photo.jpg"
   ↓
8. Browser ดาวน์โหลดไฟล์ให้คุณ
```

---

## 🗑️ การลบไฟล์

```
1. คุณคลิกปุ่ม "ลบ"
   ↓
2. Browser แสดง confirmation dialog
   "คุณต้องการลบไฟล์นี้ใช่หรือไม่?"
   ↓
3. คุณยืนยัน → Browser request:
   DELETE http://localhost:4000/assets/cmhlo...
   ↓
4. API ลบ metadata จาก PostgreSQL
   ↓
5. รายการไฟล์อัพเดท (ไฟล์หาย)
```

**หมายเหตุ:** ไฟล์ยังอยู่ใน Iroh network แต่ไม่มี metadata อ้างอิง

---

## 📊 ฐานข้อมูล (PostgreSQL)

### ตาราง Asset

| Column | Type | คำอธิบาย |
|--------|------|----------|
| `id` | String | ID ของ record (auto-generated) |
| `cid` | String | Content hash จาก Iroh |
| `filename` | String | ชื่อไฟล์เดิม (เช่น photo.jpg) |
| `mime` | String | ประเภทไฟล์ (เช่น image/jpeg) |
| `size` | Int | ขนาดไฟล์ (bytes) |
| `pinned` | Boolean | บอกว่า pin ไว้หรือไม่ |
| `createdAt` | DateTime | เวลาที่อัปโหลด |
| `uploader` | String? | ชื่อผู้อัปโหลด (optional) |

---

## 📦 ขนาดไฟล์สูงสุด

### ⚙️ ปัจจุบัน: **1 GB**

```typescript
// api/src/modules/assets/assets.controller.ts
limits: { fileSize: 1024 * 1024 * 1024 } // 1GB
```

### 🚀 ถ้าต้องการอัปโหลด 10GB

**ตอบ: ทำได้!** แต่ต้องแก้ไข:

#### 1. เพิ่ม Limit ใน API

แก้ไขไฟล์: `api/src/modules/assets/assets.controller.ts`

```typescript
@UseInterceptors(FileInterceptor('file', {
  storage: diskStorage({ destination: '/tmp', filename: filenameFn }),
  limits: { fileSize: 10 * 1024 * 1024 * 1024 } // เปลี่ยนเป็น 10GB
}))
```

#### 2. ตรวจสอบ Disk Space

```bash
# เช็คพื้นที่ว่างใน Docker
docker system df

# เช็คพื้นที่ /tmp
docker exec iroh-cdn-api-1 df -h /tmp
```

ต้องมีพื้นที่อย่างน้อย **10GB + buffer** ใน:
- `/tmp` (สำหรับไฟล์ชั่วคราว)
- Iroh data directory (สำหรับเก็บไฟล์จริง)

#### 3. Rebuild API Container

```bash
docker-compose build api
docker-compose up -d --force-recreate api
```

#### 4. ถ้ามี NGINX/Reverse Proxy

```nginx
# nginx.conf
client_max_body_size 10G;
proxy_read_timeout 300s;
```

---

## ⚠️ ข้อควรระวังกับไฟล์ใหญ่

### 🐌 ปัญหาที่อาจเจอ:

1. **ใช้เวลานาน:**
   - อัปโหลด 10GB ผ่าน internet อาจใช้เวลาหลายนาที
   - Iroh process ไฟล์ใหญ่ใช้เวลา

2. **Memory สูง:**
   - Node.js อาจใช้ RAM เยอะขึ้น
   - แนะนำให้ Docker มี RAM อย่างน้อย 4GB

3. **Timeout:**
   - Request อาจ timeout ถ้าใช้เวลานาน
   - ต้องเพิ่ม timeout ใน API และ NGINX

4. **P2P Sync:**
   - การ sync ไฟล์ 10GB ใน P2P network ใช้เวลา
   - ครั้งแรกที่ดาวน์โหลดอาจช้า

### ✅ วิธีแก้:

```typescript
// เพิ่ม timeout และ streaming
@Post()
@UseInterceptors(FileInterceptor('file', {
  storage: diskStorage({ 
    destination: '/tmp', 
    filename: filenameFn 
  }),
  limits: { 
    fileSize: 10 * 1024 * 1024 * 1024, // 10GB
    files: 1 
  }
}))
```

---

## 🎮 การใช้งานจริง

### สำหรับไฟล์ปกติ (< 1GB)
✅ ใช้งานได้เลย ไม่ต้องแก้อะไร

### สำหรับไฟล์ใหญ่ (1-10GB)
1. แก้ `fileSize` limit ใน controller
2. Rebuild API container
3. ตรวจสอบ disk space

### สำหรับไฟล์ใหญ่มาก (> 10GB)
1. ทำทุกอย่างข้างบน
2. เพิ่ม timeout ในทุกชั้น
3. พิจารณาใช้ resumable upload (chunked upload)
4. เพิ่ม progress bar ใน UI

---

## 🔧 คำสั่งที่มีประโยชน์

```bash
# ดู logs
docker-compose logs api --tail 50
docker-compose logs web --tail 50

docker-compose build api
docker-compose build web

# Restart service
docker-compose up -d --force-recreate api
docker-compose up -d --force-recreate web

# เข้าไปใน container
docker exec -it iroh-cdn-api-1 sh

# ทดสอบ Iroh
docker exec iroh-cdn-api-1 iroh --version
docker exec iroh-cdn-api-1 iroh --start blobs blobs

# Reset database
docker-compose exec api npx prisma migrate reset

# ดู database
docker-compose exec db psql -U postgres -d irohcdn
```

---

## 🎯 สรุป

### ✅ สิ่งที่ได้:
- ระบบ CDN แบบกระจายศูนย์
- อัปโหลด/ดาวน์โหลดไฟล์ผ่าน Web UI
- เก็บไฟล์แบบ P2P ด้วย Iroh
- Content addressing (hash-based)
- ลบไฟล์ได้

### 💡 จุดเด่น:
- **Self-hosted:** ควบคุมข้อมูลเอง
- **Decentralized:** ไม่ต้องพึ่ง server กลาง
- **Content-addressed:** ไฟล์เดียวกัน = hash เดียวกัน
- **Open source:** แก้ไขได้ตามต้องการ

### 🚀 สำหรับไฟล์ 10GB:
**ได้!** แค่แก้ `fileSize` limit และตรวจสอบ disk space

---

**ระบบพร้อมใช้งานที่ http://localhost:3000** 🎉

