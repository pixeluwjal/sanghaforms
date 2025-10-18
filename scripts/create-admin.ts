const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const MONGODB_URI = 'mongodb+srv://easynetcraft:m6Ioqjj6VGOfSBEq@cluster0.gsbgycq.mongodb.net/ss?retryWrites=true&w=majority';

async function createSuperAdmin() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('ss');
    const admins = db.collection('admins');
    
    // Delete existing admin if any
    await admins.deleteOne({ email: 'superadmin@forms.com' });
    
    // Create new admin with properly hashed password
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const admin = {
      email: 'superadmin@forms.com',
      password: hashedPassword,
      role: 'super_admin',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await admins.insertOne(admin);
    console.log('✅ Super admin created successfully!');
    console.log('Email: superadmin@forms.com');
    console.log('Password: admin123');
    console.log('Hashed password:', hashedPassword);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

createSuperAdmin();