const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const { createErrorResponse } = require('../../response');

module.exports = async (req, res) => {
  try {
    const fragment = await Fragment.byId(req.user, req.params.id);
    const data = await fragment.getData();

    if (!data) {
      logger.warn({ ownerId: req.user, fragmentId: req.params.id }, 'fragment data not found');
      return res.status(404).json(createErrorResponse(404, 'fragment not found'));
    }

    logger.debug(
      { ownerId: req.user, fragmentId: fragment.id, type: fragment.type, size: fragment.size },
      'returned fragment data'
    );

    res.setHeader('Content-Type', fragment.type);
    return res.status(200).send(data);
  } catch (err) {
    if (err.message.includes('not found')) {
      logger.warn({ ownerId: req.user, fragmentId: req.params.id }, 'fragment not found');
      return res.status(404).json(createErrorResponse(404, 'fragment not found'));
    }

    logger.error({ err }, 'error getting fragment');
    return res.status(500).json(createErrorResponse(500, 'unable to get fragment'));
  }
};
