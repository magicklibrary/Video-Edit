# MagickLibrary Studio

AI-powered video editing platform. Upload raw content, get fully edited videos with subtitles, graphics, and optimization.

## Setup Instructions

### Local Development

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/YOUR_USERNAME/magicklibrary-studio.git
   cd magicklibrary-studio
   \`\`\`

2. **Set up environment variables**
   \`\`\`bash
   # Backend
   cp backend/.env.example backend/.env
   # Edit backend/.env with your API keys

   # Worker
   cp worker/.env.example worker/.env
   # Edit worker/.env with your API keys

   # Frontend
   cp frontend-web/.env.example frontend-web/.env.local
   # Edit with your backend URL
   \`\`\`

3. **Start services**
   \`\`\`bash
   docker-compose up
   \`\`\`

4. **Access the app**
   - Frontend: http://localhost:3001
   - API: http://localhost:3000
   - API Health: http://localhost:3000/health

### Production Deployment

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for production setup.

** NEVER commit .env files with real credentials!**

## Features

-  AI-powered video editing
-  Automatic audio enhancement
-  Smart subtitle generation
-  Brand system for consistency
-  Multi-platform optimization
-  Lightning-fast processing

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [API Documentation](docs/API.md)
- [Security Guide](docs/SECURITY.md)
- [Deployment Guide](docs/DEPLOYMENT.md)

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Node.js, Fastify, PostgreSQL
- **Worker**: Python, FFmpeg, Whisper, Claude
- **Infrastructure**: Docker, Redis, RabbitMQ, S3
