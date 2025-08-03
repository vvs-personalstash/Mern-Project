# Online Judge Platform - Docker Deployment

This is a complete online judge platform with the following components:
- **Frontend**: React/Vite application
- **Backend**: Node.js/Express API server
- **Compiler**: Node.js code compilation service
- **AI Module**: Python/Flask AI feedback service
- **Database**: MongoDB Atlas (Cloud Database)

## Quick Start with Docker

### Prerequisites
- Docker and Docker Compose installed
- Git (to clone the repository)

### 1. Environment Setup
```bash
# Copy environment file and configure
cp .env.example .env

# Edit .env file with your configuration
nano .env
```

**Important**: Update the following in your `.env` file:
- `MONGO_URI`: Your MongoDB Atlas connection string
- `JWT_SECRET`: Change to a strong random string
- `COOKIE_KEY`: Change to a strong random string  
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`: For OAuth (optional)
- `GOOGLE_API_KEY`: For AI module functionality

### 2. Build and Run
```bash
# Build and start all services
docker-compose up --build -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### 3. Access the Application
- **Frontend**: http://localhost:80
- **Backend API**: http://localhost:5001
- **Compiler Service**: http://localhost:3000
- **AI Module**: http://localhost:5003

### 4. Stop Services
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (destroys data)
docker-compose down -v
```

## Service Details

### Frontend (Port 80)
- React application built with Vite
- Served by Nginx with API proxying
- Handles routing and user interface

### Backend Server (Port 5001)
- Node.js/Express API
- Handles authentication, questions, submissions
- Connects to MongoDB and Compiler service

### Compiler Service (Port 3000)
- Compiles and executes C++, Java, Python code
- Rate limiting and logging
- Security sandboxing

### AI Module (Port 5003)
- Python Flask service
- Uses Google Gemini for code feedback
- Retrieves hints from question database

### MongoDB Atlas (Cloud Database)
- Cloud-hosted MongoDB database
- Stores users, questions, submissions
- No local setup required - uses your existing cloud connection

## Production Deployment

### AWS Deployment Options

#### Option 1: EC2 with Docker Compose
1. Launch EC2 instance (t3.medium or larger recommended)
2. Install Docker and Docker Compose
3. Clone repository and configure environment
4. Run `docker-compose up -d`
5. Configure security groups for ports 80, 443

#### Option 2: ECS (Elastic Container Service)
1. Push images to ECR (Elastic Container Registry)
2. Create ECS cluster and task definitions
3. Configure Application Load Balancer
4. Set up RDS or DocumentDB for MongoDB

#### Option 3: EKS (Kubernetes)
1. Create EKS cluster
2. Convert docker-compose to Kubernetes manifests
3. Deploy using kubectl or Helm

### Security Considerations
- Change all default passwords and secrets
- Use AWS Secrets Manager for sensitive data
- Enable HTTPS with SSL certificates
- Configure VPC and security groups properly
- Consider using AWS WAF for additional protection

### Monitoring
```bash
# View service logs
docker-compose logs [service-name]

# Monitor resource usage
docker stats

# Health checks
curl http://localhost:5001/api/health
curl http://localhost:3000/health
curl http://localhost:5003/health
```

## Development

### Local Development (without Docker)
Each service can be run independently:

```bash
# Backend
cd server
npm install
npm run dev

# Compiler
cd compiler  
npm install
npm run dev

# AI Module
cd agentic_ai_module
pip install -r requirements.txt
python flask_app.py

# Frontend
cd onlinejudge
npm install
npm run dev
```

### Adding Features
- Questions are stored in MongoDB with schema in `server/models/questions.js`
- Submissions tracked in `server/models/submission.js`
- Compiler supports C++, Java, Python (extensible)
- AI module uses LangChain with Google Gemini

## Troubleshooting

### Common Issues
1. **Port conflicts**: Change ports in docker-compose.yml
2. **Permission issues**: Check file permissions in mounted volumes
3. **Memory issues**: Increase Docker memory limits
4. **Database connection**: Verify MongoDB is running and accessible

### Useful Commands
```bash
# Rebuild specific service
docker-compose build [service-name]

# View container logs
docker logs [container-name]

# Access container shell
docker exec -it [container-name] /bin/sh

# Reset database
docker-compose down -v && docker-compose up -d mongodb
```
