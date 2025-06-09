const bcrypt = require('bcryptjs');
const { executeQuery, testConnection } = require('../config/dataconfig');

async function hashExistingPasswords() {
  try {
    console.log('🔄 เริ่มต้นการ hash รหัสผ่าน...');

    // ทดสอบการเชื่อมต่อฐานข้อมูล
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error('❌ ไม่สามารถเชื่อมต่อฐานข้อมูลได้');
      return;
    }

    // ดึงข้อมูลผู้ใช้ทั้งหมดที่มีรหัสผ่านแบบ plain text
    const getUsersQuery =
      'SELECT user_id, username, password FROM users WHERE status = 1';
    const usersResult = await executeQuery(getUsersQuery);

    if (!usersResult.success) {
      console.error('❌ ไม่สามารถดึงข้อมูลผู้ใช้ได้:', usersResult.error);
      return;
    }

    const users = usersResult.data;
    console.log(`📋 พบผู้ใช้ทั้งหมด ${users.length} คน`);

    for (const user of users) {
      try {
        // ตรวจสอบว่ารหัสผ่านถูก hash แล้วหรือยัง
        const isAlreadyHashed =
          user.password.startsWith('$2a$') || user.password.startsWith('$2b$');

        if (isAlreadyHashed) {
          console.log(`✅ ${user.username}: รหัสผ่านถูก hash แล้ว`);
          continue;
        }

        // Hash รหัสผ่าน
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(user.password, saltRounds);

        // อัปเดตรหัสผ่านในฐานข้อมูล
        const updateQuery = 'UPDATE users SET password = ? WHERE user_id = ?';
        const updateResult = await executeQuery(updateQuery, [
          hashedPassword,
          user.user_id,
        ]);

        if (updateResult.success) {
          console.log(`✅ ${user.username}: hash รหัสผ่านสำเร็จ`);
        } else {
          console.error(
            `❌ ${user.username}: ไม่สามารถอัปเดตรหัสผ่านได้:`,
            updateResult.error
          );
        }
      } catch (error) {
        console.error(
          `❌ เกิดข้อผิดพลาดกับผู้ใช้ ${user.username}:`,
          error.message
        );
      }
    }

    console.log('🎉 เสร็จสิ้นการ hash รหัสผ่านทั้งหมด');
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการ hash รหัสผ่าน:', error.message);
  }
}

// เรียกใช้ฟังก์ชัน
hashExistingPasswords()
  .then(() => {
    console.log('🔄 สคริปต์เสร็จสิ้น');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ เกิดข้อผิดพลาด:', error);
    process.exit(1);
  });
