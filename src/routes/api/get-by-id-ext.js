const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const { createErrorResponse } = require('../../response');
const { extensionToMimeType, convertData } = require('../../model/convert');

module.exports = async (req, res) => {
  const { id, ext } = req.params;

  try {
    const targetType = extensionToMimeType(ext);
    if (!targetType) {
      logger.warn({ ownerId: req.user, fragmentId: id, ext }, 'unsupported extension');
      return res.status(415).json(createErrorResponse(415, 'unsupported media type'));
    }

    const fragment = await Fragment.byId(req.user, id);
    const data = await fragment.getData();

    if (!data) {
      logger.warn({ ownerId: req.user, fragmentId: id }, 'fragment data not found');
      return res.status(404).json(createErrorResponse(404, 'fragment not found'));
    }

    const converted = convertData(fragment.mimeType, data, targetType);

    logger.debug(
      {
        ownerId: req.user,
        fragmentId: fragment.id,
        sourceType: fragment.mimeType,
        targetType,
        ext,
      },
      'returned converted fragment data'
    );

    res.setHeader('Content-Type', converted.contentType);
    return res.status(200).send(converted.data);
  } catch (err) {
    if (err.message.includes('not found')) {
      logger.warn({ ownerId: req.user, fragmentId: id }, 'fragment not found');
      return res.status(404).json(createErrorResponse(404, 'fragment not found'));
    }

    if (err.message.startsWith('cannot convert')) {
      logger.warn(
        { ownerId: req.user, fragmentId: id, ext, err: err.message },
        'unsupported conversion'
      );
      return res.status(415).json(createErrorResponse(415, 'unsupported media type'));
    }

    logger.error({ err }, 'error getting converted fragment');
    return res.status(500).json(createErrorResponse(500, 'unable to get fragment'));
  }
};
