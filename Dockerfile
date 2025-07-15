# ใช้ Node.js เวอร์ชันล่าสุดที่เสถียร
FROM --platform=linux/amd64 node:18-alpine

# ติดตั้ง dependencies ที่จำเป็น
RUN apk add --no-cache libc6-compat

# สร้างและตั้งค่า working directory
WORKDIR /app

# คัดลอกไฟล์ package.json และ package-lock.json
COPY package*.json ./

# ติดตั้ง dependencies
RUN npm install

# คัดลอกโค้ดทั้งหมด
COPY . .

# Build Next.js app (เฉพาะสำหรับ web service)
RUN npm run build

# เปิด port ที่จำเป็น
EXPOSE 3000
EXPOSE 3001

# คำสั่งเริ่มต้นแอพ (จะถูก override โดย docker-compose)
CMD ["npm", "start"]
