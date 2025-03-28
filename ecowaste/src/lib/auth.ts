// Helper function to check if a user is an admin
export async function isAdmin(userId: string): Promise<boolean> {
  console.log("Checking admin status for userId:", userId);
  
  if (!userId) {
    console.log("No userId provided, returning false");
    return false;
  }
  
  // This is a simple implementation for development that considers hardcoded admin IDs
  // In a production environment, you would typically check a database or use Clerk's roles
  
  // List of admin user IDs
  const adminIds = [
    process.env.ADMIN_USER_ID || 'user_2bLCcUosPl1mCH3UW5kNoMahkRj', // Replace with your actual admin ID
    'user_2cCiK6j0W8zQd8iGMacfwdTMDFF', // Test ID 1
    'user_2cCiLCuknWEBjlCilzXQuV0vQ2o', // Test ID 2
  ];
  
  console.log("Admin IDs:", adminIds);
  const isUserAdmin = adminIds.includes(userId);
  console.log("Is user admin?", isUserAdmin);
  
  return isUserAdmin;
} 