import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { serveStatic } from 'hono/cloudflare-workers'
import authRoutes from './routes/auth'
import residentsRoutes from './routes/residents'
import visitorsRoutes from './routes/visitors'
import complaintsRoutes from './routes/complaints'
import noticesRoutes from './routes/notices'
import billingRoutes from './routes/billing'
import dashboardRoutes from './routes/dashboard'
import superAdminRoutes from './routes/superadmin'

const app = new Hono()

app.use('*', cors())
app.use('*', logger())

// Static files
app.use('/static/*', serveStatic({ root: './' }))

// API Routes
app.route('/api/auth', authRoutes)
app.route('/api/residents', residentsRoutes)
app.route('/api/visitors', visitorsRoutes)
app.route('/api/complaints', complaintsRoutes)
app.route('/api/notices', noticesRoutes)
app.route('/api/billing', billingRoutes)
app.route('/api/dashboard', dashboardRoutes)
app.route('/api/superadmin', superAdminRoutes)

// /app and /app/* → SaaS platform (vanilla JS dashboard)
app.get('/app', (c) => c.html(getAppHTML()))
app.get('/app/*', (c) => c.html(getAppHTML()))

// All other routes → React website (React Router handles pages)
app.get('*', (c) => c.html(getHTML()))

function getHTML(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MyGateBell - The New Standard of Entry</title>
  <meta name="description" content="Empower your community with the world's most trusted gate management system. Seamless visitor tracking, automated deliveries, and real-time security alerts.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" rel="stylesheet">
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/react/main.tsx"></script>
</body>
</html>`
}

function getAppHTML(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MyGateBell — Society Management Platform</title>
  <meta name="description" content="Smart society management platform for residents, guards, and administrators.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
  <link rel="stylesheet" href="/static/style.css">
  <link rel="stylesheet" href="/static/landing.css">
</head>
<body>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <script src="/static/app.js"></script>
</body>
</html>`
}

export default app
