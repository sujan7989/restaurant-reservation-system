require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Table = require('./models/Table');

const seedDatabase = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant-reservation');
    console.log('MongoDB connected');

    // Clear existing data
    await User.deleteMany({});
    await Table.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@restaurant.com',
      password: 'admin123',
      role: 'admin'
    });
    console.log('Created admin user:', adminUser.email);

    // Create sample tables
    const tables = [
      { tableNumber: 1, capacity: 2, location: 'Window' },
      { tableNumber: 2, capacity: 2, location: 'Window' },
      { tableNumber: 3, capacity: 4, location: 'Center' },
      { tableNumber: 4, capacity: 4, location: 'Center' },
      { tableNumber: 5, capacity: 6, location: 'Corner' },
      { tableNumber: 6, capacity: 6, location: 'Corner' },
      { tableNumber: 7, capacity: 8, location: 'Private' },
      { tableNumber: 8, capacity: 10, location: 'Private' }
    ];

    await Table.insertMany(tables);
    console.log('Created sample tables');

    // Create a test customer
    const customerUser = await User.create({
      name: 'Test Customer',
      email: 'customer@test.com',
      password: 'customer123',
      role: 'customer'
    });
    console.log('Created test customer:', customerUser.email);

    console.log('\nDatabase seeded successfully!');
    console.log('\nLogin credentials:');
    console.log('Admin - Email: admin@restaurant.com, Password: admin123');
    console.log('Customer - Email: customer@test.com, Password: customer123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
