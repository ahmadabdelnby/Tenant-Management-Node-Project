const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const config = require('./config');
const swaggerSpec = require('./config/swagger');

// Import middleware
const { errorHandler, notFoundHandler } = require('./middleware');

// Import routes
const { authRoutes } = require('./modules/auth');
const { userRoutes, profileRoutes } = require('./modules/users');
const { buildingRoutes } = require('./modules/buildings');
const { unitRoutes, unitController } = require('./modules/units');
const { tenancyRoutes, myTenanciesRoutes } = require('./modules/tenancies');
const { maintenanceRoutes } = require('./modules/maintenance');

// Import middleware for nested routes
const { authenticate, isAdminOrOwner } = require('./middleware');

// Create Express app
const app = express();

// ============================================
// SECURITY MIDDLEWARE
// ============================================

// Helmet - Security headers
app.use(helmet());

// CORS
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ============================================
// BODY PARSING MIDDLEWARE
// ============================================

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ============================================
// RATE LIMITING (DISABLED)
// ============================================

// app.use('/api', apiLimiter);

// ============================================
// SWAGGER DOCUMENTATION
// ============================================

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Property Management API Docs',
}));

// Swagger JSON endpoint
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// ============================================
// HEALTH CHECK ENDPOINT
// ============================================

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Property Management API is running',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

// ============================================
// API ROUTES
// ============================================

// Auth routes
app.use('/api/auth', authRoutes);

// User routes
app.use('/api/users', userRoutes);

// Profile routes (self-update)
app.use('/api/profile', profileRoutes);

// Building routes
app.use('/api/buildings', buildingRoutes);

// Nested route: Units by building
app.get('/api/buildings/:buildingId/units', authenticate, isAdminOrOwner, unitController.getByBuildingId);

// Unit routes
app.use('/api/units', unitRoutes);

// Tenancy routes
app.use('/api/tenancies', tenancyRoutes);

// My Tenancies route (for Tenant role)
app.use('/api/my-tenancies', myTenanciesRoutes);

// Maintenance routes
app.use('/api/maintenance', maintenanceRoutes);

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

module.exports = app;
