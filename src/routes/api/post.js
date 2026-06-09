const contentType = require('content-type');

const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const { createErrorResponse, createSuccessResponse } = require('../../response');

module.exports = async (req, res) => {
  try {
    let type;

    const contentTypeHeader = req.headers['content-type'];
    if (!contentTypeHeader) {
      logger.warn({ headers: req.headers }, 'missing Content-Type header');
      return res.status(400).json(createErrorResponse(400, 'invalid Content-Type header'));
    }

    try {
      ({ type } = contentType.parse(contentTypeHeader));
    } catch (err) {
      logger.warn({ err, headers: req.headers }, 'unable to parse Content-Type header');
      return res.status(400).json(createErrorResponse(400, 'invalid Content-Type header'));
    }

    if (!Fragment.isSupportedType(type)) {
      logger.warn({ type }, 'unsupported fragment type');
      return res.status(415).json(createErrorResponse(415, 'unsupported media type'));
    }

    if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
      logger.warn({ type }, 'request body is missing or empty');
      return res.status(400).json(createErrorResponse(400, 'missing fragment data'));
    }

    const fragment = new Fragment({ ownerId: req.user, type, size: 0 });
    await fragment.save();
    await fragment.setData(req.body);

    const baseUrl = process.env.API_URL || `http://${req.headers.host}`;
    const location = new URL(`/v1/fragments/${fragment.id}`, baseUrl);

    logger.info(
      { ownerId: req.user, fragmentId: fragment.id, type: fragment.type, size: fragment.size },
      'created fragment'
    );

    res.setHeader('Location', location.href);
    return res.status(201).json(createSuccessResponse({ fragment }));
  } catch (err) {
    logger.error({ err }, 'error creating fragment');
    return res.status(500).json(createErrorResponse(500, 'unable to create fragment'));
  }
};
