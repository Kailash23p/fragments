const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const { createErrorResponse, createSuccessResponse } = require('../../response');

module.exports = async (req, res) => {
  try {
    const expand = req.query.expand === '1';
    const fragments = await Fragment.byUser(req.user, expand);

    logger.debug({ ownerId: req.user, count: fragments.length, expand }, 'listed fragments');

    return res.status(200).json(createSuccessResponse({ fragments }));
  } catch (err) {
    logger.error({ err }, 'error listing fragments');
    return res.status(500).json(createErrorResponse(500, 'unable to list fragments'));
  }
};
