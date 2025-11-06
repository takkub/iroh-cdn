FROM node:20-slim

# ติดตั้ง dependencies ที่จำเป็นสำหรับ build iroh และรัน Node.js app
RUN apt-get update && apt-get install -y \
    curl \
    ca-certificates \
    build-essential \
    pkg-config \
    libssl-dev \
    git \
    && rm -rf /var/lib/apt/lists/*

# ติดตั้ง Rust และ Cargo
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --default-toolchain stable
ENV PATH="/root/.cargo/bin:${PATH}"

# Build iroh CLI จาก source (ใช้ v0.28.0 ที่ยังมี iroh binary)
# v0.95.0+ เปลี่ยนเป็น library-only และไม่มี CLI binary แล้ว
RUN git clone --depth 1 --branch v0.28.0 https://github.com/n0-computer/iroh.git /tmp/iroh \
    && cd /tmp/iroh \
    && cargo build --release --bin iroh \
    && cp target/release/iroh /usr/local/bin/iroh \
    && chmod +x /usr/local/bin/iroh \
    && cd / \
    && rm -rf /tmp/iroh /root/.cargo/registry /root/.cargo/git \
    && iroh --version

WORKDIR /app

# ติดตั้ง dependencies
COPY package.json package-lock.json* ./
# ถ้ายังไม่มี package-lock.json ให้เปลี่ยนเป็น npm install
RUN npm install

# Prisma & Nest config
COPY prisma ./prisma
COPY tsconfig.json nest-cli.json ./

# โค้ดแอป
COPY src ./src

# สร้าง Prisma client
RUN npx prisma generate

# **สำคัญ**: Build NestJS → สร้างโฟลเดอร์ dist/
RUN npm run build

# Entrypoint จะ migrate แล้วรัน dist/main.js
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 4000
CMD ["/docker-entrypoint.sh"]
