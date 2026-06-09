const hash = require('../../src/hash');
const {
  readFragment,
  writeFragment,
  readFragmentData,
  writeFragmentData,
} = require('../../src/model/data/memory');

describe('memory data backend', () => {
  const ownerId = hash('test-user1@fragments-testing.com');
  const fragment = {
    id: '11111111-1111-1111-1111-111111111111',
    ownerId,
    created: '2021-11-02T15:09:50.403Z',
    updated: '2021-11-02T15:09:50.403Z',
    type: 'text/plain',
    size: 5,
  };

  test('writeFragment() and readFragment() round-trip metadata', async () => {
    await writeFragment(fragment);
    const result = await readFragment(ownerId, fragment.id);
    expect(result).toEqual(fragment);
  });

  test('writeFragmentData() and readFragmentData() round-trip binary data', async () => {
    const data = Buffer.from('hello');
    await writeFragmentData(ownerId, fragment.id, data);
    const result = await readFragmentData(ownerId, fragment.id);
    expect(result).toEqual(data);
  });

  test('readFragment() returns undefined for unknown fragment', async () => {
    const result = await readFragment(ownerId, 'missing-id');
    expect(result).toBeUndefined();
  });

  test('readFragmentData() returns undefined for unknown fragment data', async () => {
    const result = await readFragmentData(ownerId, 'missing-id');
    expect(result).toBeUndefined();
  });
});
