const { convertData, extensionToMimeType, getSupportedFormats } = require('../../src/model/convert');

describe('convert module', () => {
  test('extensionToMimeType maps known extensions', () => {
    expect(extensionToMimeType('html')).toBe('text/html');
    expect(extensionToMimeType('md')).toBe('text/markdown');
    expect(extensionToMimeType('json')).toBe('application/json');
    expect(extensionToMimeType('png')).toBeNull();
  });

  test('getSupportedFormats includes markdown html conversion', () => {
    expect(getSupportedFormats('text/markdown')).toEqual(
      expect.arrayContaining(['text/markdown', 'text/html', 'text/plain'])
    );
  });

  test('convertData converts markdown to html', () => {
    const data = Buffer.from('# Title');
    const converted = convertData('text/markdown', data, 'text/html');

    expect(converted.contentType).toMatch(/text\/html/);
    expect(converted.data.toString('utf8')).toContain('<h1>Title</h1>');
  });

  test('convertData rejects unsupported conversions', () => {
    const data = Buffer.from('plain');
    expect(() => convertData('text/plain', data, 'text/html')).toThrow(/cannot convert/);
  });
});
