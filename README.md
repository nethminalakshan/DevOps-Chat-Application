# MERN Stack Chat Application 💬

A full-featured real-time chat application built with the MERN stack (MongoDB, Express, React, Node.js), Socket.io, and OAuth authentication.

## ✨ Features

### Core Features
- 🔐 **OAuth Authentication** - Sign in with Google or GitHub
- 💬 **Real-time Messaging** - Instant message delivery using Socket.io
- 👥 **Group Chats** - Create and manage group conversations
- 📁 **File Sharing** - Share images and files (up to 5MB)
- 🔍 **Message Search** - Search through your message history
- 😊 **Emoji Support** - Express yourself with emojis

### User Experience
- 👤 **User Profiles** - Customizable profiles with avatars and bio
- 🟢 **Online Status** - See who's online/offline in real-time
- ⌨️ **Typing Indicators** - Know when someone is typing
- 🔔 **Notifications** - Get notified about new messages
- 📱 **Responsive Design** - Works on desktop and mobile
- 🎨 **Modern UI** - Beautiful interface with Tailwind CSS

## 🛠️ Tech Stack

### Backend
- **Node.js** & **Express.js** - Server framework
- **MongoDB** & **Mongoose** - Database
- **Socket.io** - Real-time communication
- **Passport.js** - OAuth authentication
- **JWT** - Token-based authentication
- **Multer** - File upload handling

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **React Router** - Navigation
- **Axios** - HTTP client
- **Socket.io Client** - Real-time updates
- **Emoji Picker React** - Emoji selection
- **React Hot Toast** - Notifications
- **date-fns** - Date formatting

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB Atlas account** (or local MongoDB)
- **Google OAuth credentials** ([Get them here](https://console.cloud.google.com/))
- **GitHub OAuth credentials** ([Get them here](https://github.com/settings/developers))

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd "DevOps Chat application"
```

### 2. Install Dependencies

Install all dependencies for both server and client:

```bash
npm run install-all
```

Or install separately:

```bash
# Root dependencies
npm install

# Server dependencies
cd server
npm install

# Client dependencies
cd ../client
npm install
```

### 3. Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier available)
3. Create a database user
4. Whitelist your IP address (or use 0.0.0.0/0 for development)
5. Get your connection string

### 4. Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Add authorized redirect URI: `http://localhost:5000/api/auth/google/callback`
6. Copy your Client ID and Client Secret

### 5. Set Up GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the details:
   - Application name: Your App Name
   - Homepage URL: `http://localhost:5173`
   - Authorization callback URL: `http://localhost:5000/api/auth/github/callback`
4. Copy your Client ID and Client Secret

### 6. Configure Environment Variables

The `.env` file in the `server` folder has been created for you. Update it with your credentials:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# MongoDB Atlas - REPLACE WITH YOUR ACTUAL CONNECTION STRING
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/chat-app?retryWrites=true&w=majority

# JWT Secret - CHANGE THIS
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_make_it_long_and_random

# OAuth - Google
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# OAuth - GitHub
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:5000/api/auth/github/callback

# Session Secret - CHANGE THIS
SESSION_SECRET=your_session_secret_change_this_in_production_make_it_random

# File Upload (5MB max)
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp,application/pdf
```

**Important:** Replace the placeholder values with your actual credentials!

### 7. Run the Application

#### Development Mode (Recommended)

Run both server and client concurrently:

```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:5000`
- Frontend dev server on `http://localhost:5173`

#### Run Separately

```bash
# Terminal 1 - Run server
npm run server

# Terminal 2 - Run client
npm run client
```

### 8. Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

## 📁 Project Structure

```
DevOps Chat application/
├── client/                    # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   │   ├── chat/        # Chat-specific components
│   │   │   └── ProtectedRoute.jsx
│   │   ├── pages/           # Page components
│   │   ├── services/        # API & Socket services
│   │   ├── store/           # Zustand state management
│   │   ├── config/          # Configuration files
│   │   ├── App.jsx          # Main app component
│   │   ├── main.jsx         # Entry point
│   │   └── index.css        # Global styles
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── server/                   # Node.js backend
│   ├── config/              # Configuration files
│   │   ├── database.js      # MongoDB connection
│   │   └── passport.js      # OAuth strategies
│   ├── middleware/          # Custom middleware
│   │   ├── auth.js          # JWT authentication
│   │   └── upload.js        # File upload
│   ├── models/              # Mongoose models
│   │   ├── User.js
│   │   ├── Conversation.js
│   │   ├── Message.js
│   │   └── Notification.js
│   ├── routes/              # API routes
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── conversations.js
│   │   ├── messages.js
│   │   └── notifications.js
│   ├── socket/              # Socket.io handlers
│   │   └── socketHandler.js
│   ├── uploads/             # File uploads directory
│   ├── server.js            # Main server file
│   ├── package.json
│   └── .env                 # Environment variables
│
├── package.json             # Root package.json
├── .gitignore
└── README.md
```

## 🔑 Key Components

### Backend

- **Models**: Define MongoDB schemas for User, Conversation, Message, and Notification
- **Routes**: RESTful API endpoints for authentication, users, conversations, messages, and notifications
- **Socket Handlers**: Real-time event handlers for messaging, typing indicators, and online status
- **Middleware**: Authentication (JWT), file upload (Multer), and error handling

### Frontend

- **Pages**: Login, AuthSuccess, and Chat
- **Components**: 
  - Sidebar: Conversation list and search
  - ChatWindow: Message display and input
  - MessageList: Scrollable message history
  - NotificationPanel: Notification center
  - UserProfile: User settings
- **Stores**: Zustand stores for auth, chat, and notifications
- **Services**: API client (Axios) and Socket.io client

## 🎯 Usage Guide

### Creating a Conversation

1. Click the "+" button in the sidebar
2. Search for users
3. Select one user for private chat or multiple for group chat
4. Click "Create"

### Sending Messages

1. Select a conversation from the sidebar
2. Type your message in the input field
3. Press Enter or click the send button

### Sending Files

1. Click the paperclip icon
2. Select an image or PDF file (max 5MB)
3. File will be uploaded and sent automatically

### Using Emojis

1. Click the smile icon
2. Select an emoji from the picker
3. Emoji will be added to your message

### Searching Messages

1. Click the search icon in the chat header
2. Enter your search query
3. View matching messages

## 🔧 API Endpoints

### Authentication
- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/github` - Initiate GitHub OAuth
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Users
- `GET /api/users` - Get all users (with search)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/profile` - Update profile
- `PUT /api/users/status` - Update status

### Conversations
- `GET /api/conversations` - Get all conversations
- `POST /api/conversations` - Create conversation
- `GET /api/conversations/:id` - Get conversation by ID
- `PUT /api/conversations/:id` - Update group conversation
- `DELETE /api/conversations/:id` - Delete conversation

### Messages
- `GET /api/messages/conversation/:id` - Get messages
- `POST /api/messages` - Send text message
- `POST /api/messages/upload` - Upload file
- `GET /api/messages/search` - Search messages
- `PUT /api/messages/read/:conversationId` - Mark as read
- `DELETE /api/messages/:id` - Delete message

### Notifications
- `GET /api/notifications` - Get all notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

## 🔌 Socket.io Events

### Client → Server
- `user:join` - User connects
- `conversation:join` - Join conversation room
- `conversation:leave` - Leave conversation room
- `message:send` - Send a message
- `typing:start` - Start typing
- `typing:stop` - Stop typing
- `message:read` - Mark messages as read
- `user:status:update` - Update user status

### Server → Client
- `message:new` - New message received
- `user:status` - User status changed
- `typing:update` - Typing indicator update
- `notification:new` - New notification
- `message:read` - Messages marked as read

## 🚢 Deployment

### Backend Deployment (Railway/Render/Heroku)

1. Create a new app on your platform
2. Add environment variables from `.env`
3. Deploy from Git repository
4. Update `CLIENT_URL` to your frontend URL

### Frontend Deployment (Vercel/Netlify)

1. Build the client:
   ```bash
   cd client
   npm run build
   ```
2. Deploy the `dist` folder
3. Update backend `CLIENT_URL` to your deployed URL

### Environment Variables for Production

Make sure to update these for production:
- Use strong, random values for `JWT_SECRET` and `SESSION_SECRET`
- Update callback URLs to production URLs
- Set `NODE_ENV=production`

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Error**
- Check your MongoDB URI format
- Ensure IP is whitelisted in MongoDB Atlas
- Verify username and password

**OAuth Not Working**
- Check redirect URIs match exactly
- Ensure credentials are correct
- Verify OAuth app is enabled

**Socket Connection Failed**
- Check CORS settings
- Verify server is running
- Check firewall settings

**File Upload Fails**
- Check file size (max 5MB)
- Verify file type is allowed
- Ensure uploads directory exists

## 📝 License

This project is licensed under the ISC License.

## 👨‍💻 Author

Created with ❤️ for learning and development purposes.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📞 Support

For support, please open an issue in the repository.

---

**Happy Chatting! 🎉**
