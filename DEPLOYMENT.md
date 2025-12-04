# Deployment Guide - Baynunah Recruitment Pass

This guide covers how to deploy the Baynunah Recruitment Pass application to production environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Configuration](#environment-configuration)
3. [Build Process](#build-process)
4. [Deployment Options](#deployment-options)
   - [Docker Deployment](#docker-deployment)
   - [Railway](#railway)
   - [Render](#render)
   - [DigitalOcean App Platform](#digitalocean-app-platform)
   - [AWS (EC2/ECS)](#aws-ec2ecs)
   - [VPS/Dedicated Server](#vpsdedicated-server)
5. [Database Setup](#database-setup)
6. [Post-Deployment](#post-deployment)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

- Node.js 18+ (recommended: 20+)
- pnpm 10.4.1+
- MySQL 8.0+ database
- (Optional) AWS S3 bucket for file storage
- Domain name (recommended for production)

## Environment Configuration

Create a `.env` file in the root directory with the following variables:

```bash
# Server Configuration
PORT=4173
NODE_ENV=production

# Database Configuration
DATABASE_URL=mysql://username:password@host:port/database

# AWS S3 Configuration (if using file uploads)
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name

# Email Configuration (if applicable)
# Add your email service credentials here

# Admin Configuration
ADMIN_EMAIL=mohammad.sudally@baynunah.ae
```

See `.env.example` for a template with all available options.

## Build Process

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Run type checking:**
   ```bash
   pnpm check
   ```

3. **Build the application:**
   ```bash
   pnpm build
   ```
   
   This command:
   - Builds the Vite client (React app) → `dist/public`
   - Bundles the Express server → `dist/index.js`

4. **Run database migrations:**
   ```bash
   pnpm db:push
   ```

5. **Start the production server:**
   ```bash
   pnpm start
   ```

## Deployment Options

### Docker Deployment

The application includes Docker support for easy containerized deployment.

1. **Build the Docker image:**
   ```bash
   docker build -t recruitment-pass:latest .
   ```

2. **Run the container:**
   ```bash
   docker run -d \
     -p 4173:4173 \
     -e DATABASE_URL=mysql://user:pass@host:port/db \
     -e NODE_ENV=production \
     --name recruitment-pass \
     recruitment-pass:latest
   ```

3. **Using Docker Compose:**
   ```bash
   docker-compose up -d
   ```

### Railway

Railway provides an easy deployment experience with automatic builds.

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login and initialize:**
   ```bash
   railway login
   railway init
   ```

3. **Add environment variables:**
   ```bash
   railway variables set DATABASE_URL=mysql://...
   railway variables set NODE_ENV=production
   ```

4. **Deploy:**
   ```bash
   railway up
   ```

Railway will automatically:
- Detect Node.js and install dependencies with pnpm
- Run the build script
- Start the server

**railway.json configuration:**
See the included `railway.json` file for custom build and start commands.

### Render

Render offers free tier hosting for web services.

1. **Connect your GitHub repository** to Render

2. **Create a new Web Service** with these settings:
   - **Build Command:** `pnpm install && pnpm build && pnpm db:push`
   - **Start Command:** `pnpm start`
   - **Environment:** Node

3. **Add environment variables** in the Render dashboard:
   - `DATABASE_URL`
   - `NODE_ENV=production`
   - Add any other required variables

4. **Create a MySQL database** in Render or use an external provider

5. **Deploy** - Render will automatically build and deploy

### DigitalOcean App Platform

1. **Connect your repository** to DigitalOcean App Platform

2. **Configure the app:**
   - **Build Command:** `pnpm install && pnpm build`
   - **Run Command:** `pnpm start`

3. **Add a MySQL database** component

4. **Configure environment variables** in the App Platform dashboard

5. **Deploy**

### AWS (EC2/ECS)

#### EC2 Deployment

1. **Launch an EC2 instance** (Ubuntu 22.04 LTS recommended)

2. **SSH into your instance** and install Node.js and pnpm:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   npm install -g pnpm
   ```

3. **Clone your repository:**
   ```bash
   git clone https://github.com/yourusername/recruitmentprogresspass.git
   cd recruitmentprogresspass
   ```

4. **Set up environment variables:**
   ```bash
   nano .env
   # Add your environment variables
   ```

5. **Install dependencies and build:**
   ```bash
   pnpm install
   pnpm build
   pnpm db:push
   ```

6. **Set up PM2 for process management:**
   ```bash
   npm install -g pm2
   pm2 start dist/index.js --name recruitment-pass
   pm2 startup
   pm2 save
   ```

7. **Configure Nginx as reverse proxy** (optional but recommended):
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

       location / {
           proxy_pass http://localhost:4173;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

#### ECS Deployment

Use the included Dockerfile to deploy to AWS ECS:

1. **Build and push to ECR:**
   ```bash
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ECR_URL
   docker build -t recruitment-pass .
   docker tag recruitment-pass:latest YOUR_ECR_URL/recruitment-pass:latest
   docker push YOUR_ECR_URL/recruitment-pass:latest
   ```

2. **Create an ECS task definition** using the image

3. **Configure environment variables** in the task definition

4. **Create and run an ECS service**

### VPS/Dedicated Server

Similar to EC2 deployment, but on any Linux VPS:

1. **Install Node.js 20+ and pnpm**
2. **Clone the repository**
3. **Configure environment variables**
4. **Build the application**
5. **Use PM2 or systemd for process management**
6. **Configure Nginx/Apache as reverse proxy**
7. **Set up SSL with Let's Encrypt**

## Database Setup

### MySQL Database

1. **Create a MySQL database:**
   ```sql
   CREATE DATABASE recruitment_pass CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER 'recruitment_user'@'%' IDENTIFIED BY 'secure_password';
   GRANT ALL PRIVILEGES ON recruitment_pass.* TO 'recruitment_user'@'%';
   FLUSH PRIVILEGES;
   ```

2. **Set the DATABASE_URL environment variable:**
   ```bash
   DATABASE_URL=mysql://recruitment_user:secure_password@hostname:3306/recruitment_pass
   ```

3. **Run migrations:**
   ```bash
   pnpm db:push
   ```

### Database Providers

Consider these managed MySQL providers:
- **PlanetScale** - Serverless MySQL platform (free tier available)
- **Railway** - Built-in MySQL service
- **DigitalOcean Managed Databases**
- **AWS RDS** - Managed MySQL service
- **Google Cloud SQL**

## Post-Deployment

### Health Check

Verify your deployment by accessing:
```
http://your-domain.com/health
```

You should receive:
```json
{
  "status": "ok",
  "uptime": "123",
  "timestamp": "2025-12-04T16:55:00.000Z"
}
```

### SSL Certificate

For production, always use HTTPS:

1. **Using Let's Encrypt with Certbot:**
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com
   ```

2. **Or configure SSL in your platform** (Render, Railway, etc. provide automatic SSL)

### Monitoring

Set up monitoring for:
- Server uptime
- Database connections
- API response times
- Error rates

Recommended tools:
- **UptimeRobot** - Free uptime monitoring
- **Sentry** - Error tracking
- **PM2 Monitoring** - Process monitoring (if using PM2)
- **New Relic** - Application performance monitoring

### Backups

1. **Database backups:**
   - Set up automated daily backups of your MySQL database
   - Store backups in a secure location (S3, separate server)

2. **Application backups:**
   - Keep your code in version control (Git)
   - Tag releases for easy rollback

### Security Checklist

- [ ] Use strong database passwords
- [ ] Enable HTTPS/SSL
- [ ] Set `NODE_ENV=production`
- [ ] Keep dependencies updated
- [ ] Set up firewall rules
- [ ] Restrict database access to application server only
- [ ] Use environment variables for secrets (never commit to git)
- [ ] Enable CORS only for trusted domains
- [ ] Set up rate limiting
- [ ] Regular security audits with `pnpm audit`

## Troubleshooting

### Build Fails

**Issue:** Build command fails with TypeScript errors

**Solution:**
```bash
pnpm check  # Identify type errors
pnpm format # Auto-fix formatting issues
```

### Database Connection Issues

**Issue:** Cannot connect to database

**Solution:**
- Verify `DATABASE_URL` format: `mysql://user:password@host:port/database`
- Check database server is running and accessible
- Verify firewall rules allow connection from application server
- Test connection: `mysql -h hostname -u username -p`

### Port Already in Use

**Issue:** Port 4173 is already in use

**Solution:**
Set a different port:
```bash
PORT=8080 pnpm start
```

### Application Won't Start

**Issue:** Server crashes on startup

**Solution:**
1. Check logs for error messages
2. Verify all environment variables are set
3. Ensure database is accessible
4. Check Node.js version (must be 18+)
5. Verify build completed successfully: `ls -la dist/`

### Static Files Not Served

**Issue:** 404 errors for frontend routes

**Solution:**
- Ensure `pnpm build` completed successfully
- Check `dist/public` directory exists and contains files
- Verify server is looking in correct directory

## Scaling

### Horizontal Scaling

To handle increased load:

1. **Use a load balancer** (Nginx, AWS ALB, Railway load balancing)
2. **Run multiple instances** of the application
3. **Use session affinity** if needed (though this app is stateless)

### Database Scaling

1. **Enable connection pooling** in your MySQL configuration
2. **Consider read replicas** for heavy read operations
3. **Implement caching** with Redis for frequently accessed data
4. **Optimize queries** and add indexes

## Support

For issues specific to deployment:
- Check the [GitHub Issues](https://github.com/ismaelloveexcel/recruitmentprogresspass/issues)
- Review application logs
- Contact the development team

## License

This application is licensed under MIT. See LICENSE file for details.
