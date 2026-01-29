/**
 * @swagger
 * /api/health:
 *   get:
 *     tags: [Health]
 *     summary: Check API health status
 *     description: Returns the health status of the API
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Property Management API is running
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 environment:
 *                   type: string
 *                   example: development
 */

// ============================================
// AUTHENTICATION ENDPOINTS
// ============================================

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: Login to the system
 *     description: Authenticate user and receive JWT token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Too many login attempts
 */

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags: [Authentication]
 *     summary: Logout from the system
 *     description: Invalidate the current JWT token
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     tags: [Authentication]
 *     summary: Get current user
 *     description: Get the currently authenticated user's information
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User information retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

// ============================================
// USER ENDPOINTS
// ============================================

/**
 * @swagger
 * /api/users:
 *   get:
 *     tags: [Users]
 *     summary: Get all users
 *     description: Retrieve a paginated list of all users (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [ADMIN, OWNER, TENANT]
 *         description: Filter by role
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by email, first name, or last name
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *   post:
 *     tags: [Users]
 *     summary: Create a new user
 *     description: Create a new user with auto-generated password (Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUser'
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     email:
 *                       type: string
 *                     temporaryPassword:
 *                       type: string
 *                       description: Auto-generated password to share with user
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       409:
 *         description: User with this email already exists
 */

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get user by ID
 *     description: Retrieve a specific user by ID (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *   put:
 *     tags: [Users]
 *     summary: Update user
 *     description: Update user information (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUser'
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *   delete:
 *     tags: [Users]
 *     summary: Delete user
 *     description: Soft delete a user (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       400:
 *         description: Cannot delete your own account
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

/**
 * @swagger
 * /api/users/{id}/deactivate:
 *   patch:
 *     tags: [Users]
 *     summary: Deactivate user
 *     description: Deactivate a user account (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User deactivated successfully
 *       400:
 *         description: Cannot deactivate your own account
 */

/**
 * @swagger
 * /api/users/{id}/activate:
 *   patch:
 *     tags: [Users]
 *     summary: Activate user
 *     description: Activate a user account (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User activated successfully
 */

/**
 * @swagger
 * /api/profile:
 *   put:
 *     tags: [Profile]
 *     summary: Update own profile
 *     description: Update the current user's profile information
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */

// ============================================
// BUILDING ENDPOINTS
// ============================================

/**
 * @swagger
 * /api/buildings:
 *   get:
 *     tags: [Buildings]
 *     summary: Get all buildings
 *     description: Retrieve paginated list of buildings (Admin sees all, Owner sees own)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Buildings retrieved successfully
 *   post:
 *     tags: [Buildings]
 *     summary: Create a new building
 *     description: Create a new building (Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBuilding'
 *     responses:
 *       201:
 *         description: Building created successfully
 */

/**
 * @swagger
 * /api/buildings/{id}:
 *   get:
 *     tags: [Buildings]
 *     summary: Get building by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Building retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Building'
 *   put:
 *     tags: [Buildings]
 *     summary: Update building
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               postalCode:
 *                 type: string
 *               country:
 *                 type: string
 *     responses:
 *       200:
 *         description: Building updated successfully
 *   delete:
 *     tags: [Buildings]
 *     summary: Delete building
 *     description: Soft delete a building (Admin only, must have no units)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Building deleted successfully
 *       409:
 *         description: Cannot delete building with existing units
 */

/**
 * @swagger
 * /api/buildings/{buildingId}/units:
 *   get:
 *     tags: [Buildings]
 *     summary: Get units in a building
 *     description: Retrieve all units belonging to a specific building
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: buildingId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Units retrieved successfully
 */

// ============================================
// UNIT ENDPOINTS
// ============================================

/**
 * @swagger
 * /api/units:
 *   get:
 *     tags: [Units]
 *     summary: Get all units
 *     description: Retrieve paginated list of units
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: buildingId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [AVAILABLE, RENTED]
 *       - in: query
 *         name: minBedrooms
 *         schema:
 *           type: integer
 *       - in: query
 *         name: maxRent
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Units retrieved successfully
 *   post:
 *     tags: [Units]
 *     summary: Create a new unit
 *     description: Create a new unit in a building (Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUnit'
 *     responses:
 *       201:
 *         description: Unit created successfully
 */

/**
 * @swagger
 * /api/units/{id}:
 *   get:
 *     tags: [Units]
 *     summary: Get unit by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Unit retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Unit'
 *   put:
 *     tags: [Units]
 *     summary: Update unit
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               unitNumber:
 *                 type: string
 *               floor:
 *                 type: integer
 *               bedrooms:
 *                 type: integer
 *               bathrooms:
 *                 type: number
 *               areaSqft:
 *                 type: number
 *               rentAmount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Unit updated successfully
 *   delete:
 *     tags: [Units]
 *     summary: Delete unit
 *     description: Soft delete a unit (Admin only, must have no active tenancy)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Unit deleted successfully
 *       409:
 *         description: Cannot delete unit with active tenancy
 */

// ============================================
// TENANCY ENDPOINTS
// ============================================

/**
 * @swagger
 * /api/tenancies:
 *   get:
 *     tags: [Tenancies]
 *     summary: Get all tenancies
 *     description: Retrieve paginated list of tenancies (filtered by role)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: unitId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: buildingId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Tenancies retrieved successfully
 *   post:
 *     tags: [Tenancies]
 *     summary: Create a new tenancy
 *     description: Assign a tenant to a unit (Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTenancy'
 *     responses:
 *       201:
 *         description: Tenancy created successfully
 *       409:
 *         description: Unit already has an active tenancy or is not available
 */

/**
 * @swagger
 * /api/tenancies/{id}:
 *   get:
 *     tags: [Tenancies]
 *     summary: Get tenancy by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Tenancy retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Tenancy'
 *   put:
 *     tags: [Tenancies]
 *     summary: Update tenancy
 *     description: Update tenancy details (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               endDate:
 *                 type: string
 *                 format: date
 *               monthlyRent:
 *                 type: number
 *               depositAmount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Tenancy updated successfully
 */

/**
 * @swagger
 * /api/tenancies/{id}/end:
 *   patch:
 *     tags: [Tenancies]
 *     summary: End tenancy
 *     description: End an active tenancy and mark unit as available (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Tenancy ended successfully
 *       400:
 *         description: Tenancy already ended
 */

/**
 * @swagger
 * /api/my-tenancies:
 *   get:
 *     tags: [Tenancies]
 *     summary: Get my tenancies
 *     description: Get the current tenant's tenancies (Tenant role only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tenancies retrieved successfully
 *       403:
 *         description: Only tenants can access this endpoint
 */

module.exports = {};
