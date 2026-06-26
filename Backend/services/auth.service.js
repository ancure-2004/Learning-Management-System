/**
 * Auth service — business logic + data access for authentication and user management.
 * Throw ApiError for expected failures; the central error handler formats them.
 * Password hashing and comparison are handled by the User model (pre-save hook +
 * comparePassword method); token generation is delegated to the auth middleware.
 */
const User = require('../models/user.model');
const { generateToken } = require('../middleware/auth');
const ApiError = require('../utils/ApiError');

const authService = {
  async register(body) {
    const {
      email, password, role, firstName, lastName, phone,
      department, specialization, enrollmentNumber, program, semester, section,
    } = body;

    // Validation
    if (!email || !password || !role || !firstName || !lastName) {
      throw ApiError.badRequest('Please provide all required fields');
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw ApiError.badRequest('User with this email already exists');
    }

    // For students, check enrollment number uniqueness
    if (role === 'student' && enrollmentNumber) {
      const existingEnrollment = await User.findOne({ enrollmentNumber });
      if (existingEnrollment) {
        throw ApiError.badRequest('Enrollment number already exists');
      }
    }

    // Create user
    const userData = {
      email,
      password,
      role,
      firstName,
      lastName,
      phone,
    };

    // Add role-specific fields
    if (role === 'teacher') {
      userData.department = department;
      userData.specialization = specialization;
    }

    if (role === 'student') {
      userData.enrollmentNumber = enrollmentNumber;
      userData.program = program;
      userData.semester = semester;
      userData.section = section;
    }

    const user = new User(userData);
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    return { token, user: user.toJSON() };
  },

  async login(body) {
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      throw ApiError.badRequest('Please provide email and password');
    }

    // Find user (include password for verification)
    const user = await User.findOne({ email });
    if (!user) {
      throw ApiError.unauthorized('Invalid credentials');
    }

    // Check if account is active
    if (!user.isActive) {
      throw ApiError.unauthorized('Account is deactivated. Please contact admin.');
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw ApiError.unauthorized('Invalid credentials');
    }

    // Generate token
    const token = generateToken(user._id);

    return { token, user: user.toJSON() };
  },

  listUsers(query) {
    const filter = {};
    if (query.role) {
      filter.role = query.role;
    }
    return User.find(filter).select('-password').sort({ createdAt: -1 }).lean();
  },

  async updateUser(requester, userId, body) {
    // Check authorization: admin can update anyone, users can update themselves
    if (requester.role !== 'admin' && requester._id.toString() !== userId) {
      throw ApiError.forbidden('Access denied');
    }

    const updates = { ...body };

    // Remove sensitive fields that shouldn't be updated directly
    delete updates.password;
    delete updates.role; // Role should only be changed by admin through separate endpoint
    delete updates._id;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    return user;
  },

  async changePassword(requester, body) {
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      throw ApiError.badRequest('Please provide current and new password');
    }

    if (newPassword.length < 6) {
      throw ApiError.badRequest('Password must be at least 6 characters');
    }

    // Get user with password
    const user = await User.findById(requester._id);

    // Verify current password
    const isValid = await user.comparePassword(currentPassword);
    if (!isValid) {
      throw ApiError.unauthorized('Current password is incorrect');
    }

    // Update password (pre-save hook re-hashes)
    user.password = newPassword;
    await user.save();
  },

  async deactivateUser(userId) {
    const user = await User.findByIdAndUpdate(
      userId,
      { isActive: false },
      { new: true }
    ).select('-password');

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    return user;
  },

  async activateUser(userId) {
    const user = await User.findByIdAndUpdate(
      userId,
      { isActive: true },
      { new: true }
    ).select('-password');

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    return user;
  },

  async deleteUser(requester, userId) {
    // Prevent admin from deleting themselves
    if (requester._id.toString() === userId) {
      throw ApiError.badRequest('Cannot delete your own account');
    }

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    return user;
  },
};

module.exports = authService;
