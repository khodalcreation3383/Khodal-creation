require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User.model');
const Settings = require('../models/Settings.model');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create admin user
    const existingAdmin = await User.findOne({ email: process.env.ADMIN_EMAIL });
    if (!existingAdmin) {
      await User.create({
        name: 'Admin',
        email: process.env.ADMIN_EMAIL || 'admin@textile.com',
        password: process.env.ADMIN_PASSWORD || 'Admin@123',
        role: 'admin'
      });
      console.log('✅ Admin user created:', process.env.ADMIN_EMAIL);
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    // Create default settings
    const existingSettings = await Settings.findOne();
    if (!existingSettings) {
      await Settings.create({
        businessName: 'Khodal Creation',
        address: {
          street: 'Textile Market',
          city: 'Surat',
          state: 'Gujarat',
          pincode: '395003',
          country: 'India'
        },
        contact: {
          phone: '+91 98765 43210',
          mobile: '+91 98765 43210',
          email: 'info@khodalcreation.com',
          website: 'www.khodalcreation.com'
        },
        gst: { number: '', enabled: false, defaultRate: 5 },
        invoice: {
          termsAndConditions: 'Goods once sold will not be taken back. Payment due as per agreed terms.',
          footer: `Thank you for your business! | Khodal Creation | © ${new Date().getFullYear()}`
        },
        payment: { defaultTermsDays: 30, reminderDaysBefore: 5 }
      });
      console.log('✅ Default settings created for Khodal Creation');
    } else {
      // Update existing settings to use Khodal Creation if still default
      if (existingSettings.businessName === 'Khodal Textile' || existingSettings.businessName === 'Textile Business') {
        existingSettings.businessName = 'Khodal Creation';
        await existingSettings.save();
        console.log('✅ Business name updated to Khodal Creation');
      } else {
        console.log('ℹ️  Settings already exist');
      }
    }

    console.log('\n🎉 Seed completed successfully!');
    console.log('📧 Admin Email:', process.env.ADMIN_EMAIL || 'admin@textile.com');
    console.log('🔑 Admin Password:', process.env.ADMIN_PASSWORD || 'Admin@123');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
