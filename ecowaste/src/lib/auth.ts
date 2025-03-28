// Helper function to check if a user is an admin
export async function isAdmin(userId: string): Promise<boolean> {
  if (!userId) return false;
  
  // This is a simple implementation for development that considers hardcoded admin IDs
  // In a production environment, you would typically check a database or use Clerk's roles
  
  // List of admin user IDs
  const adminIds = [
    process.env.ADMIN_USER_ID || 'user_2bLCcUosPl1mCH3UW5kNoMahkRj', // Replace with your actual admin ID
  ];
  
  return adminIds.includes(userId);
} 