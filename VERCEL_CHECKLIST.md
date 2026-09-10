# ✅ Vercel Deployment Checklist

Use this to ensure everything is set up correctly.

---

## 📋 PRE-DEPLOYMENT CHECKLIST

### Code Preparation
- [ ] All code is in GitHub repository
- [ ] No sensitive data in .env files
- [ ] All tests passing locally (8/8)
- [ ] Frontend builds locally: `cd frontend && npm run build`
- [ ] Backend runs locally: `cd backend && uvicorn main:app --reload`
- [ ] Database migrations done
- [ ] No console errors or warnings

### Project Structure
- [ ] `frontend/` directory exists with Next.js app
- [ ] `backend/` directory exists with FastAPI app
- [ ] `vercel.json` file created
- [ ] `vercel.json` has correct configuration
- [ ] `.env.production` template created
- [ ] `Dockerfile.railway` exists (for Railway)
- [ ] `render.yaml` exists (for Render)

### Repository Setup
- [ ] GitHub account created
- [ ] Repository created (public or private)
- [ ] All files pushed to GitHub
- [ ] `main` branch is default
- [ ] No merge conflicts

---

## 🔐 SECURITY CHECKLIST

- [ ] API keys NOT in code
- [ ] Database passwords NOT in code
- [ ] Secrets stored in environment variables only
- [ ] `.env` files added to `.gitignore`
- [ ] Vercel secrets NOT visible in public repos
- [ ] CORS configured for production domain
- [ ] HTTPS enabled (automatic on Vercel)
- [ ] No debug mode in production
- [ ] Error messages don't expose internals

---

## ⚙️ CONFIGURATION CHECKLIST

### Vercel Configuration
- [ ] `vercel.json` exists
- [ ] `buildCommand` is correct
- [ ] `outputDirectory` is correct
- [ ] Framework is set to `nextjs`
- [ ] Environment variables defined

### Frontend Configuration
- [ ] `.env.local` created from `.env.example`
- [ ] `NEXT_PUBLIC_API_URL` is set
- [ ] `next.config.js` has no errors
- [ ] `tsconfig.json` is valid
- [ ] `tailwind.config.js` exists

### Backend Configuration
- [ ] `requirements.txt` has all dependencies
- [ ] Python version is 3.11+
- [ ] Database URL format is correct
- [ ] ALLOWED_ORIGINS includes Vercel domain
- [ ] MAX_FILE_SIZE is set

### Database Configuration
- [ ] PostgreSQL database created
- [ ] Database user created
- [ ] Database password set
- [ ] Connection string verified
- [ ] All tables created
- [ ] Migrations applied

---

## 🚀 DEPLOYMENT CHECKLIST

### Choose Deployment Option
- [ ] Decided on Option 1, 2, or 3
- [ ] Option 1: Vercel Functions + PostgreSQL on Vercel
- [ ] Option 2: Vercel Frontend + Railway Backend
- [ ] Option 3: Vercel Frontend + Render Backend

### Frontend Deployment (Vercel)
- [ ] Vercel account created
- [ ] GitHub connected to Vercel
- [ ] Project imported to Vercel
- [ ] Build settings correct
- [ ] Environment variables added
- [ ] Deploy button clicked
- [ ] Deployment successful (no errors)

### Backend Deployment
#### If using Railway:
- [ ] Railway account created
- [ ] GitHub connected to Railway
- [ ] PostgreSQL database added
- [ ] Environment variables set
- [ ] Backend deployed successfully
- [ ] Backend URL noted

#### If using Render:
- [ ] Render account created
- [ ] GitHub connected to Render
- [ ] PostgreSQL database added
- [ ] Environment variables set
- [ ] Backend deployed successfully
- [ ] Backend URL noted

#### If using Vercel Functions:
- [ ] API routes created in `/api` directory
- [ ] Python dependencies installed
- [ ] Environment variables set
- [ ] Functions deployed successfully
- [ ] Functions URL noted

---

## ✅ POST-DEPLOYMENT VERIFICATION

### Frontend Verification
- [ ] Frontend URL accessible: `https://your-domain.vercel.app`
- [ ] Page loads without errors
- [ ] Styling loaded correctly (Tailwind works)
- [ ] Dashboard visible with 0 leads
- [ ] All pages navigate correctly
- [ ] Mobile responsive design works

### Backend Verification
- [ ] Backend health check: `curl https://api/api/health`
- [ ] Response: `{"status":"ok","timestamp":"..."}`
- [ ] API docs accessible: `https://api/docs`
- [ ] Database connected: `curl https://api/api/leads`
- [ ] Returns empty list: `{"items":[],"total":0}`

### API Endpoints Verification
- [ ] GET /api/health → 200 OK
- [ ] GET /api/leads → 200 OK (empty)
- [ ] GET /api/dashboard/metrics → 200 OK
- [ ] POST /api/leads → Creates lead
- [ ] PUT /api/leads/{id} → Updates lead
- [ ] DELETE /api/leads/{id} → Deletes lead

### CORS Verification
- [ ] Frontend can call backend without errors
- [ ] Console has no CORS errors
- [ ] API responses received correctly
- [ ] No "blocked by CORS policy" errors

### Database Verification
- [ ] Database connection working
- [ ] Tables exist and accessible
- [ ] Can insert data
- [ ] Can query data
- [ ] Data persists across restarts

---

## 🧪 FUNCTIONAL TESTING

### Dashboard Testing
- [ ] Dashboard loads
- [ ] Metric cards display
- [ ] Metrics update correctly
- [ ] Recent activity shown

### Leads Management Testing
- [ ] Create lead works
- [ ] Leads table displays data
- [ ] Search works
- [ ] Filtering works
- [ ] Sorting works
- [ ] Pagination works
- [ ] Delete lead works

### CSV Import Testing
- [ ] Import page loads
- [ ] CSV upload works
- [ ] Data imported correctly
- [ ] Duplicates detected
- [ ] Leads in database

### API Testing
```bash
# Health check
curl https://your-api/api/health

# Get leads
curl https://your-api/api/leads

# Get metrics
curl https://your-api/api/dashboard/metrics

# Create lead
curl -X POST https://your-api/api/leads \
  -H "Content-Type: application/json" \
  -d '{...}'
```

---

## 📊 PERFORMANCE VERIFICATION

- [ ] Frontend loads in < 3 seconds
- [ ] API responds in < 1 second
- [ ] Dashboard renders smoothly
- [ ] No layout shifts (CLS)
- [ ] Images optimized
- [ ] API responses compressed
- [ ] Database queries optimized

---

## 🔍 LOGGING & MONITORING

### Vercel Logs
```bash
vercel logs
```
- [ ] No error logs
- [ ] No warning logs
- [ ] All requests successful

### Backend Logs
- [ ] No error messages
- [ ] Database connections successful
- [ ] API calls logged
- [ ] Performance metrics available

### Database Logs
- [ ] No connection errors
- [ ] Queries executing normally
- [ ] No timeouts
- [ ] Disk space available

---

## 🔄 CONTINUOUS DEPLOYMENT

- [ ] GitHub repository connected
- [ ] Auto-deploy on push enabled
- [ ] Branch protection rules set
- [ ] Pull requests working
- [ ] Merges trigger deployment
- [ ] Deployments complete within 5 minutes

---

## 📈 SCALING & OPTIMIZATION

### Frontend Optimization
- [ ] Images optimized (Next.js Image)
- [ ] Code splitting enabled
- [ ] Tree-shaking working
- [ ] CSS minified
- [ ] JavaScript minified

### Backend Optimization
- [ ] Database connection pooling enabled
- [ ] Queries using indexes
- [ ] Caching implemented
- [ ] API responses gzipped

### Database Optimization
- [ ] Indexes created
- [ ] Query plans optimized
- [ ] Connection pooling enabled
- [ ] Backups configured

---

## 🆘 TROUBLESHOOTING STATUS

### If anything is broken:
- [ ] Checked Vercel logs: `vercel logs`
- [ ] Checked backend logs (Railway/Render dashboard)
- [ ] Verified environment variables
- [ ] Verified database connection
- [ ] Checked CORS settings
- [ ] Cleared browser cache
- [ ] Tested with curl/Postman

---

## 📋 FINAL SIGN-OFF

Confirm all sections:
- [ ] Pre-deployment Checklist - COMPLETE
- [ ] Security Checklist - COMPLETE
- [ ] Configuration Checklist - COMPLETE
- [ ] Deployment Checklist - COMPLETE
- [ ] Post-deployment Verification - COMPLETE
- [ ] Functional Testing - COMPLETE
- [ ] Performance Verification - COMPLETE
- [ ] Logging & Monitoring - COMPLETE
- [ ] Continuous Deployment - COMPLETE
- [ ] Scaling & Optimization - COMPLETE

---

## 🎊 STATUS

When all items are checked:

```
✅ Frontend deployed and working
✅ Backend deployed and working
✅ Database connected and working
✅ All APIs responding
✅ All tests passing
✅ Production ready
```

**You can now:**
- ✅ Invite users
- ✅ Go live
- ✅ Start collecting data
- ✅ Scale to production

---

## 📞 EMERGENCY CONTACTS

If something breaks:

1. **Vercel Support:** https://vercel.com/support
2. **Railway Support:** https://railway.app/support
3. **Render Support:** https://render.com/support
4. **GitHub Issues:** Your repository

---

## 🎉 CONGRATULATIONS!

Your application is now:
- ✅ Deployed
- ✅ Tested
- ✅ Monitored
- ✅ Production-ready
- ✅ Scaling automatically
- ✅ Always available

**Welcome to production!** 🚀

---

*Checklist v1.0 - September 2026*  
*Last Updated: September 2026*  
*Status: Ready for Production ✅*
