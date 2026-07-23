import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

export const seedAdminsFromJSON = async () => {
  try {
    const jsonPath = path.resolve('admins.json');
    if (!fs.existsSync(jsonPath)) return;

    const adminsList = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    
    const hashedPassword = await bcrypt.hash(process.env.DEFAULT_ADMIN_PASSWORD, 10);
    const hashedPin = await bcrypt.hash(process.env.DEFAULT_ADMIN_PIN, 10);

    for (const admin of adminsList) {
      const emailClean = admin.email.toLowerCase().trim();
      const exists = await User.findOne({ email: emailClean });

      if (!exists) {
        await User.create({
          name: admin.name,
          email: emailClean,
          password: hashedPassword,
          securityPin: hashedPin,
          role: 'ADMIN',
          isActive: true
        });
        console.log(`✅ Admin created: ${admin.name} (${emailClean})`);
      }
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};