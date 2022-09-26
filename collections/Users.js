const Users = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
  },
  auth: {
    tokenExpiration: 7200, // How many seconds to keep the user logged in
    maxLoginAttempts: 5, // Automatically lock a user out after X amount of failed logins
    lockTime: 600 * 1000, // Time period to allow the max login attempts
    // More options are available
  },
  access: {
    read: () => true,
  },
  fields: [
    // Email added by default
    // Add more fields as needed
  ],
};

export default Users;