# --- Giai đoạn 1: Build ---
FROM node:20-alpine As builder

WORKDIR /app

# Copy file dependency trước để tận dụng cache layer của Docker
COPY package*.json ./

# Cài đặt dependency (bao gồm cả devDependencies để build được)
# Lưu ý: Thêm --legacy-peer-deps vì dự án bạn đang bị conflict version
RUN npm install --legacy-peer-deps

# Copy toàn bộ source code
COPY . .

# Build code TypeScript sang JavaScript (thư mục dist)
RUN npm run build

# --- Giai đoạn 2: Run (Production) ---
FROM node:20-alpine As production

WORKDIR /app

# Chỉ copy những file cần thiết từ giai đoạn build
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Cài đặt dependency (Chỉ production, bỏ qua devDependencies cho nhẹ)
RUN npm install --only=production --legacy-peer-deps

# Cài thêm PM2 để quản lý process (tùy chọn, nhưng tốt cho prod)
RUN npm install pm2 -g

# Thiết lập biến môi trường
ENV NODE_ENV=production

# Lệnh chạy app
CMD ["node", "dist/main"]