const { randomUUID } = require('crypto');
const contentType = require('content-type');

const logger = require('../logger');
const { getSupportedFormats } = require('./convert');

const {
  readFragment,
  writeFragment,
  readFragmentData,
  writeFragmentData,
  listFragments,
  deleteFragment,
} = require('./data');

class Fragment {
  constructor({ id, ownerId, created, updated, type, size = 0 }) {
    if (!ownerId) {
      throw new Error('ownerId is required');
    }

    if (!type) {
      throw new Error('type is required');
    }

    if (!Fragment.isSupportedType(type)) {
      throw new Error(`unsupported type: ${type}`);
    }

    if (typeof size !== 'number') {
      throw new Error('size must be a number');
    }

    if (size < 0) {
      throw new Error('size cannot be negative');
    }

    this.id = id || randomUUID();
    this.ownerId = ownerId;
    this.type = type;
    this.size = size;

    const now = new Date().toISOString();
    this.created = created || now;
    this.updated = updated || now;

    logger.debug(
      { id: this.id, ownerId: this.ownerId, type: this.type, size: this.size },
      'created Fragment instance'
    );
  }

  static async byUser(ownerId, expand = false) {
    logger.debug({ ownerId, expand }, 'Fragment.byUser()');
    const fragments = await listFragments(ownerId, expand);

    if (!fragments) {
      logger.debug({ ownerId }, 'no fragments found for user');
      return [];
    }

    if (expand) {
      return fragments.map((fragment) => new Fragment(JSON.parse(fragment)));
    }

    return fragments;
  }

  static async byId(ownerId, id) {
    logger.debug({ ownerId, id }, 'Fragment.byId()');
    const fragment = await readFragment(ownerId, id);

    if (!fragment) {
      logger.warn({ ownerId, id }, 'fragment metadata not found');
      throw new Error(`Fragment ${id} not found`);
    }

    return new Fragment(fragment);
  }

  static async delete(ownerId, id) {
    logger.info({ ownerId, id }, 'deleting fragment');
    return deleteFragment(ownerId, id);
  }

  async save() {
    this.updated = new Date().toISOString();
    logger.debug({ id: this.id, ownerId: this.ownerId }, 'saving fragment metadata');
    return writeFragment(this);
  }

  getData() {
    logger.debug({ id: this.id, ownerId: this.ownerId }, 'reading fragment data');
    return readFragmentData(this.ownerId, this.id);
  }

  async setData(data) {
    if (!Buffer.isBuffer(data)) {
      logger.warn({ id: this.id }, 'setData() called without a Buffer');
      throw new TypeError('data must be a Buffer');
    }

    this.size = data.length;
    this.updated = new Date().toISOString();
    logger.debug(
      { id: this.id, ownerId: this.ownerId, size: this.size },
      'writing fragment data'
    );
    await writeFragmentData(this.ownerId, this.id, data);
    await writeFragment(this);
  }

  get mimeType() {
    const { type } = contentType.parse(this.type);
    return type;
  }

  get isText() {
    return this.mimeType.startsWith('text/');
  }

  get formats() {
    return getSupportedFormats(this.mimeType);
  }

  static isSupportedType(value) {
    try {
      const { type } = contentType.parse(value);
      return type.startsWith('text/') || type === 'application/json';
    } catch (err) {
      logger.debug({ value, err }, 'unable to parse content type');
      return false;
    }
  }
}

module.exports.Fragment = Fragment;
