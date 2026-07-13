const MarkdownIt = require('markdown-it');

const md = new MarkdownIt();

const EXT_TO_TYPE = {
  txt: 'text/plain',
  md: 'text/markdown',
  html: 'text/html',
  csv: 'text/csv',
  json: 'application/json',
  yaml: 'application/yaml',
  yml: 'application/yaml',
};

const TYPE_EXTENSIONS = {
  'text/plain': ['txt'],
  'text/markdown': ['md', 'html', 'txt'],
  'text/html': ['html', 'txt'],
  'text/csv': ['csv', 'txt', 'json'],
  'application/json': ['json', 'yaml', 'yml', 'txt'],
  'application/yaml': ['yaml', 'txt'],
};

function extensionToMimeType(ext) {
  return EXT_TO_TYPE[ext.toLowerCase()] || null;
}

function mimeTypeToContentType(mimeType) {
  if (mimeType.startsWith('text/') || mimeType === 'application/json') {
    return `${mimeType}; charset=utf-8`;
  }

  return mimeType;
}

function getSupportedFormats(mimeType) {
  const extensions = TYPE_EXTENSIONS[mimeType] || [];
  const formats = new Set([mimeType]);

  extensions.forEach((ext) => {
    const type = EXT_TO_TYPE[ext];
    if (type) {
      formats.add(type);
    }
  });

  return [...formats];
}

function isConversionSupported(sourceType, targetType) {
  return getSupportedFormats(sourceType).includes(targetType);
}

function convertData(sourceType, data, targetType) {
  if (!Buffer.isBuffer(data)) {
    throw new TypeError('data must be a Buffer');
  }

  if (!isConversionSupported(sourceType, targetType)) {
    throw new Error(`cannot convert ${sourceType} to ${targetType}`);
  }

  if (sourceType === targetType) {
    return {
      contentType: mimeTypeToContentType(targetType),
      data,
    };
  }

  if (sourceType === 'text/markdown' && targetType === 'text/html') {
    const html = md.render(data.toString('utf8'));
    return {
      contentType: mimeTypeToContentType('text/html'),
      data: Buffer.from(html, 'utf8'),
    };
  }

  if (targetType === 'text/plain') {
    return {
      contentType: mimeTypeToContentType('text/plain'),
      data,
    };
  }

  if (sourceType === 'application/json' && targetType === 'text/plain') {
    return {
      contentType: mimeTypeToContentType('text/plain'),
      data,
    };
  }

  throw new Error(`cannot convert ${sourceType} to ${targetType}`);
}

module.exports = {
  EXT_TO_TYPE,
  TYPE_EXTENSIONS,
  extensionToMimeType,
  mimeTypeToContentType,
  getSupportedFormats,
  isConversionSupported,
  convertData,
};
