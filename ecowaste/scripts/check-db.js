const mongoose = require('mongoose');

async function checkDBConnection() {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecowaste';
  console.log(`Attempting to connect to MongoDB at ${MONGODB_URI.split('@').pop()}`);
  
  try {
    await mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    
    console.log('Connected to MongoDB successfully!');
    console.log('Connection details:');
    console.log(`- Database name: ${mongoose.connection.name}`);
    console.log(`- Connection state: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Not connected'}`);
    
    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`- Collections (${collections.length}): ${collections.map(c => c.name).join(', ')}`);
    
    // Try a simple query
    console.log('\nTesting a simple query (users collection):');
    const userCount = await mongoose.connection.db.collection('users').countDocuments();
    console.log(`- Found ${userCount} users in the database`);
    
    return true;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error.message);
    if (error.name === 'MongoNetworkError') {
      console.error('\nThis error usually indicates that MongoDB is not running or not accessible.');
      console.error('Please ensure MongoDB is running with:');
      console.error('- mongod --dbpath <path-to-data-directory>');
      console.error('\nOr if using MongoDB Atlas, check your network connection and credentials.');
    }
    return false;
  } finally {
    // Close the connection to allow the script to exit
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('\nMongoDB connection closed');
    }
  }
}

// Run the check function
checkDBConnection()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
  }); 