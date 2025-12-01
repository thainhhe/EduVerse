# MinIO Media Upload & Streaming Application

Ứng dụng web full-stack cho phép upload tài liệu, video và streaming video sử dụng MinIO object storage, React + Vite frontend, Node.js + Express backend, và MongoDB.

## 🚀 Công nghệ sử dụng

- **Frontend**: React 18 + Vite
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **Object Storage**: MinIO
- **Video Streaming**: Progressive download

## 📋 Prerequisites

- Node.js 18+ và npm
- Docker và Docker Compose
- Git

## 🛠️ Installation

### 1. Clone repository

```bash
git clone <repository-url>
cd minio
```

### 2. Start Docker services (MinIO & MongoDB)

```bash
docker-compose up -d
```

Verify services are running:
- MinIO Console: http://localhost:9001 (username: `minioadmin`, password: `minioadmin123`)
- MongoDB: localhost:27017

### 3. Setup Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env if needed
npm run dev
```

Backend sẽ chạy tại: http://localhost:5000

### 4. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend sẽ chạy tại: http://localhost:5173

## 📁 Project Structure

```
minio/
├── backend/              # Node.js + Express API
│   ├── config/          # Database & MinIO config
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   └── server.js        # Entry point
├── frontend/            # React + Vite app
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── services/    # API services
│   │   └── App.jsx      # Main component
│   └── index.html
└── docker-compose.yml   # Docker services
```

## 🎯 Features

- ✅ Upload documents (PDF, DOCX, TXT, etc.)
- ✅ Upload videos (MP4, AVI, MOV, etc.)
- ✅ Video streaming từ MinIO
- ✅ Drag & drop upload
- ✅ Upload progress tracking
- ✅ Search và filter files
- ✅ Download files
- ✅ Delete files
- ✅ Modern, responsive UI với dark theme

## 🔌 API Endpoints

### Upload
- `POST /api/upload/document` - Upload document
- `POST /api/upload/video` - Upload video

### Files
- `GET /api/files` - Get all files
- `GET /api/files/:id` - Get file by ID
- `DELETE /api/files/:id` - Delete file
- `GET /api/search?q=query` - Search files

### Streaming
- `GET /api/stream/:id` - Stream video
- `GET /api/download/:id` - Download file

## 🐛 Troubleshooting

### MinIO connection error
- Verify Docker container is running: `docker ps`
- Check MinIO logs: `docker logs minio-server`

### MongoDB connection error
- Verify MongoDB container: `docker ps`
- Check MongoDB logs: `docker logs mongodb`

### Port already in use
- Change ports in `docker-compose.yml` or stop conflicting services

## 📝 License

MIT
