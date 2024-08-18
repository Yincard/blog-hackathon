# Blogify

Blogify is a modern blogging platform that allows users to create, share, and manage their blog content effortlessly. With a sleek and intuitive design, Blogify leverages React.js, Next.js, Firebase, and MySQL to deliver a seamless user experience for content creation and management.

## Project Overview

Blogify is a web application where users can:
- **Post Blogs**: Create and share blog posts with text and images.
- **Search and Filter**: Easily find and view posts based on usernames.
- **Manage Profiles**: Update user profiles and profile pictures.
- **Secure Authentication**: Log in and sign up with Firebase Authentication.

## Features

- **Blog Creation**: Users can write and post blogs, including uploading images.
- **User Authentication**: Secure login and user management via Firebase Authentication.
- **Search Functionality**: Filter and search for posts by username.
- **Profile Management**: Edit and update user profiles.
- **Responsive Design**: Mobile-friendly and accessible design.

## Tech Stack

- **Front-end**: React.js, Next.js, CSS Modules
- **Back-end**: Node.js, Firebase (for authentication and storage)
- **Database**: MySQL, Prisma ORM
- **Deployment**: Vercel (for front-end deployment)

## Getting Started

To set up a local environment for Blogify, follow these instructions:

### Prerequisites

- Node.js (v18 or later)
- MySQL
- Firebase project setup

### Installation

1. **Clone the Repository:**
    ```bash
    git clone https://github.com/Yincard/blog-hackathon.git
    cd blog-hackathon
    ```

2. **Install Dependencies:**
    ```bash
    npm install
    ```

3. **Configure Firebase:**
   - Create a Firebase project and configure it.
   - Add your Firebase configuration to the `firebase.js` file located in the `src` directory.

4. **Set Up Environment Variables:**
   Create a `.env.local` file in the root directory with your Firebase and MySQL environment variables:
    ```
    NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
    NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
    DATABASE_URL=your-database-url
    ```

5. **Set Up MySQL Database:**
   - Create a MySQL database and update the Prisma schema in `prisma/schema.prisma`.
   - Apply Prisma migrations:
     ```bash
     npx prisma migrate dev
     ```

6. **Run the Development Server:**
    ```bash
    npm run dev
    ```
   - Visit [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

- **Creating Posts**: Click the "Post" button to add new blog content.
- **Searching Posts**: Use the search bar to filter posts by username.
- **Managing Profiles**: Update your profile through the sidebar.
