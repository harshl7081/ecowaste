require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

// Define schemas (should match your models)
const UserSchema = new mongoose.Schema({
  clerkId: { type: String, required: true, unique: true },
  firstName: String,
  lastName: String,
  email: String,
  imageUrl: String,
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const ProjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  location: { type: String, required: true },
  budget: { type: Number, required: true },
  timeline: { type: String, required: true },
  contactName: { type: String, required: true },
  contactEmail: { type: String, required: true },
  contactPhone: { type: String },
  userId: { type: String, required: true },
  userEmail: { type: String, required: true },
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const CommentSchema = new mongoose.Schema({
  projectId: { type: String, required: true },
  userId: { type: String, required: true },
  userEmail: { type: String, required: true },
  userName: { type: String, required: true },
  content: { type: String, required: true },
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

async function migrateData() {
  try {
    console.log('Starting migration from clerk-app to ecowaste...');
    
    // Connect to source database (clerk-app)
    const sourceUri = 'mongodb://localhost:27017/clerk-app';
    const sourceConnection = await mongoose.createConnection(sourceUri);
    console.log('Connected to source database (clerk-app)');
    
    // Connect to target database (ecowaste)
    const targetUri = 'mongodb://localhost:27017/ecowaste';
    const targetConnection = await mongoose.createConnection(targetUri);
    console.log('Connected to target database (ecowaste)');

    // Initialize models on source connection
    const SourceUser = sourceConnection.model('User', UserSchema);
    const SourceProject = sourceConnection.model('Project', ProjectSchema);
    const SourceComment = sourceConnection.model('Comment', CommentSchema);

    // Initialize models on target connection
    const TargetUser = targetConnection.model('User', UserSchema);
    const TargetProject = targetConnection.model('Project', ProjectSchema);
    const TargetComment = targetConnection.model('Comment', CommentSchema);

    // 1. Migrate Users
    console.log('\nMigrating users...');
    const users = await SourceUser.find({});
    console.log(`Found ${users.length} users to migrate`);
    
    for (const user of users) {
      // Check if user already exists in target database
      const existingUser = await TargetUser.findOne({ clerkId: user.clerkId });
      
      if (existingUser) {
        console.log(`User ${user.email} (${user.clerkId}) already exists in ecowaste, updating...`);
        await TargetUser.updateOne(
          { clerkId: user.clerkId },
          { 
            $set: {
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              imageUrl: user.imageUrl,
              role: user.role,
              updatedAt: new Date()
            }
          }
        );
      } else {
        console.log(`Migrating user ${user.email} (${user.clerkId})...`);
        const userData = user.toObject();
        delete userData._id; // Remove MongoDB ID to let the target DB generate a new one
        await TargetUser.create(userData);
      }
    }

    // 2. Migrate Projects
    console.log('\nMigrating projects...');
    const projects = await SourceProject.find({});
    console.log(`Found ${projects.length} projects to migrate`);

    for (const project of projects) {
      // Check if project already exists in target database
      const existingProject = await TargetProject.findOne({ 
        title: project.title,
        userId: project.userId 
      });
      
      if (existingProject) {
        console.log(`Project "${project.title}" already exists in ecowaste, skipping...`);
      } else {
        console.log(`Migrating project "${project.title}"...`);
        const projectData = project.toObject();
        delete projectData._id;
        await TargetProject.create(projectData);
      }
    }

    // 3. Migrate Comments
    console.log('\nMigrating comments...');
    const comments = await SourceComment.find({});
    console.log(`Found ${comments.length} comments to migrate`);

    for (const comment of comments) {
      // Check if comment already exists in target database
      const existingComment = await TargetComment.findOne({ 
        projectId: comment.projectId,
        userId: comment.userId,
        content: comment.content
      });
      
      if (existingComment) {
        console.log(`Comment by ${comment.userName} already exists in ecowaste, skipping...`);
      } else {
        console.log(`Migrating comment by ${comment.userName}...`);
        const commentData = comment.toObject();
        delete commentData._id;
        await TargetComment.create(commentData);
      }
    }

    console.log('\nMigration completed successfully!');
    
    // Print summary
    const sourceCounts = {
      users: await SourceUser.countDocuments(),
      projects: await SourceProject.countDocuments(),
      comments: await SourceComment.countDocuments()
    };
    
    const targetCounts = {
      users: await TargetUser.countDocuments(),
      projects: await TargetProject.countDocuments(),
      comments: await TargetComment.countDocuments()
    };
    
    console.log('\nMigration Summary:');
    console.log('Source Database (clerk-app):');
    console.log(`- Users: ${sourceCounts.users}`);
    console.log(`- Projects: ${sourceCounts.projects}`);
    console.log(`- Comments: ${sourceCounts.comments}`);
    
    console.log('\nTarget Database (ecowaste):');
    console.log(`- Users: ${targetCounts.users}`);
    console.log(`- Projects: ${targetCounts.projects}`);
    console.log(`- Comments: ${targetCounts.comments}`);
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    // Close all mongoose connections
    await mongoose.disconnect();
    console.log('\nDatabase connections closed');
  }
}

// Run the migration
migrateData()
  .then(() => {
    console.log('Migration script finished');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error during migration:', err);
    process.exit(1);
  }); 