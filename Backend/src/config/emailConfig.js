// Email configuration for development
export const emailConfig = {
  // Gmail SMTP configuration
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  },
  
  // Alternative: Custom SMTP
  // host: 'smtp.gmail.com',
  // port: 587,
  // secure: false,
  // auth: {
  //   user: process.env.EMAIL_USER,
  //   pass: process.env.EMAIL_PASS
  // }
};

// Frontend URL for reset password links
export const frontendConfig = {
  baseUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  resetPasswordPath: '/reset-password'
};

// Email templates configuration
export const emailTemplates = {
  from: process.env.EMAIL_USER || 'your-email@gmail.com',
  companyName: 'Chess Collection',
  supportEmail: 'support@chesscollection.com'
};

