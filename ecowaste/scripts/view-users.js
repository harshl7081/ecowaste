require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function checkDatabase(dbName) {
  const MONGODB_URI = `mongodb://localhost:27017/${dbName}`;
  console.log(`\n===== Checking database: ${dbName} =====`);
  console.log(`Connecting to MongoDB at ${MONGODB_URI}`);
  
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully!');
    
    // Define User schema
    const UserSchema = new mongoose.Schema({
      clerkId: {
        type: String,
        required: true,
        unique: true,
      },
      firstName: String,
      lastName: String,
      email: String,
      imageUrl: String,
      role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      updatedAt: {
        type: Date,
        default: Date.now,
      },
    });

    // Create or get the User model
    const User = mongoose.models.User || mongoose.model('User', UserSchema);
    
    // Find all users
    const users = await User.find({});
    console.log(`Found ${users.length} users in the database:`);
    
    if (users.length === 0) {
      console.log('No users found in the database.');
    } else {
      users.forEach((user, index) => {
        console.log(`\nUser #${index + 1}:`);
        console.log(`ID: ${user._id}`);
        console.log(`Clerk ID: ${user.clerkId}`);
        console.log(`Name: ${user.firstName} ${user.lastName}`);
        console.log(`Email: ${user.email}`);
        console.log(`Role: ${user.role}`);
        console.log(`Created: ${user.createdAt}`);
      });
    }
    
    // Check collection stats
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\nCollections in database:');
    for (const collection of collections) {
      const count = await mongoose.connection.db.collection(collection.name).countDocuments();
      console.log(`- ${collection.name}: ${count} documents`);
    }
    
    return users;
  } catch (error) {
    console.error(`Failed to view users in ${dbName}:`, error);
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log(`\nMongoDB connection to ${dbName} closed`);
    }
  }
}

// Run the function for both databases
async function checkBothDatabases() {
  try {
    // Clear mongoose models to avoid conflicts
    Object.keys(mongoose.models).forEach(key => {
      delete mongoose.models[key];
    });
    
    // Check ecowaste database
    await checkDatabase('ecowaste');
    
    // Clear mongoose models again to avoid conflicts
    Object.keys(mongoose.models).forEach(key => {
      delete mongoose.models[key];
    });
    
    // Check clerk-app database
    await checkDatabase('clerk-app');
    
    console.log('\n===== SUMMARY =====');
    console.log('Your users are in the clerk-app database, but your app is now configured to use ecowaste.');
    console.log('You need to migrate your data from clerk-app to ecowaste.');
  } catch (err) {
    console.error('Error during database check:', err);
  }
}

// Run the checks
checkBothDatabases()
  .then(() => {
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  }); 