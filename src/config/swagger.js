const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Property Management System API',
      version: '1.0.0',
      description: `
## Overview
Production-ready REST API for Property Management System.

## Authentication
This API uses JWT Bearer token authentication. Include the token in the Authorization header:
\`\`\`
Authorization: Bearer <your_token>
\`\`\`

## Roles
- **ADMIN**: Full access to all resources
- **OWNER**: Manage own buildings and units
- **TENANT**: View own tenancy information only

## Default Admin Credentials
- Email: admin@propertymanagement.com
- Password: Admin@123
      `,
      contact: {
        name: 'API Support',
        email: 'support@propertymanagement.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token',
        },
      },
      schemas: {
        // Error Response
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Error message' },
            statusCode: { type: 'integer', example: 400 },
          },
        },
        
        // Pagination
        Pagination: {
          type: 'object',
          properties: {
            currentPage: { type: 'integer', example: 1 },
            itemsPerPage: { type: 'integer', example: 10 },
            totalItems: { type: 'integer', example: 100 },
            totalPages: { type: 'integer', example: 10 },
            hasNextPage: { type: 'boolean', example: true },
            hasPreviousPage: { type: 'boolean', example: false },
          },
        },
        
        // User
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            email: { type: 'string', format: 'email', example: 'user@example.com' },
            firstName: { type: 'string', example: 'John' },
            lastName: { type: 'string', example: 'Doe' },
            role: { type: 'string', enum: ['ADMIN', 'OWNER', 'TENANT'], example: 'OWNER' },
            isActive: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        
        CreateUser: {
          type: 'object',
          required: ['email', 'firstName', 'lastName', 'role'],
          properties: {
            email: { type: 'string', format: 'email', example: 'newuser@example.com' },
            firstName: { type: 'string', minLength: 2, maxLength: 50, example: 'John' },
            lastName: { type: 'string', minLength: 2, maxLength: 50, example: 'Doe' },
            role: { type: 'string', enum: ['ADMIN', 'OWNER', 'TENANT'], example: 'OWNER' },
          },
        },
        
        UpdateUser: {
          type: 'object',
          properties: {
            email: { type: 'string', format: 'email' },
            firstName: { type: 'string', minLength: 2, maxLength: 50 },
            lastName: { type: 'string', minLength: 2, maxLength: 50 },
            role: { type: 'string', enum: ['ADMIN', 'OWNER', 'TENANT'] },
            isActive: { type: 'boolean' },
          },
        },
        
        // Building
        Building: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Sunset Apartments' },
            address: { type: 'string', example: '123 Main Street' },
            city: { type: 'string', example: 'New York' },
            postalCode: { type: 'string', example: '10001' },
            country: { type: 'string', example: 'USA' },
            totalUnits: { type: 'integer', example: 20 },
            owner: { $ref: '#/components/schemas/UserSummary' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        
        CreateBuilding: {
          type: 'object',
          required: ['name', 'address', 'city', 'country', 'ownerId'],
          properties: {
            name: { type: 'string', minLength: 2, maxLength: 100, example: 'Sunset Apartments' },
            address: { type: 'string', minLength: 5, maxLength: 255, example: '123 Main Street' },
            city: { type: 'string', minLength: 2, maxLength: 100, example: 'New York' },
            postalCode: { type: 'string', maxLength: 20, example: '10001' },
            country: { type: 'string', minLength: 2, maxLength: 100, example: 'USA' },
            ownerId: { type: 'integer', example: 2 },
          },
        },
        
        // Unit
        Unit: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            unitNumber: { type: 'string', example: '101' },
            floor: { type: 'integer', example: 1 },
            bedrooms: { type: 'integer', example: 2 },
            bathrooms: { type: 'number', example: 1.5 },
            areaSqft: { type: 'number', example: 850 },
            rentAmount: { type: 'number', example: 1500.00 },
            status: { type: 'string', enum: ['AVAILABLE', 'RENTED'], example: 'AVAILABLE' },
            building: {
              type: 'object',
              properties: {
                id: { type: 'integer' },
                name: { type: 'string' },
                address: { type: 'string' },
              },
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        
        CreateUnit: {
          type: 'object',
          required: ['buildingId', 'unitNumber', 'bedrooms', 'bathrooms', 'rentAmount'],
          properties: {
            buildingId: { type: 'integer', example: 1 },
            unitNumber: { type: 'string', minLength: 1, maxLength: 20, example: '101' },
            floor: { type: 'integer', min: 0, example: 1 },
            bedrooms: { type: 'integer', min: 0, max: 20, example: 2 },
            bathrooms: { type: 'number', min: 0, max: 20, example: 1.5 },
            areaSqft: { type: 'number', example: 850 },
            rentAmount: { type: 'number', example: 1500.00 },
          },
        },
        
        // Tenancy
        Tenancy: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            startDate: { type: 'string', format: 'date', example: '2024-01-01' },
            endDate: { type: 'string', format: 'date', example: '2024-12-31' },
            monthlyRent: { type: 'number', example: 1500.00 },
            depositAmount: { type: 'number', example: 3000.00 },
            isActive: { type: 'boolean', example: true },
            unit: {
              type: 'object',
              properties: {
                id: { type: 'integer' },
                unitNumber: { type: 'string' },
                buildingId: { type: 'integer' },
                buildingName: { type: 'string' },
              },
            },
            tenant: { $ref: '#/components/schemas/UserSummary' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        
        CreateTenancy: {
          type: 'object',
          required: ['unitId', 'tenantId', 'startDate', 'endDate', 'monthlyRent', 'depositAmount'],
          properties: {
            unitId: { type: 'integer', example: 1 },
            tenantId: { type: 'integer', example: 5 },
            startDate: { type: 'string', format: 'date', example: '2024-01-01' },
            endDate: { type: 'string', format: 'date', example: '2024-12-31' },
            monthlyRent: { type: 'number', example: 1500.00 },
            depositAmount: { type: 'number', example: 3000.00 },
          },
        },
        
        // Auth
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'admin@propertymanagement.com' },
            password: { type: 'string', minLength: 6, example: 'Admin@123' },
          },
        },
        
        LoginResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Login successful' },
            data: {
              type: 'object',
              properties: {
                user: { $ref: '#/components/schemas/User' },
                token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
              },
            },
          },
        },
        
        UserSummary: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            email: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
          },
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'Access token is missing or invalid',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: {
                success: false,
                message: 'Authentication token is required',
                statusCode: 401,
              },
            },
          },
        },
        ForbiddenError: {
          description: 'Access denied - insufficient permissions',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: {
                success: false,
                message: 'You do not have permission to perform this action',
                statusCode: 403,
              },
            },
          },
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: {
                success: false,
                message: 'Resource not found',
                statusCode: 404,
              },
            },
          },
        },
        ValidationError: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Validation error' },
                  statusCode: { type: 'integer', example: 400 },
                  errors: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        field: { type: 'string' },
                        message: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    tags: [
      { name: 'Health', description: 'API health check' },
      { name: 'Authentication', description: 'Login, logout, and session management' },
      { name: 'Users', description: 'User management (Admin only)' },
      { name: 'Profile', description: 'User profile management' },
      { name: 'Buildings', description: 'Building management' },
      { name: 'Units', description: 'Unit management' },
      { name: 'Tenancies', description: 'Tenancy management' },
    ],
  },
  apis: ['./src/config/swagger-docs.js'], // Path to the API docs
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
