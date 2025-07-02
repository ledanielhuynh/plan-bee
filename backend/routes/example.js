const express = require('express');
const router = express.Router();

/**
 * @swagger
 * /api/example:
 *   get:
 *     summary: Example endpoint
 *     responses:
 *       200:
 *         description: Returns a simple message.
 */
router.get('/example', (req, res) => {
  res.json({ message: 'Hello from example route!' });
});

module.exports = router; 