const authService = require('./auth.service');
const { successResponse } = require('../../shared/utils/responseFormatter');
const { HTTP_STATUS } = require('../../shared/constants');

/**
 * Auth Controller
 */
const authController = {
  /**
   * Login
   * POST /api/auth/login
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      
      const result = await authService.login(email, password);
      
      res.status(HTTP_STATUS.OK).json(
        successResponse(result, 'Login successful')
      );
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Logout
   * POST /api/auth/logout
   */
  async logout(req, res, next) {
    try {
      await authService.logout(req.tokenJti, req.user.id);
      
      res.status(HTTP_STATUS.OK).json(
        successResponse(null, 'Logout successful')
      );
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Get Current User
   * GET /api/auth/me
   */
  async me(req, res, next) {
    try {
      const user = await authService.getCurrentUser(req.user.id);
      
      res.status(HTTP_STATUS.OK).json(
        successResponse(user, 'User retrieved successfully')
      );
    } catch (error) {
      next(error);
    }
  },
};

module.exports = authController;
