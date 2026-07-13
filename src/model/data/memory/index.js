const logger = require('../../../logger');
const MemoryDB = require('./memory-db');

const data = new MemoryDB();
const metadata = new MemoryDB();

async function writeFragment(fragment) {
  logger.debug(
    { ownerId: fragment.ownerId, id: fragment.id, type: fragment.type, size: fragment.size },
    'writeFragment()'
  );
  const serialized = JSON.stringify(fragment);
  return metadata.put(fragment.ownerId, fragment.id, serialized);
}

async function readFragment(ownerId, id) {
  logger.debug({ ownerId, id }, 'readFragment()');
  const serialized = await metadata.get(ownerId, id);

  if (!serialized) {
    logger.debug({ ownerId, id }, 'fragment metadata not found in memory db');
    return undefined;
  }

  return typeof serialized === 'string' ? JSON.parse(serialized) : serialized;
}

async function writeFragmentData(ownerId, id, buffer) {
  logger.debug({ ownerId, id, size: buffer?.length }, 'writeFragmentData()');
  return data.put(ownerId, id, buffer);
}

async function readFragmentData(ownerId, id) {
  logger.debug({ ownerId, id }, 'readFragmentData()');
  const buffer = await data.get(ownerId, id);

  if (!buffer) {
    logger.debug({ ownerId, id }, 'fragment data not found in memory db');
  }

  return buffer;
}

async function listFragments(ownerId, expand = false) {
  logger.debug({ ownerId, expand }, 'listFragments()');
  const fragments = await metadata.query(ownerId);

  if (expand || !fragments) {
    return fragments;
  }

  return fragments.map((fragment) => JSON.parse(fragment).id);
}

async function deleteFragment(ownerId, id) {
  logger.info({ ownerId, id }, 'deleteFragment()');
  return Promise.all([metadata.del(ownerId, id), data.del(ownerId, id)]);
}

module.exports.listFragments = listFragments;
module.exports.writeFragment = writeFragment;
module.exports.readFragment = readFragment;
module.exports.writeFragmentData = writeFragmentData;
module.exports.readFragmentData = readFragmentData;
module.exports.deleteFragment = deleteFragment;
