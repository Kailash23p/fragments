const express = require('express');
const contentType = require('content-type');

const { Fragment } = require('../../model/fragment');

const router = express.Router();

const rawBody = () =>
  express.raw({
    inflate: true,
    limit: '5mb',
    type: (req) => {
      const contentTypeHeader = req.headers['content-type'];
      if (!contentTypeHeader) {
        return false;
      }

      try {
        const { type } = contentType.parse(contentTypeHeader);
        return Fragment.isSupportedType(type);
      } catch {
        return false;
      }
    },
  });

router.get('/fragments', require('./get'));
router.get('/fragments/:id', require('./get-by-id'));
router.post('/fragments', rawBody(), require('./post'));

module.exports = router;
