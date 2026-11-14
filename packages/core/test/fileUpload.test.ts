import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FILE_UPLOAD_TEXT, formatFileSize } from '../src/fileUpload.ts';

test('a size takes the largest unit that keeps it at one or more', () => {
  assert.equal(formatFileSize(512, 'en'), '512 byte');
  assert.equal(formatFileSize(2_400, 'en'), '2.4 kB');
  assert.equal(formatFileSize(15_300_000, 'en'), '15.3 MB');
  assert.equal(formatFileSize(3_000_000_000, 'en'), '3 GB');
});

test('three digits before the point need none after it', () => {
  assert.equal(formatFileSize(245_600_000, 'en'), '246 MB');
});

test('a size is written in the language of the page', () => {
  assert.equal(formatFileSize(2_400, 'de'), '2,4 kB');
});

test('a refused file is named with its reason', () => {
  assert.equal(FILE_UPLOAD_TEXT.refused('scan.tiff', 'FILE_TOO_LARGE'), 'scan.tiff is too large');
});
