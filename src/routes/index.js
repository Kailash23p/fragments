const express = require('express');

const { author, version } = require('../../package.json');
const { authenticate } = require('../auth');

const router = express.Router();

router.use('/v1', authenticate(), require('./api'));

router.get('/', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache');

  res.status(200).json({
    status: 'ok',
    description: 'fragments service running normally',
    author,
    githubUrl: 'https://github.com/Kailash23p/fragments',
    version,
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
