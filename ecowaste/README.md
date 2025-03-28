This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Technologies Used

### Frontend
- **Next.js 14** - React framework with App Router for server-side rendering and routing
- **React** - JavaScript library for building user interfaces
- **Tailwind CSS** - Utility-first CSS framework for styling
- **Clerk** - Authentication and user management

### Backend & Database
- **MongoDB** - NoSQL database for storing application data
- **MongoDB Atlas** - Cloud database service
- **Next.js API Routes** - Backend API endpoints

### Maps & Location
- **Google Maps API** - For location-based features and mapping

### Development & Deployment
- **TypeScript** - Static type checking
- **ESLint** - Code linting
- **Environment Variables** - For secure configuration management
- **Vercel** - Deployment platform

### Key Features
- User authentication and authorization
- Waste management project proposals
- Contact form functionality
- Responsive design
- Custom logging system
- Interactive maps integration

### Development Tools
- Git - Version control
- npm - Package management
- VS Code - Code editor (recommended)

## Work Distribution

### Harsh's Responsibilities
1. Frontend Development
   - Landing page implementation
   - User interface design with Tailwind CSS
   - Navigation and routing setup
   - Form components and validation
   - Maps integration with Google Maps API

2. Authentication & User Management 
   - Clerk authentication integration
   - User profile features
   - Protected routes setup
   - Authorization flows

3. Documentation
   - API documentation
   - Setup instructions
   - Frontend component documentation

### Dhwanil's Responsibilities
1. Backend Development
   - MongoDB database setup and management
   - API routes implementation
   - Data models and schemas
   - Custom logging system
   - Environment variables configuration

2. Project Management
   - Database administration
   - Deployment configuration
   - Performance optimization
   - Security implementation

3. Testing & Quality Assurance
   - Backend testing
   - API endpoint testing
   - Error handling
   - Code review

### Shared Responsibilities
- Code reviews
- Bug fixes
- Project planning and coordination
- Documentation updates
- Deployment management
- Security audits

## HTTPS Setup

To run the application with HTTPS locally, follow these steps:

1. Generate SSL certificates:
   ```bash
   npm run gen-cert
   ```

2. Start the development server with HTTPS:
   ```bash
   npm run dev:https
   ```

3. Alternatively, use the custom HTTPS server:
   ```bash
   node server.js
   ```

4. Open your browser and visit `https://localhost:3000`

Note: Your browser might show a security warning because the certificate is self-signed. This is normal for local development. Click "Advanced" and then "Proceed to localhost (unsafe)" to continue.

For production, you should use a proper SSL certificate from a trusted certificate authority.


## About Our Website

Our waste management platform is a comprehensive solution built with modern web technologies to help communities manage waste more effectively.

### Tech Stack

- **Frontend**: 
  - Next.js 13+ with React
  - TypeScript for type safety
  - Tailwind CSS for styling
  - Clerk for authentication

- **Backend**:
  - Node.js
  - MongoDB for database
  - Next.js API routes
  - Custom logging system

### Key Features

1. User Management
   - Secure authentication via Clerk
   - User roles (Admin, Regular users)
   - Profile management
   - Session handling

2. Project Management System
   - Create waste management project proposals
   - Multiple categories (segregation, disposal, sanitization)
   - Project visibility controls (public, private, moderated)
   - Budget and timeline tracking
   - Contact information management

3. Admin Dashboard
   - Project approval workflow
   - User activity monitoring
   - System logs viewing
   - Administrative controls
   - Performance metrics

4. Activity Logging
   - Detailed user action tracking
   - IP address logging
   - Timestamp recording
   - Activity categorization
   - Filtered log viewing

5. Security Features
   - HTTPS support
   - Protected API routes
   - Role-based access control
   - Input validation
   - Error handling

6. Data Management
   - MongoDB integration
   - Efficient data querying
   - Pagination support
   - Data filtering capabilities
   - Real-time updates

### Languages and Technologies

- TypeScript
- JavaScript
- HTML5
- CSS3/Tailwind CSS
- MongoDB Query Language
- JSON
- Markdown

### Development Tools

- Git for version control
- npm for package management
- ESLint for code linting
- Development and production environments
- Custom development scripts

### Browser Support

The application is optimized for modern browsers including:
- Chrome
- Firefox
- Safari
- Edge

### Mobile Responsiveness

The platform is fully responsive and works across:
- Desktop computers
- Tablets
- Mobile phones
- Various screen sizes

### Performance Optimization

- Server-side rendering
- Static page generation where applicable
- Image optimization
- Code splitting
- Lazy loading
- Caching strategies


### Data Fetching Logic Implementation

#### Frontend Data Fetching (Harsh)

1. API Client Setup
   - Configure base API client using fetch/axios
   - Setup request interceptors
   - Handle authentication headers
   - Implement response error handling

2. React Query Implementation
   - Setup React Query providers
   - Configure query caching
   - Implement infinite scroll queries
   - Handle query invalidation

3. State Management
   - Manage loading states
   - Handle error states
   - Cache management
   - Optimistic updates

4. Custom Hooks
   - useProjects hook for project data
   - useUser hook for user data
   - useAdmin hook for admin features
   - usePagination hook for list data

#### Backend Data Processing (Dhwanil)

1. Database Operations
   - Optimize MongoDB queries
   - Implement aggregation pipelines
   - Handle database connections
   - Query caching layer

2. API Response Formatting
   - Standardize response structure
   - Implement data transformers
   - Handle pagination metadata
   - Error response formatting

3. Performance Optimization
   - Query optimization
   - Response compression
   - Rate limiting
   - Cache headers

4. Data Validation
   - Input sanitization
   - Schema validation
   - Type checking
   - Error handling

### Shared Data Responsibilities

- API Documentation
- Performance Monitoring
- Security Reviews
- Data Structure Design




