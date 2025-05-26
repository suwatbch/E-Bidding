# ใช้ Node.js เวอร์ชันล่าสุดที่เสถียร
FROM node:18-alpine

# สร้างและตั้งค่า working directory
WORKDIR /app

# คัดลอกไฟล์ package.json และ package-lock.json
COPY package*.json ./

# ติดตั้ง dependencies
RUN npm install

# คัดลอกโค้ดทั้งหมด
COPY . .

# Build Next.js app
RUN npm run build

# เปิด port ที่จำเป็น
EXPOSE 3000
EXPOSE 3001

# คำสั่งเริ่มต้นแอพ (จะถูก override โดย docker-compose)
CMD ["npm", "start"]
