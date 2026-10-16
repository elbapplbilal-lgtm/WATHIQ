/* WATHIQ public-domain-style MVP helpers. Zero third-party dependencies. */
(function (root) {
  'use strict';
  const RECORD_SELECTOR = 'b5c645bd'; // keccak256('record(bytes32)')[0..4]
  const GET_SELECTOR = '11b2b475';    // keccak256('recordedAt(address,bytes32)')[0..4]

  function digestHex(input) {
    if (typeof input !== 'string' || !/^0x[\da-fA-F]{64}$/.test(input)) {
      throw new Error('بصمة الملف غير صحيحة (خاصها 32 بايت).');
    }
    return input.toLowerCase();
  }

  function addressHex(input) {
    if (typeof input !== 'string' || !/^0x[\da-fA-F]{40}$/.test(input)) {
      throw new Error('عنوان المحفظة أو العقد غير صحيح.');
    }
    if (/^0x0{40}$/i.test(input)) throw new Error('عنوان العقد فارغ.');
    return input.toLowerCase();
  }

  function encodeRecord(fileHash) {
    return '0x' + RECORD_SELECTOR + digestHex(fileHash).slice(2);
  }

  function encodeGetTimestamp(wallet, fileHash) {
    const paddedAddress = addressHex(wallet).slice(2).padStart(64, '0');
    return '0x' + GET_SELECTOR + paddedAddress + digestHex(fileHash).slice(2);
  }

  function decodeTimestamp(result) {
    if (typeof result !== 'string' || !/^0x[\da-fA-F]{64}$/.test(result)) {
      throw new Error('جواب غير متوقع من العقد. تأكد من عنوانه والشبكة.');
    }
    return BigInt(result);
  }

  async function hashFile(file, cryptoObject) {
    if (file && typeof file.size === 'number' && file.size > 20 * 1024 * 1024) {
      throw new Error('الملف أكبر من 20 MB، جرّب ملف أصغر.');
    }
    if (!file || typeof file.arrayBuffer !== 'function') {
      throw new Error('اختار ملف أولاً.');
    }
    const secureCrypto = cryptoObject || root.crypto;
    if (!secureCrypto || !secureCrypto.subtle) {
      throw new Error('حساب البصمة كيحتاج HTTPS أو متصفح كيدعم Web Crypto.');
    }
    const content = await file.arrayBuffer();
    const hashed = await secureCrypto.subtle.digest('SHA-256', content);
    return '0x' + Array.from(new Uint8Array(hashed)).map(n => n.toString(16).padStart(2, '0')).join('');
  }

  const api = { RECORD_SELECTOR, GET_SELECTOR, digestHex, addressHex, encodeRecord, encodeGetTimestamp, decodeTimestamp, hashFile };
  root.Wathiq = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(globalThis);
