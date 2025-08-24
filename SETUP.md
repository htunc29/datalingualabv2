# Survey Builder - Google Forms Clone

A full-stack web application built with Next.js that allows creating and managing surveys with text, audio, and file upload responses, similar to Google Forms.

## Features

### ✅ **New Enhanced Features:**
- **🔐 Admin Authentication**: Secure login system with default admin credentials
- **📁 File Upload Support**: Allow users to upload files with customizable extensions and size limits
- **🎙️ Enhanced Audio Recording**: 
  - Configurable recording time limits (1-30 minutes)
  - Optional re-recording capability
  - Real-time recording timer with warnings
- **⚙️ Advanced Question Settings**: Fine-tune each question type with specific options

### **Core Features:**
- **Admin Panel**: Create, manage, and delete surveys with authentication
- **Multiple Question Types**: 
  - Short answer (single line text)
  - Long answer (multi-line text) 
  - Multiple choice (radio buttons)
  - Audio recording (with advanced settings)
  - **NEW:** File upload (with extension filtering)
- **Audio Recording**: Record voice responses directly in the browser
- **Shareable Links**: Generate unique URLs for each survey
- **Response Management**: View all responses with audio playback and file downloads
- **Data Export**: Export responses as JSON or CSV
- **Modern UI**: Clean, responsive design with Tailwind CSS
- **Authentication**: Secure admin panel access

## Tech Stack

- **Frontend**: Next.js 15 with App Router, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API routes
- **Database**: MongoDB with Mongoose ODM
- **File Storage**: Local file system for audio recordings
- **Audio**: Web Audio API for browser-based recording

## Prerequisites

- Node.js 18+ 
- MongoDB (running locally on default port 27017)

## Installation & Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up MongoDB**:
   - Install MongoDB locally or use MongoDB Compass
   - Make sure MongoDB is running on `mongodb://localhost:27017`
   - The database `survey-app` will be created automatically

3. **Environment Configuration**:
   - The `.env.local` file is already configured for local MongoDB
   - No additional setup needed for local development

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open the application**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Default Admin Credentials

The application automatically creates a default admin account on first run:

- **Username**: `admin`
- **Password**: `1234`

**Important**: Change these credentials in production!

## Usage

### Creating Surveys

1. Go to the home page and click "Go to Admin Panel"
2. **Login** with admin credentials (admin/1234)
3. Click "Create New Survey"
4. Fill in survey title and description
5. Add questions by clicking "Add Question"
6. Configure each question:
   - Choose question type
   - Enter question text
   - For multiple choice, add options
   - **NEW:** For audio questions, set recording time limit and re-record permissions
   - **NEW:** For file uploads, specify allowed extensions and file size limits
   - Mark as required if needed
7. Click "Create Survey"

### Sharing Surveys

1. In the admin panel, find your survey
2. Click "View Survey" to open the public survey page
3. Copy the URL to share with respondents
4. The URL format is: `/survey/[shareable-id]`

### Collecting Responses

- Users can access surveys via the shareable link
- All question types are supported:
  - Text responses (short and long)
  - Multiple choice selections
  - **NEW:** File uploads with validation
  - Audio recording with configurable time limits
- **NEW:** Enhanced audio recording with timer and re-record options
- **NEW:** File drag-and-drop with extension validation
- Responses are submitted and stored in MongoDB with files saved locally

### Viewing Responses

1. In the admin panel, click "View Responses" for any survey
2. See all responses with timestamps
3. Play audio responses directly in the browser
4. **NEW:** Download uploaded files from responses
5. Download individual audio files
6. Export all responses as JSON or CSV

## Key Features

- **Audio Recording**: Uses Web Audio API for high-quality voice recording
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Feedback**: Immediate validation and error handling
- **Data Export**: Export survey results in multiple formats
- **Clean Architecture**: Well-organized code structure with TypeScript

## Browser Compatibility

- Chrome/Chromium: Full support
- Firefox: Full support
- Safari: Full support (iOS 14.3+)
- Edge: Full support

Note: Audio recording requires HTTPS in production for security reasons.