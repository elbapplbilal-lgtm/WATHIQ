const test = require('node:test');
const assert = require('node:assert/strict');
const { webcrypto } = require('node:crypto');
const { Blob } = require('node:buffer');
const utils = require('../utils.js');

test('SHA-256 file content matches well-known ABC digest', async () => {
  const b = new Blob(['abc']);
  const got = await utils.hashFile(b,webcrypto);
  assert.equal(got,'0xba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
});

test('record ABI call uses correct selector and 32-byte argument', () => {
  const hash = '0x' + 'a1'.repeat(32);
  const calldata = utils.encodeRecord(hash);
  assert.equal(calldata,'0xb5c645bd'+ 'a1'.repeat(32));
  assert.equal(calldata.length,74);
});

test('recordedAt ABI encodes address as padded ABI word and digest', () => {
  const addr='0x'+'12'.repeat(20), hash='0x'+'34'.repeat(32);
  const call = utils.encodeGetTimestamp(addr,hash);
  assert.equal(call,'0x11b2b475'+'0'.repeat(24)+'12'.repeat(20)+'34'.repeat(32));
});

test('invalid inputs are rejected', () => {
  assert.throws(()=>utils.encodeRecord('0xbeef'));
  assert.throws(()=>utils.encodeGetTimestamp('0x123','0x'+'11'.repeat(32)));
  assert.throws(()=>utils.encodeGetTimestamp('0x'+'00'.repeat(20),'0x'+'11'.repeat(32)));
  assert.throws(()=>utils.decodeTimestamp('0x0'));
});

test('decoded timestamp supports unregistered zero and nonzero', () => {
  assert.equal(utils.decodeTimestamp('0x'+'0'.repeat(64)),0n);
  assert.equal(utils.decodeTimestamp('0x'+'0'.repeat(63)+'f'),15n);
});

test('a single byte change creates a completely different SHA-256 digest', async () => {
  const first = await utils.hashFile(new Blob(['contract-v1']), webcrypto);
  const altered = await utils.hashFile(new Blob(['contract-v2']), webcrypto);
  assert.notEqual(first,altered);
  assert.equal(first, await utils.hashFile(new Blob(['contract-v1']), webcrypto));
});

test('20MB size restriction applies to hashing API as well as website UI', async () => {
  const large = { size:20*1024*1024+1, arrayBuffer:async()=>{ throw new Error('Should never read'); } };
  await assert.rejects(utils.hashFile(large,webcrypto),/20 MB/);
});

test('zero address is not accepted for contract or wallet', () => {
  assert.throws(()=>utils.addressHex('0x'+'0'.repeat(40)));
});

test('strict ABI timestamp parser refuses unexpected-length responses', () => {
  for(const bad of [null, 12, '0x0', '0x'+'f'.repeat(65), '0x'+'g'.repeat(64)]) {
    assert.throws(()=>utils.decodeTimestamp(bad));
  }
});
