# Listing Pal - Phase 1

A modern real estate AI platform featuring intelligent room redesign, listing generation, and social media content creation.

## 🚀 Features

- **AI Room Redesign**: Transform interior spaces using Decor8AI technology
- **Listing Management**: Create and manage property listings
- **Content Generation**: Generate descriptions, social media posts, and marketing content
- **User Authentication**: Secure Firebase-based authentication
- **Responsive Design**: Modern UI with Tailwind CSS

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS
- **Backend**: Node.js, Express.js
- **AI Services**: Decor8AI API for interior design
- **Image Storage**: Cloudinary
- **Authentication**: Firebase
- **Database**: Firebase Firestore

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Git

## 🔧 Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/brownzinoart/realtyboost-ai-phase-1.git
   cd realtyboost-ai-phase-1
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:

   ```bash
   cp env.template .env
   ```

   Update the `.env` file with your API keys:

   ```env
   # Decor8AI - Interior Design AI
   DECOR8AI_API_KEY=your_decor8ai_api_key_here

   # Cloudinary - Image Storage
   CLOUDINARY_CLOUD_NAME=your_cloud_name_here
   CLOUDINARY_API_KEY=your_api_key_here
   CLOUDINARY_API_SECRET=your_api_secret_here
   ```

## 🚀 Quick Start

### Development Mode

1. **Start the backend server**

   ```bash
   npm run server:dev
   ```

2. **Start the frontend (in a new terminal)**

   ```bash
   npm run dev
   ```

3. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001

### Production Mode

```bash
npm run build
npm start
```

## 🔑 API Configuration

### Decor8AI Setup

1. Visit [decor8.ai](https://www.decor8.ai) to get your API key
2. Add your API key to the `.env` file
3. The API supports room redesign with various styles and room types

### Cloudinary Setup

1. Create account at [cloudinary.com](https://cloudinary.com)
2. Get your cloud name, API key, and secret from the dashboard
3. Add credentials to `.env` file

## 📁 Project Structure

```
realtyboost-ai-phase-1/
├── components/           # React components
│   ├── auth/            # Authentication components
│   ├── dashboard/       # Dashboard components
│   ├── listings/        # Listing management
│   └── shared/          # Shared/common components
├── contexts/            # React contexts
├── services/            # API services
├── decor8ai-sdk/        # Decor8AI Python SDK
├── dist/                # Build output
├── server.js            # Express backend server
├── vite.config.ts       # Vite configuration
└── README.md
```

## 🎨 Room Redesign Feature

The AI Room Redesign feature allows users to:

- Upload room photos
- Select room type (bedroom, living room, kitchen, etc.)
- Choose design style (modern, scandinavian, industrial, etc.)
- Generate AI-powered redesigned rooms
- Save and manage redesigns

## 🧪 Testing

### Health Check

```bash
curl http://localhost:3001/api/health
```

### API Endpoints

- `GET /api/health` - Service health check
- `GET /api/styles` - Available room types and design styles
- `POST /api/redesign` - Upload and redesign room image
- `POST /api/test-design` - Test with sample image

## 🔄 Development Workflow

1. **Create feature branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes and test**

   ```bash
   npm run dev
   ```

3. **Commit changes**

   ```bash
   git add .
   git commit -m "Add your feature description"
   ```

4. **Push and create pull request**
   ```bash
   git push origin feature/your-feature-name
   ```

## 📝 Environment Variables

| Variable                | Description                        | Required |
| ----------------------- | ---------------------------------- | -------- |
| `DECOR8AI_API_KEY`      | Decor8AI API key for room redesign | Yes      |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name              | Yes      |
| `CLOUDINARY_API_KEY`    | Cloudinary API key                 | Yes      |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret              | Yes      |
| `PORT`                  | Server port (default: 3001)        | No       |

## 🐛 Troubleshooting

### Common Issues

1. **"Unexpected end of JSON input"**

   - Ensure backend server is running on port 3001
   - Check proxy configuration in vite.config.ts

2. **Cloudinary upload errors**

   - Verify cloudinary credentials in .env
   - Check network connection

3. **Decor8AI API errors**
   - Verify API key is valid
   - Check account credits/subscription

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is private and proprietary.

## 📞 Support

For support and questions, contact: brownzinoart@gmail.com
