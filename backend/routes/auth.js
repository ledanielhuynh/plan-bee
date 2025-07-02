const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - tag
 *         - username
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *         password:
 *           type: string
 *           minLength: 6
 *           description: User's password (minimum 6 characters)
 *         tag:
 *           type: string
 *           minLength: 3
 *           maxLength: 30
 *           pattern: '^[a-zA-Z0-9_]+$'
 *           description: Unique user tag (alphanumeric and underscore only)
 *         username:
 *           type: string
 *           maxLength: 30
 *           description: User's display name
 *     AuthResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         token:
 *           type: string
 *           description: JWT token for authentication
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             email:
 *               type: string
 *             tag:
 *               type: string
 *             username:
 *               type: string
 *             profilePicture:
 *               type: string
 *             stats:
 *               type: object
 *               properties:
 *                 totalTasksCompleted:
 *                   type: number
 *                 currentStreak:
 *                   type: number
 *                 highestStreak:
 *                   type: number
 *                 totalPoints:
 *                   type: number
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - tag
 *               - username
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: "password123"
 *               tag:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 30
 *                 pattern: '^[a-zA-Z0-9_]+$'
 *                 example: "john_doe123"
 *               username:
 *                 type: string
 *                 maxLength: 30
 *                 example: "John Doe"
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Invalid input or user already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Email already exists"
 *       500:
 *         description: Server error
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, tag, username } = req.body;

    // Validate input
    if (!email || !password || !tag || !username) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, tag, and username are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Validate tag format
    if (!/^[a-zA-Z0-9_]+$/.test(tag)) {
      return res.status(400).json({
        success: false,
        message: 'Tag can only contain letters, numbers, and underscores'
      });
    }

    if (tag.length < 3 || tag.length > 30) {
      return res.status(400).json({
        success: false,
        message: 'Tag must be between 3 and 30 characters'
      });
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Check if tag is available
    const isTagAvailable = await User.isTagAvailable(tag);
    if (!isTagAvailable) {
      return res.status(400).json({
        success: false,
        message: 'This tag is already taken'
      });
    }

    // Create new user
    const user = new User({
      email,
      password,
      username,
      tag
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Return user data (without password)
    const userResponse = {
      id: user._id,
      email: user.email,
      tag: user.tag,
      username: user.username,
      profilePicture: user.profilePicture,
      stats: user.stats
    };

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - identifier
 *               - password
 *             properties:
 *               identifier:
 *                 type: string
 *                 description: User's email or tag
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid credentials"
 *       500:
 *         description: Server error
 */
router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;

    // Validate input
    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Identifier (email or tag) and password are required'
      });
    }

    // Find user by email or tag
    const user = await User.findOne({
      $or: [
        { email: identifier },
        { tag: identifier }
      ]
    });
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Return user data (without password)
    const userResponse = {
      id: user._id,
      email: user.email,
      tag: user.tag,
      username: user.username,
      profilePicture: user.profilePicture,
      stats: user.stats
    };

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

/**
 * @swagger
 * /api/auth/change-tag:
 *   post:
 *     summary: Change user tag (allowed every 3 months)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newTag
 *             properties:
 *               newTag:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 30
 *                 pattern: '^[a-zA-Z0-9_]+$'
 *                 example: "new_tag_123"
 *     responses:
 *       200:
 *         description: Tag changed successfully
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
 *                   example: "Tag changed successfully"
 *                 newTag:
 *                   type: string
 *                   example: "new_tag_123"
 *       400:
 *         description: Invalid input or tag not available
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Tag change not allowed (3-month restriction)
 *       500:
 *         description: Server error
 */
router.post('/change-tag', async (req, res) => {
  try {
    const { newTag } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    // Verify token and get user
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    // Check if user can change tag (3 months rule)
    if (!user.canChangeTag()) {
      const nextChangeDate = new Date(user.tagLastChanged);
      nextChangeDate.setMonth(nextChangeDate.getMonth() + 3);
      
      return res.status(403).json({
        success: false,
        message: `Tag can only be changed every 3 months. Next change allowed on ${nextChangeDate.toDateString()}`
      });
    }

    // Validate new tag format
    if (!/^[a-zA-Z0-9_]+$/.test(newTag)) {
      return res.status(400).json({
        success: false,
        message: 'Tag can only contain letters, numbers, and underscores'
      });
    }

    if (newTag.length < 3 || newTag.length > 30) {
      return res.status(400).json({
        success: false,
        message: 'Tag must be between 3 and 30 characters'
      });
    }

    // Check if new tag is available
    const isTagAvailable = await User.isTagAvailable(newTag);
    if (!isTagAvailable) {
      return res.status(400).json({
        success: false,
        message: 'This tag is already taken'
      });
    }

    // Update tag
    const oldTag = user.tag;
    user.tag = newTag;
    user.tagLastChanged = new Date();
    await user.save();

    res.json({
      success: true,
      message: 'Tag changed successfully',
      oldTag,
      newTag: user.tag
    });

  } catch (error) {
    console.error('Change tag error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during tag change'
    });
  }
});

module.exports = router; 