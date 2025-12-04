# Deployment Files

This directory contains deployment configuration files and scripts for various platforms.

## Files Overview

### `deploy.sh`
Automated deployment script for Ubuntu/Debian VPS servers. This script:
- Installs Node.js, pnpm, PM2, and Nginx
- Sets up the application directory
- Clones the repository
- Builds the application
- Configures PM2 for process management
- Sets up Nginx as a reverse proxy
- Optionally configures SSL with Let's Encrypt
- Configures the firewall

**Usage:**
```bash
sudo bash deploy.sh
```

### `nginx.conf`
Nginx configuration file for reverse proxy setup. Features:
- HTTP to HTTPS redirect
- SSL/TLS configuration
- Security headers
- Static asset caching
- Health check endpoint
- Proper timeout settings

**Installation:**
```bash
sudo cp nginx.conf /etc/nginx/sites-available/recruitment-pass
sudo ln -s /etc/nginx/sites-available/recruitment-pass /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### `recruitment-pass.service`
Systemd service file for running the application as a system service.

**Installation:**
```bash
sudo cp recruitment-pass.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable recruitment-pass
sudo systemctl start recruitment-pass
```

**Check status:**
```bash
sudo systemctl status recruitment-pass
```

**View logs:**
```bash
sudo journalctl -u recruitment-pass -f
```

## Platform-Specific Deployments

For detailed platform-specific instructions, refer to the main [DEPLOYMENT.md](../DEPLOYMENT.md) file in the root directory.

### Quick Reference

- **Docker:** Use `docker-compose.yml` in the root directory
- **Railway:** Use `railway.json` in the root directory
- **Render:** Use `render.yaml` in the root directory
- **VPS/Server:** Use `deploy.sh` in this directory

## Prerequisites

Before deploying, ensure you have:
1. A MySQL 8.0+ database (or use docker-compose for local setup)
2. Environment variables configured (see `.env.example` in root)
3. Domain name pointed to your server (for production)
4. SSL certificate (recommended for production)

## Support

For issues or questions:
- Check the troubleshooting section in [DEPLOYMENT.md](../DEPLOYMENT.md)
- Review application logs
- Open an issue on GitHub
