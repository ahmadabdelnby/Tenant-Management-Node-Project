const userService = require('./user.service');
const { successResponse, createdResponse } = require('../../shared/utils/responseFormatter');
const { HTTP_STATUS } = require('../../shared/constants');
const { parsePaginationParams } = require('../../shared/utils/paginationHelper');

/**
 * User Controller
 */
const userController = {
  /**
   * Get all users
   * GET /api/users
   */
  async getAll(req, res, next) {
    try {
      const { page, limit } = parsePaginationParams(req.query);
      const { role, isActive, search } = req.query;
      
      const filters = {};
      if (role) filters.role = role;
      if (isActive !== undefined) filters.isActive = isActive === 'true';
      if (search) filters.search = search;
      
      const result = await userService.getAllUsers(page, limit, filters);
      
      res.status(HTTP_STATUS.OK).json(
        successResponse(result, 'Users retrieved successfully')
      );
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Get user by ID
   * GET /api/users/:id
   */
  async getById(req, res, next) {
    try {
      const user = await userService.getUserById(parseInt(req.params.id));
      
      res.status(HTTP_STATUS.OK).json(
        successResponse(user, 'User retrieved successfully')
      );
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Create user
   * POST /api/users
   */
  async create(req, res, next) {
    try {
      const user = await userService.createUser(req.body);
      
      res.status(HTTP_STATUS.CREATED).json(
        createdResponse(user, 'User created successfully')
      );
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Update user
   * PUT /api/users/:id
   */
  async update(req, res, next) {
    try {
      const user = await userService.updateUser(parseInt(req.params.id), req.body);
      
      res.status(HTTP_STATUS.OK).json(
        successResponse(user, 'User updated successfully')
      );
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Update own profile
   * PUT /api/profile
   */
  async updateProfile(req, res, next) {
    try {
      const user = await userService.updateProfile(req.user.id, req.body);
      
      res.status(HTTP_STATUS.OK).json(
        successResponse(user, 'Profile updated successfully')
      );
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Deactivate user
   * PATCH /api/users/:id/deactivate
   */
  async deactivate(req, res, next) {
    try {
      const result = await userService.deactivateUser(
        parseInt(req.params.id),
        req.user.id
      );
      
      res.status(HTTP_STATUS.OK).json(
        successResponse(result, 'User deactivated successfully')
      );
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Activate user
   * PATCH /api/users/:id/activate
   */
  async activate(req, res, next) {
    try {
      const result = await userService.activateUser(parseInt(req.params.id));
      
      res.status(HTTP_STATUS.OK).json(
        successResponse(result, 'User activated successfully')
      );
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Delete user (soft delete)
   * DELETE /api/users/:id
   */
  async delete(req, res, next) {
    try {
      const result = await userService.deleteUser(
        parseInt(req.params.id),
        req.user.id
      );
      
      res.status(HTTP_STATUS.OK).json(
        successResponse(result, 'User deleted successfully')
      );
    } catch (error) {
      next(error);
    }
  },
};

module.exports = userController;
