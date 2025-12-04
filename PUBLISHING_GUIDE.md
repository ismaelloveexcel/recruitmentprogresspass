# Quick Start: How to Publish This App

## Choose Your Deployment Method

### 🚀 Fastest Option (5 minutes)
**Railway or Render** - Perfect for quick production deployment
1. Push your code to GitHub
2. Connect your repository to Railway or Render
3. Set environment variables in their dashboard
4. Deploy automatically

👉 **See:** [DEPLOYMENT.md - Railway Section](./DEPLOYMENT.md#railway) or [Render Section](./DEPLOYMENT.md#render)

---

### 🐳 Docker (10 minutes)
**Best for local testing or containerized production**
1. Install Docker and Docker Compose
2. Run: `docker-compose up -d`
3. Access at `http://localhost:4173`

👉 **See:** [DEPLOYMENT.md - Docker Section](./DEPLOYMENT.md#docker-deployment)

---

### 💻 Your Own Server (30 minutes)
**VPS or Dedicated Server**
1. Get a Ubuntu/Debian server
2. Run the automated script: `sudo bash deployment/deploy.sh`
3. Follow the prompts
4. Done!

👉 **See:** [DEPLOYMENT.md - VPS Section](./DEPLOYMENT.md#vpsdedicated-server)

---

## Prerequisites

Before deploying, you need:

✅ **MySQL Database**
   - Create a MySQL 8.0+ database
   - Or use managed services: PlanetScale, Railway, AWS RDS

✅ **Environment Variables**
   - Copy `.env.example` to `.env`
   - Fill in your DATABASE_URL and other settings

✅ **Domain (Optional but recommended)**
   - Point your domain to your server
   - Enables SSL/HTTPS for security

---

## Step-by-Step Guide

### 1. Prepare Your Environment

```bash
# Copy and edit environment file
cp .env.example .env
nano .env  # Edit with your database URL and settings
```

### 2. Choose a Deployment Method

#### Option A: Railway (Recommended for beginners)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init

# Set environment variables
railway variables set DATABASE_URL=mysql://user:pass@host:port/db
railway variables set NODE_ENV=production
railway variables set ADMIN_EMAIL=mohammad.sudally@baynunah.ae

# Deploy
railway up
```

#### Option B: Docker

```bash
# Copy and configure environment for Docker
cp .env.docker.example .env
nano .env  # Edit with your secure passwords

# Build and run with Docker Compose
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f app
```

#### Option C: VPS Server

```bash
# SSH into your server
ssh user@your-server-ip

# Download and run deployment script
wget https://raw.githubusercontent.com/YOUR_USERNAME/recruitmentprogresspass/main/deployment/deploy.sh
sudo bash deploy.sh
```

### 3. Set Up Database

```bash
# After deployment, run migrations
pnpm db:push
```

### 4. Verify Deployment

Visit your application URL and check the health endpoint:
```
http://your-domain.com/health
```

You should see:
```json
{
  "status": "ok",
  "uptime": "123",
  "timestamp": "2025-12-04T16:55:00.000Z"
}
```

### 5. Configure SSL (Production)

For Railway/Render: SSL is automatic ✅

For your own server:
```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## Common Issues & Solutions

### ❌ Build fails
**Solution:** Ensure Node.js 18+ and pnpm are installed
```bash
node --version  # Should be v18 or higher
pnpm --version  # Should be 10.4.1 or higher
```

### ❌ Database connection fails
**Solution:** Check your DATABASE_URL format
```bash
# Correct format:
DATABASE_URL=mysql://username:password@hostname:3306/database_name
```

### ❌ Port already in use
**Solution:** Change the port
```bash
PORT=8080 pnpm start
```

---

## Need More Help?

- 📖 **Full Documentation:** [DEPLOYMENT.md](./DEPLOYMENT.md)
- 🐛 **Report Issues:** [GitHub Issues](https://github.com/ismaelloveexcel/recruitmentprogresspass/issues)
- 🔧 **Platform Configs:** Check `railway.json`, `render.yaml`, or `docker-compose.yml`

---

## Deployment Checklist

Before going to production:

- [ ] Set `NODE_ENV=production`
- [ ] Configure DATABASE_URL
- [ ] Set up SSL/HTTPS
- [ ] Configure firewall rules
- [ ] Set up database backups
- [ ] Configure monitoring (UptimeRobot, etc.)
- [ ] Test health endpoint
- [ ] Test all major features
- [ ] Set up error tracking (optional: Sentry)

---

## Security Best Practices

⚠️ **Important:**
- Never commit `.env` files to Git
- Use strong database passwords
- Enable HTTPS in production
- Keep dependencies updated: `pnpm update`
- Run security audits: `pnpm audit`
- Restrict database access to application server only

---

## Platform Comparison

| Platform | Difficulty | Cost | SSL | Best For |
|----------|-----------|------|-----|----------|
| **Railway** | ⭐ Easy | Free tier + usage | ✅ Auto | Quick deploys |
| **Render** | ⭐ Easy | Free tier available | ✅ Auto | Small apps |
| **Docker** | ⭐⭐ Medium | Server cost | Manual | Consistent deploys |
| **VPS** | ⭐⭐⭐ Advanced | $5+/month | Manual | Full control |
| **AWS** | ⭐⭐⭐ Advanced | Variable | Manual | Enterprise |

---

## What Gets Deployed?

When you deploy this application, you get:

- ✅ **Frontend:** React app (built with Vite)
- ✅ **Backend:** Express + tRPC API
- ✅ **Database:** MySQL with Drizzle ORM
- ✅ **Static files:** Served from `/dist/public`
- ✅ **Health endpoint:** `/health` for monitoring

---

## Next Steps After Deployment

1. **Test the application** thoroughly
2. **Set up monitoring** for uptime and errors
3. **Configure backups** for your database
4. **Add your domain** to SSL certificate
5. **Update DNS records** to point to your server
6. **Share the URL** with your team

---

🎉 **Ready to deploy?** Choose your preferred method above and follow the guide!
