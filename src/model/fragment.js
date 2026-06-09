const { randomUUID } = require('crypto');
const contentType = require('content-type');

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
  }

  static async byUser(ownerId, expand = false) {
    const fragments = await listFragments(ownerId, expand);

    if (!fragments) {
      return [];
    }

    if (expand) {
      return fragments.map((fragment) => new Fragment(JSON.parse(fragment)));
    }

    return fragments;
  }

  static async byId(ownerId, id) {
    const fragment = await readFragment(ownerId, id);

    if (!fragment) {
      throw new Error(`Fragment ${id} not found`);
    }

    return new Fragment(fragment);
  }

  static delete(ownerId, id) {
    return deleteFragment(ownerId, id);
  }

  save() {
    this.updated = new Date().toISOString();
    return writeFragment(this);
  }

  getData() {
    return readFragmentData(this.ownerId, this.id);
  }

  async setData(data) {
    if (!Buffer.isBuffer(data)) {
      throw new TypeError('data must be a Buffer');
    }

    this.size = data.length;
    this.updated = new Date().toISOString();
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
    if (this.mimeType === 'text/plain') {
      return ['text/plain'];
    }

    return [];
  }

  static isSupportedType(value) {
    try {
      const { type } = contentType.parse(value);
      return type === 'text/plain';
    } catch {
      return false;
    }
  }
}

module.exports.Fragment = Fragment;
