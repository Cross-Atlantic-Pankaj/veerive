import User from '../app/models/user-model.js';

async function ensureSuperAdmin() {
  try {
    const superAdminEmail = 'info@veerive.com';
    const superAdminPassword = 'password@360';
    
    const existing = await User.findOne({ email: superAdminEmail }).maxTimeMS(15000);
    
    if (!existing) {
      await User.create({
        email: superAdminEmail,
        password: superAdminPassword, // Store as plain text to match login logic
        role: 'SuperAdmin',
        name: 'Pankaj',
        provider: 'local'
      });
    } else if (existing.role !== 'SuperAdmin') {
      existing.role = 'SuperAdmin';
      await existing.save();
    } else {
    }
  } catch (error) {
    console.error('❌ Error ensuring SuperAdmin:', error.message);
  }
}

export default ensureSuperAdmin; 