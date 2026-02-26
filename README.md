# BritSyncAI Academy - Multi-Instructor Learning Platform

A comprehensive Coursera-style learning management system built with FastAPI, React, and MongoDB.

![BritSyncAI Academy](https://img.shields.io/badge/BritSyncAI_Academy-Learning%20Platform-10b981)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110.1-009688)
![React](https://img.shields.io/badge/React-18-61dafb)
![MongoDB](https://img.shields.io/badge/MongoDB-6.0-47a248)

## 🌟 Features

### For Students
- 📚 **Course Catalog** - Browse and search courses by category
- 💳 **Secure Payments** - Stripe integration with coupon support
- 📝 **Interactive Quizzes** - Test your knowledge with auto-grading
- 🎓 **Certificates** - Earn beautiful PDF certificates on completion
- 💬 **Course Reviews** - Rate and review courses (1-5 stars)
- 🤖 **AI Tutor** - Get help from AI-powered chatbot
- 📊 **Progress Tracking** - Track your learning progress
- 🎥 **Video Lessons** - Watch video, read text, or download PDFs
- 📅 **Live Classes** - Join scheduled live sessions
- 🏆 **Student Dashboard** - View enrollments and certificates

### For Instructors
- ✏️ **Course Creation** - Create courses with sections and lessons
- 📂 **Content Management** - Upload videos, PDFs, and text content
- 🧪 **Quiz Builder** - Create multiple-choice quizzes
- 📅 **Live Class Scheduling** - Schedule live sessions with meeting links
- 💰 **Earnings Dashboard** - Track revenue and enrollment
- 📈 **Course Analytics** - View student progress and engagement
- 🎯 **Course Structure** - Organize content with sections

### For Admins
- 👥 **User Management** - Manage users, roles, and permissions
- 🏫 **Instructor Approval** - Review and approve instructor applications
- 📚 **Course Moderation** - Approve/reject courses
- ⭐ **Featured Courses** - Feature popular courses on homepage
- 🎟️ **Coupon Management** - Create and manage discount coupons
- 📊 **Platform Analytics** - View revenue, users, and course stats

## 🚀 Quick Deploy

**For complete deployment instructions with your custom domain, see [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)**

### Automated Deploy (Ubuntu 22.04)

```bash
wget https://raw.githubusercontent.com/Ali-Hamas/AI-Learn-Hub/main/deploy.sh
chmod +x deploy.sh
./deploy.sh
```

The deployment guide includes:
- Complete server setup
- Database configuration (MongoDB Atlas or local)
- Backend & frontend deployment
- Nginx reverse proxy setup
- SSL certificate installation
- Third-party integrations (Stripe, SendGrid, OpenAI)
- Domain configuration
- Security hardening
- Monitoring setup
- Troubleshooting

## 📋 Quick Start (Development)

```bash
# Backend
cd backend
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
# Copy and edit .env file
uvicorn server:app --reload --port 8001

# Frontend
cd frontend
npm install
# Copy and edit .env file
npm start
```

## 🔧 Configuration

### Key Environment Variables

**Backend (.env):**
```bash
MONGO_URL=mongodb://localhost:27017  # or Atlas URI
JWT_SECRET=your-secret-key
STRIPE_SECRET_KEY=sk_test_...
SENDGRID_API_KEY=SG...
OPENAI_API_KEY=sk-...
```

**Frontend (.env):**
```bash
REACT_APP_BACKEND_URL=https://yourdomain.com
```

## 📚 Documentation

- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Complete production deployment guide
- **[API Docs](http://localhost:8001/docs)** - Interactive API documentation
- **[deploy.sh](deploy.sh)** - Automated deployment script

## 🏗️ Tech Stack

- **Backend**: FastAPI (Python 3.11), MongoDB, Pydantic, JWT
- **Frontend**: React 18, Tailwind CSS, Shadcn UI, Axios
- **Integrations**: Stripe, SendGrid, OpenAI GPT-5
- **Deployment**: Nginx, PM2, Let's Encrypt SSL

## 📊 Project Status

✅ **Phase 1 Complete** - All core features implemented
- User authentication & authorization
- Course creation & management
- Payment processing with coupons
- Quiz system with certificates (PDF)
- Reviews & ratings
- Admin panel (complete)
- AI tutor integration

## 🔒 Security

- JWT authentication
- Bcrypt password hashing
- Role-based access control
- HTTPS/SSL encryption
- Input validation
- CORS configuration

## 📄 License

Proprietary software. All rights reserved.

## 📞 Support

For deployment help, see [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for:
- Step-by-step server setup
- Domain & SSL configuration
- Third-party service setup
- Troubleshooting guides
- Maintenance commands

---

**Built with ❤️ for educators and learners worldwide**
