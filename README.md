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

## 💰 Business Models - วิธีทำเงิน

### 🎯 แนวทางหลัก (Recommended)

#### 1. **Freemium Model** 
```
ฟรี:
- อัปโหลดได้ 100MB/เดือน
- เก็บไฟล์ได้ 5 ไฟล์
- ลิงก์แชร์หมดอายุ 7 วัน

Pro ($9.99/เดือน):
- อัปโหลดได้ 10GB/เดือน
- ไฟล์ไม่จำกัด
- ลิงก์ไม่หมดอายุ
- ไม่มีโฆษณา
- API access

Business ($49.99/เดือน):
- อัปโหลดได้ 100GB/เดือน
- Custom domain
- Priority support
- Team collaboration
- Advanced analytics
```

**รายได้ประมาณ:**
- 1,000 users, 5% convert → 50 Pro users = $499.95/เดือน
- 10 Business users = $499.90/เดือน
- **รวม ~$1,000/เดือน**

---

#### 2. **Pay-per-Use (Storage as a Service)**
```
$0.05/GB/เดือน (ถูกกว่า AWS S3)
$0.01/GB bandwidth
```

**ตัวอย่างลูกค้า:**
- Web developers ที่ต้องการ CDN ถูก
- Indie game developers (game assets)
- Video creators (backup footage)

**รายได้ประมาณ:**
- 100 customers ใช้เฉลี่ย 50GB = $250/เดือน
- Bandwidth 500GB = $5/เดือน
- **รวม ~$255/เดือน**

---

#### 3. **White Label Solution**
ขายระบบให้องค์กรติดตั้งเอง:
- **Setup fee:** $5,000 - $10,000
- **Support contract:** $500/เดือน
- **Custom features:** $100/ชั่วโมง

**เหมาะกับ:**
- บริษัทที่ต้องการ private CDN
- สถาบันการศึกษา (แชร์ไฟล์นักเรียน)
- โรงพยาบาล (medical imaging)

---

#### 4. **API Marketplace**
ให้นักพัฒนาใช้ API:
```
Free tier:  1,000 requests/วัน
Starter:    $29/เดือน - 100,000 requests
Pro:        $99/เดือน - 1M requests
Enterprise: Custom pricing
```

**Use cases:**
- NFT storage (IPFS alternative)
- Decentralized backup services
- Web3 applications

---

### 🚀 แนวทางเสริม

#### 5. **Affiliate Program**
- ให้ commission 20% จากคนที่แนะนำมา
- สร้าง referral link
- รายได้ passive income

#### 6. **Premium Features (Add-ons)**
```
- CDN acceleration: $9.99/เดือน
- Virus scanning: $4.99/เดือน
- Password protection: $2.99/เดือน
- Custom branding: $14.99/เดือน
- Email delivery: $7.99/เดือน
```

#### 7. **Enterprise Support**
```
Basic:    $99/เดือน - Email support
Premium:  $299/เดือน - 24/7 support
Diamond:  $999/เดือน - Dedicated engineer
```

#### 8. **Ad-Supported Free Tier**
- แสดงโฆษณาใน free tier
- AdSense หรือ direct ads
- **รายได้:** $0.50 - $2 per 1000 views

---

### 💡 ตัวอย่างการคำนวณ (Scale)

**เป้าหมาย 10,000 users:**
```
Free users:     9,500 (95%)
Pro users:        450 (4.5%)  → $4,495.50/เดือน
Business users:    50 (0.5%)  → $2,499.50/เดือน
-------------------------------------------
Total MRR (Monthly Recurring Revenue): ~$7,000/เดือน
Annual Revenue: ~$84,000/ปี
```

**ค่าใช้จ่าย (Infrastructure):**
- Server: $200/เดือน (VPS + CDN)
- Database: $50/เดือน
- Domain + SSL: $20/เดือน
- Support tools: $30/เดือน
- **รวม: ~$300/เดือน**

**กำไรสุทธิ: ~$6,700/เดือน ($80,400/ปี)**

---

### 🎯 แผนการเติบโต (Growth Strategy)

#### Phase 1: MVP (0-6 เดือน)
- ✅ Launch basic features
- 🎯 หา 100 users แรก (beta testers)
- 🎯 เก็บ feedback
- 💰 ยังไม่มีรายได้ (ทุกคนฟรี)

#### Phase 2: Monetization (6-12 เดือน)
- ✅ เปิด Freemium model
- 🎯 หา 1,000 users
- 🎯 Convert 3-5% → 30-50 Pro users
- 💰 รายได้ ~$500-1,000/เดือน

#### Phase 3: Scale (12-24 เดือน)
- ✅ เพิ่ม Premium features
- ✅ เปิด API Marketplace
- 🎯 หา 10,000 users
- 💰 รายได้ ~$5,000-10,000/เดือน

#### Phase 4: Enterprise (24+ เดือน)
- ✅ White Label solutions
- ✅ Enterprise contracts
- 🎯 หา corporate clients
- 💰 รายได้ ~$20,000-50,000/เดือน

---

### 🛠️ ต้องเพิ่มอะไรบ้างเพื่อทำเงิน?

#### Features ที่ต้องมี:
- [ ] User authentication (login/register)
- [ ] Subscription management (Stripe/Paddle)
- [ ] Usage tracking (storage, bandwidth)
- [ ] Quota limits (free vs paid)
- [ ] Payment gateway integration
- [ ] Admin dashboard (analytics)
- [ ] Team/workspace features
- [ ] API key management
- [ ] Billing & invoicing

#### Marketing ที่ต้องทำ:
- [ ] Landing page (marketing site)
- [ ] SEO optimization
- [ ] Blog (content marketing)
- [ ] Social media presence
- [ ] Product Hunt launch
- [ ] Reddit/HackerNews posts
- [ ] YouTube tutorials
- [ ] Partnership กับ influencers

---

### 📊 Competitors & Pricing Comparison

| Service | Free Tier | Paid Tier | Your Advantage |
|---------|-----------|-----------|----------------|
| Dropbox | 2GB | $9.99/mo (2TB) | P2P = ถูกกว่า |
| Google Drive | 15GB | $1.99/mo (100GB) | Privacy-focused |
| AWS S3 | 5GB | $0.023/GB | Simpler pricing |
| IPFS Pinning | Varies | $5-20/mo | Easier to use |

**Positioning:** "Decentralized CDN ที่ถูกและใช้ง่ายกว่า"

---

### 🎓 ทักษะที่ต้องเพิ่ม

#### Technical:
- Payment integration (Stripe, PayPal)
- Authentication (JWT, OAuth)
- Usage metering
- Email automation (SendGrid)
- Analytics (Google Analytics, Mixpanel)

#### Business:
- Pricing strategy
- Customer support
- Marketing & SEO
- Sales funnel
- Legal (Terms, Privacy Policy)

---

### 💼 Alternative: ขายโปรเจค

ถ้าไม่อยากดูแลเอง:

#### 1. **ขายซอร์สโค้ด**
- Codecanyon: $30-$200
- GitHub Sponsors
- Gumroad: $50-$500

#### 2. **ขายบน Flippa/MicroAcquire**
- ต้องมี users + revenue
- ราคา ~2-5x annual revenue
- ถ้ามี $1,000/month = ขายได้ $24,000-$60,000

#### 3. **License Model**
- Single site: $49
- Multi-site: $199
- Extended: $499

---

## 💡 สรุปคำแนะนำ

### เริ่มต้นแบบง่าย:
1. **เพิ่ม authentication** (NextAuth.js)
2. **ใส่ Stripe payment**
3. **ทำ Freemium 2-3 tier**
4. **Launch ใน Product Hunt**
5. **โปรโมทใน Reddit/Twitter**

### คาดการณ์:
- **เดือนที่ 1-3:** 0-100 users, รายได้ $0
- **เดือนที่ 4-6:** 100-500 users, รายได้ $50-200
- **เดือนที่ 7-12:** 500-2,000 users, รายได้ $200-1,000
- **ปีที่ 2:** 2,000-10,000 users, รายได้ $1,000-5,000

**ROI:** ถ้าลงทุนเวลา 6-12 เดือน อาจได้รายได้ passive $1,000-5,000/เดือน

---

## 📝 License

MIT License

Built with [Iroh](https://github.com/n0-computer/iroh) • [NestJS](https://nestjs.com/) • [Next.js](https://nextjs.org/)

