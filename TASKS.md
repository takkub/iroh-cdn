# 📋 Iroh CDN - Development Tasks

## 🚨 Priority 1: Critical Security (Week 1)

### Task 1.1: Rate Limiting
- [ ] ติดตั้ง `express-rate-limit`
  ```bash
  cd api && npm install express-rate-limit
  ```
- [ ] เพิ่ม rate limiter ใน `api/src/main.ts`
  - จำกัด 100 requests ต่อ 15 นาที
  - แยก limit สำหรับ upload (10 files/hour)
- [ ] Test ด้วย Artillery/k6

**Expected Time:** 2 hours  
**Assignee:** Backend Developer

---

### Task 1.2: File Validation
- [ ] เพิ่ม validation ใน `api/src/modules/assets/assets.controller.ts`
  - จำกัดขนาดไฟล์ (100MB default)
  - whitelist file types (image/\*, video/mp4, application/pdf)
  - เช็ค magic numbers (ไม่ใช่แค่ extension)
- [ ] เพิ่ม error messages ที่ชัดเจน
- [ ] Unit test สำหรับ validation

**Expected Time:** 4 hours  
**Assignee:** Backend Developer

---

### Task 1.3: CORS Configuration
- [ ] แก้ไข `api/src/main.ts`
  - จำกัด origin เฉพาะ production domain
  - เพิ่ม `FRONTEND_URL` ใน `.env`
- [ ] อัพเดต `.env.example`
- [ ] Test cross-origin requests

**Expected Time:** 1 hour  
**Assignee:** Backend Developer

---

### Task 1.4: Error Handling & Logging
- [ ] ติดตั้ง `winston`
  ```bash
  cd api && npm install winston
  ```
- [ ] สร้าง `api/src/shared/logger.service.ts`
- [ ] เพิ่ม global exception filter (NestJS)
- [ ] Log ทุก API request (IP, endpoint, status)
- [ ] ตั้ง log rotation (max 100MB)

**Expected Time:** 3 hours  
**Assignee:** Backend Developer

---

## 🔐 Priority 2: Authentication (Week 2)

### Task 2.1: Authentication System
- [ ] เลือก auth strategy (JWT recommended)
- [ ] ติดตั้ง dependencies
  ```bash
  cd api && npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt
  npm install --save-dev @types/passport-jwt @types/bcrypt
  ```
- [ ] สร้าง Prisma schema สำหรับ User
  ```prisma
  model User {
    id        String   @id @default(uuid())
    email     String   @unique
    password  String
    apiKey    String   @unique @default(uuid())
    role      Role     @default(USER)
    createdAt DateTime @default(now())
    assets    Asset[]
  }

  enum Role {
    USER
    ADMIN
  }

  model Asset {
    // เพิ่ม relation
    userId    String?
    user      User?    @relation(fields: [userId], references: [id])
  }
  ```
- [ ] Run migration
  ```bash
  npx prisma migrate dev --name add-user-model
  ```

**Expected Time:** 4 hours  
**Assignee:** Backend Developer

---

### Task 2.2: Auth Module
- [ ] สร้าง `api/src/modules/auth/auth.module.ts`
- [ ] `POST /api/auth/register` - สมัครสมาชิก
- [ ] `POST /api/auth/login` - เข้าสู่ระบบ
- [ ] `POST /api/auth/refresh` - refresh token
- [ ] `GET /api/auth/me` - ดูข้อมูลตัวเอง
- [ ] Guard: `JwtAuthGuard`

**Expected Time:** 6 hours  
**Assignee:** Backend Developer

---

### Task 2.3: Protect Upload Endpoint
- [ ] เพิ่ม `@UseGuards(JwtAuthGuard)` ใน assets controller
- [ ] เก็บ `userId` กับ uploaded files
- [ ] เฉพาะเจ้าของไฟล์ลบได้
- [ ] Admin ลบไฟล์ทุกคนได้

**Expected Time:** 2 hours  
**Assignee:** Backend Developer

---

### Task 2.4: Frontend Authentication
- [ ] สร้าง Login/Register pages
  - `web/app/auth/login/page.tsx`
  - `web/app/auth/register/page.tsx`
- [ ] ติดตั้ง state management
  ```bash
  cd web && npm install zustand
  ```
- [ ] สร้าง auth store (`web/store/auth.ts`)
- [ ] Protected routes (ต้อง login ก่อน upload)
- [ ] JWT token storage (localStorage + httpOnly cookie)

**Expected Time:** 8 hours  
**Assignee:** Frontend Developer

---

## 🗄️ Priority 3: Database & Backup (Week 2-3)

### Task 3.1: Prisma Migration
- [ ] แปลง `prisma db push` เป็น `prisma migrate`
- [ ] สร้าง initial migration
  ```bash
  npx prisma migrate dev --name initial_schema
  ```
- [ ] อัพเดต `docker-entrypoint.sh` ให้ใช้ `prisma migrate deploy`
- [ ] เขียน migration guide ใน README

**Expected Time:** 2 hours  
**Assignee:** Backend Developer

---

### Task 3.2: Database Indexes
- [ ] เพิ่ม index ใน schema
  ```prisma
  model Asset {
    @@index([cid])
    @@index([userId])
    @@index([createdAt])
  }
  ```
- [ ] Run migration
- [ ] Test query performance

**Expected Time:** 1 hour  
**Assignee:** Backend Developer

---

### Task 3.3: Backup System
- [ ] สร้าง `scripts/backup.sh`
  - Backup PostgreSQL
  - Backup Iroh volumes
  - Compress with gzip
- [ ] สร้าง `scripts/restore.sh`
- [ ] Test restore process
- [ ] เขียน backup documentation

**Expected Time:** 4 hours  
**Assignee:** DevOps

---

### Task 3.4: Automated Backup
- [ ] ตั้ง cron job (daily 2 AM)
- [ ] Retention policy (30 days)
- [ ] ตั้ง alert ถ้า backup ล้มเหลว
- [ ] (Optional) Sync to cloud storage

**Expected Time:** 3 hours  
**Assignee:** DevOps

---

## 📊 Priority 4: Monitoring & Health (Week 3)

### Task 4.1: Health Check Endpoint
- [ ] สร้าง `GET /api/health`
  - เช็ค database connection
  - เช็ค disk space
  - เช็ค Iroh status
- [ ] Liveness probe สำหรับ Docker
- [ ] Readiness probe

**Expected Time:** 2 hours  
**Assignee:** Backend Developer

---

### Task 4.2: Metrics Endpoint
- [ ] ติดตั้ง `@willsoto/nestjs-prometheus`
  ```bash
  cd api && npm install @willsoto/nestjs-prometheus prom-client
  ```
- [ ] สร้าง `GET /metrics` (Prometheus format)
  - HTTP request duration
  - Active connections
  - File upload count/size
- [ ] (Optional) Grafana dashboard

**Expected Time:** 4 hours  
**Assignee:** Backend Developer

---

### Task 4.3: Error Tracking
- [ ] เลือก error tracking service (Sentry/Rollbar)
- [ ] ติดตั้ง SDK
  ```bash
  cd api && npm install @sentry/node
  cd web && npm install @sentry/nextjs
  ```
- [ ] Integrate กับ NestJS & Next.js
- [ ] Test error reporting

**Expected Time:** 2 hours  
**Assignee:** Backend Developer

---

## 🚀 Priority 5: Performance (Week 4)

### Task 5.1: Response Compression
- [ ] Enable compression ใน NestJS
- [ ] ติดตั้ง `compression`
  ```bash
  cd api && npm install compression
  ```
- [ ] Enable gzip compression
- [ ] Test compression ratio

**Expected Time:** 1 hour  
**Assignee:** Backend Developer

---

### Task 5.2: Caching
- [ ] เพิ่ม Cache-Control headers
- [ ] ติดตั้ง Redis (optional)
  ```yaml
  services:
    redis:
      image: redis:7-alpine
      ports:
        - "6379:6379"
      volumes:
        - redis-data:/data
  ```
- [ ] Cache file metadata
- [ ] ติดตั้ง `@nestjs/cache-manager`

**Expected Time:** 4 hours  
**Assignee:** Backend Developer

---

### Task 5.3: Docker Optimization
- [ ] ใช้ multi-stage build
- [ ] Optimize image size
- [ ] ตั้ง resource limits
  ```yaml
  deploy:
    resources:
      limits:
        cpus: '1'
        memory: 1G
  ```
- [ ] Health checks ใน docker-compose

**Expected Time:** 3 hours  
**Assignee:** DevOps

---

## 📱 Priority 6: User Experience (Month 2)

### Task 6.1: Upload Progress
- [ ] เพิ่ม progress bar (React)
- [ ] Real-time upload speed
- [ ] Pause/Resume upload
- [ ] Multiple file upload
- [ ] ใช้ `react-dropzone`

**Expected Time:** 6 hours  
**Assignee:** Frontend Developer

---

### Task 6.2: File Management UI
- [ ] แสดงรายการไฟล์ทั้งหมด
- [ ] Search/Filter
- [ ] Pagination (20 items/page)
- [ ] Sort by date/size/name
- [ ] Bulk delete
- [ ] Copy CID/Link button

**Expected Time:** 8 hours  
**Assignee:** Frontend Developer

---

### Task 6.3: Drag & Drop
- [ ] Drag & drop zone
- [ ] File preview before upload
- [ ] Thumbnail generation
- [ ] Image preview modal

**Expected Time:** 4 hours  
**Assignee:** Frontend Developer

---

## 🎨 Priority 7: Admin Dashboard (Month 2)

### Task 7.1: Admin Role
- [ ] เพิ่ม `role` field ใน User model (ทำแล้วใน Task 2.1)
- [ ] สร้าง `RolesGuard` (NestJS)
- [ ] `@Roles('admin')` decorator
- [ ] Seed admin user

**Expected Time:** 2 hours  
**Assignee:** Backend Developer

---

### Task 7.2: Admin Endpoints
- [ ] `GET /api/admin/stats` - ระบบ stats
- [ ] `GET /api/admin/users` - รายชื่อ users
- [ ] `DELETE /api/admin/users/:id` - ลบ user
- [ ] `GET /api/admin/files` - ไฟล์ทั้งหมด
- [ ] `PUT /api/admin/users/:id/role` - เปลี่ยน role

**Expected Time:** 4 hours  
**Assignee:** Backend Developer

---

### Task 7.3: Admin UI
- [ ] Dashboard page (`web/app/admin/page.tsx`)
- [ ] User management
- [ ] File management
- [ ] System statistics (charts)
- [ ] ใช้ `recharts` หรือ `chart.js`

**Expected Time:** 12 hours  
**Assignee:** Frontend Developer

---

## 🔧 Priority 8: Advanced Features (Month 3+)

### Task 8.1: Image Optimization
- [ ] ติดตั้ง `sharp`
  ```bash
  cd api && npm install sharp
  ```
- [ ] Auto-resize images
- [ ] Generate thumbnails
- [ ] Convert to WebP
- [ ] สร้าง thumbnail endpoint

**Expected Time:** 6 hours  
**Assignee:** Backend Developer

---

### Task 8.2: File Sharing
- [ ] Public/Private toggle
- [ ] Share links with expiration
- [ ] Password protection
- [ ] Download limits
- [ ] สร้าง `ShareLink` model

**Expected Time:** 8 hours  
**Assignee:** Backend Developer

---

### Task 8.3: File Versioning
- [ ] เก็บ file versions
- [ ] Rollback to previous version
- [ ] Version history UI
- [ ] สร้าง `AssetVersion` model

**Expected Time:** 10 hours  
**Assignee:** Full Stack Developer

---

### Task 8.4: Analytics
- [ ] Track downloads
- [ ] Popular files
- [ ] User activity
- [ ] Storage usage per user
- [ ] Dashboard charts

**Expected Time:** 6 hours  
**Assignee:** Backend Developer

---

## 📚 Documentation

### Task DOC.1: API Documentation
- [ ] ติดตั้ง Swagger
  ```bash
  cd api && npm install @nestjs/swagger
  ```
- [ ] เขียน OpenAPI decorators
- [ ] Host at `/api-docs`
- [ ] Export OpenAPI JSON

**Expected Time:** 4 hours  
**Assignee:** Backend Developer

---

### Task DOC.2: User Guide
- [ ] Getting Started
- [ ] API usage examples
- [ ] Deployment guide
- [ ] Troubleshooting
- [ ] Environment variables reference

**Expected Time:** 3 hours  
**Assignee:** Technical Writer

---

## ✅ Testing

### Task TEST.1: Unit Tests
- [ ] ติดตั้ง Jest (มีอยู่แล้วใน NestJS)
- [ ] Test upload logic
- [ ] Test auth logic
- [ ] Test Prisma services
- [ ] Target: 70% coverage

**Expected Time:** 8 hours  
**Assignee:** Backend Developer

---

### Task TEST.2: E2E Tests
- [ ] ติดตั้ง Playwright
  ```bash
  cd web && npm install --save-dev @playwright/test
  ```
- [ ] Test upload flow
- [ ] Test auth flow
- [ ] Test file management
- [ ] CI integration

**Expected Time:** 6 hours  
**Assignee:** QA Engineer

---

## 🚀 Deployment

### Task DEPLOY.1: Production Config
- [ ] Environment variables
- [ ] SSL/TLS setup (Let's Encrypt)
- [ ] Reverse proxy (Nginx/Caddy)
- [ ] Docker Compose production mode
- [ ] สร้าง `docker-compose.prod.yml`

**Expected Time:** 4 hours  
**Assignee:** DevOps

---

### Task DEPLOY.2: CI/CD Pipeline
- [ ] GitHub Actions
- [ ] Auto-test on PR
- [ ] Auto-deploy to staging
- [ ] Manual deploy to production
- [ ] สร้าง `.github/workflows/ci.yml`

**Expected Time:** 6 hours  
**Assignee:** DevOps

---

## 📊 Summary

| Priority | Tasks | Estimated Time | Status |
|----------|-------|----------------|--------|
| P1: Security | 4 | 10 hours | 🔴 Not Started |
| P2: Auth | 4 | 20 hours | 🔴 Not Started |
| P3: Database | 4 | 10 hours | 🔴 Not Started |
| P4: Monitoring | 3 | 8 hours | 🔴 Not Started |
| P5: Performance | 3 | 8 hours | 🔴 Not Started |
| P6: UX | 3 | 18 hours | 🔴 Not Started |
| P7: Admin | 3 | 18 hours | 🔴 Not Started |
| P8: Advanced | 4 | 30 hours | 🔴 Not Started |
| Documentation | 2 | 7 hours | 🔴 Not Started |
| Testing | 2 | 14 hours | 🔴 Not Started |
| Deployment | 2 | 10 hours | 🔴 Not Started |

**Total Estimated Time:** 153 hours (~4 weeks for 1 developer)

---

## 🎯 Recommended Timeline

### Week 1: Security Foundation
- Complete P1 (Security)
- Start P2 (Authentication)

### Week 2-3: Core Features
- Complete P2 (Authentication)
- Complete P3 (Database)
- Complete P4 (Monitoring)

### Week 4: Performance & Polish
- Complete P5 (Performance)
- Start P6 (UX improvements)
- Start Documentation

### Month 2: Advanced Features
- Complete P6 (UX)
- Complete P7 (Admin)
- Testing & Documentation

### Month 3+: Production Ready
- Complete P8 (Advanced features)
- Complete Testing
- Deployment & Monitoring

---

## 📝 Notes

- ทุก task ควร commit ไป Git branch แยก
- Code review ก่อน merge to main
- Test บน local ก่อน deploy
- Update README.md เมื่อเพิ่ม feature ใหม่
- ใช้ Conventional Commits (feat:, fix:, docs:, etc.)

---

## 🔄 Progress Tracking

### How to Update Status

เมื่อเริ่มทำ task:
```markdown
- [x] Task description
  - Started: 2025-11-15
  - Assignee: Your Name
```

เมื่อเสร็จ task:
```markdown
- [x] Task description ✅
  - Started: 2025-11-15
  - Completed: 2025-11-16
  - PR: #123
```

---

**Last Updated:** 2025-11-15  
**Version:** 1.0  
**Project:** Iroh CDN  
**Repository:** https://github.com/takkub/iroh-cdn

