const userRoutes = require('./user.routes');
const profileRoutes = require('./profile.routes');
const userService = require('./user.service');
const userController = require('./user.controller');
const userRepository = require('./user.repository');

module.exports = {
  userRoutes,
  profileRoutes,
  userService,
  userController,
  userRepository,
};
