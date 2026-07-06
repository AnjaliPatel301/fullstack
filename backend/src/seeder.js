require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');
const Category = require('./models/Category');

const seedAdmin = async () => {
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin@123';

  let admin = await User.findOne({ email: adminEmail });
  if (admin) {
    console.log(`Admin user already exists: ${adminEmail}`);
    if (admin.role !== 'admin' || !admin.isActive) {
      admin.role = 'admin';
      admin.isActive = true;
      await admin.save();
      console.log('Updated existing user to admin role and activated account.');
    }
    return;
  }

  admin = await User.create({
    name: 'Admin User',
    email: adminEmail,
    password: adminPassword,
    role: 'admin',
    isActive: true,
  });

  console.log(`Created admin user: ${adminEmail}`);
  console.log(`Use this password: ${adminPassword}`);
};

const seedCategories = async () => {
  const categories = [
    { name: 'Clothing', slug: 'clothing', types: ['Men', 'Women', 'Kids'] },
    { name: 'Footwear', slug: 'footwear', types: ['Casual', 'Sports', 'Formal'] },
    { name: 'Accessories', slug: 'accessories', types: ['Jewelry', 'Bags', 'Watches'] },
  ];

  for (const category of categories) {
    await Category.findOneAndUpdate(
      { slug: category.slug },
      { $set: category },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  console.log('Seeded default categories.');
};

const runSeeder = async () => {
  await connectDB();
  try {
    await seedAdmin();
    await seedCategories();
    console.log('✅ Database seeding completed.');
  } catch (error) {
    console.error('❌ Seeder error:', error);
  } finally {
    process.exit();
  }
};

runSeeder();
