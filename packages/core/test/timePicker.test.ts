import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatTime, parseTime, segmentText, stepSegment, timeKey, timeRangeValue, typeDigit } from '../src/timePicker.ts';
import { componentText } from '../src/componentTexts.ts';

test('a time travels as two-digit hours and minutes', () => {
  assert.deepEqual(parseTime('08:30'), [8, 30]);
  assert.deepEqual(parseTime('8:05'), [8, 5]);
  assert.equal(formatTime([8, 30]), '08:30');
  assert.equal(formatTime([0, 0]), '00:00');
});

test('anything that is no time leaves both segments empty', () => {
  for (const wrong of ['24:00', '12:60', '1230', '', null, undefined, 'noon']) assert.deepEqual(parseTime(wrong), [null, null], String(wrong));
});

test('a field with an empty segment holds no time', () => {
  assert.equal(formatTime([8, null]), null);
  assert.equal(formatTime([null, 30]), null);
});

test('an empty segment shows its mark, a full one two digits', () => {
  assert.equal(segmentText(null), '--');
  assert.equal(segmentText(7), '07');
});

test('the arrows count a segment round the clock', () => {
  assert.equal(stepSegment(59, 1, 1), 0);
  assert.equal(stepSegment(0, 1, -1), 59);
  assert.equal(stepSegment(23, 0, 1), 0);
  assert.equal(stepSegment(0, 0, -1), 23);
});

test('an empty segment starts at the bottom going up and at the top going down', () => {
  assert.equal(stepSegment(null, 0, 1), 0);
  assert.equal(stepSegment(null, 0, -1), 23);
  assert.equal(stepSegment(null, 1, -1, 15), 45);
});

test('minutes counted in steps land on the step grid', () => {
  assert.equal(stepSegment(7, 1, 1, 15), 15);
  assert.equal(stepSegment(7, 1, -1, 15), 0);
  assert.equal(stepSegment(45, 1, 1, 15), 0);
});

test('a first digit waits for a second unless none could follow', () => {
  assert.deepEqual(typeDigit(0, '', 1), { value: 1, buffer: '1', done: false });
  assert.deepEqual(typeDigit(0, '1', 7), { value: 17, buffer: '', done: true });
  assert.deepEqual(typeDigit(0, '', 3), { value: 3, buffer: '', done: true });
  assert.deepEqual(typeDigit(1, '', 6), { value: 6, buffer: '', done: true });
  assert.deepEqual(typeDigit(1, '', 5), { value: 5, buffer: '5', done: false });
});

test('a second digit that runs past the clock starts the segment over', () => {
  assert.deepEqual(typeDigit(0, '2', 7), { value: 7, buffer: '', done: true });
});

test('digits fill the hours, then the focus moves on to the minutes', () => {
  const first = timeKey([null, null], 0, '0', '');
  assert.deepEqual(first, { values: [0, null], buffer: '0', focus: 0 });
  assert.deepEqual(timeKey(first!.values, 0, '8', first!.buffer), { values: [8, null], buffer: '', focus: 1 });
});

test('in a range the last minute of the start moves on to the end', () => {
  assert.equal(timeKey([8, null, null, null], 1, '7', '')!.focus, 2);
  assert.equal(timeKey([8, 0, 17, null], 3, '7', '')!.focus, 3);
});

test('the arrows up and down count, sideways they move between the segments', () => {
  assert.deepEqual(timeKey([8, 0], 1, 'ArrowUp', '', 15), { values: [8, 15], buffer: '', focus: 1 });
  assert.deepEqual(timeKey([8, 0], 0, 'ArrowDown', ''), { values: [7, 0], buffer: '', focus: 0 });
  assert.equal(timeKey([8, 0], 0, 'ArrowRight', '')!.focus, 1);
  assert.equal(timeKey([8, 0], 1, 'ArrowLeft', '')!.focus, 0);
  assert.equal(timeKey([8, 0], 1, 'ArrowRight', '')!.focus, 1);
  assert.equal(timeKey([8, 0, 17, 0], 1, 'ArrowRight', '')!.focus, 2);
});

test('Home and End go to the ends of the segment', () => {
  assert.deepEqual(timeKey([8, 20], 0, 'End', '')!.values, [23, 20]);
  assert.deepEqual(timeKey([8, 20], 1, 'End', '', 15)!.values, [8, 45]);
  assert.deepEqual(timeKey([8, 20], 1, 'Home', '')!.values, [8, 0]);
});

test('a colon after the hours moves on to the minutes', () => {
  assert.equal(timeKey([8, null], 0, ':', '')!.focus, 1);
});

test('Backspace empties a segment, and in an empty one steps back', () => {
  assert.deepEqual(timeKey([8, 30], 1, 'Backspace', ''), { values: [8, null], buffer: '', focus: 1 });
  assert.deepEqual(timeKey([8, null], 1, 'Backspace', ''), { values: [8, null], buffer: '', focus: 0 });
});

test('a key a segment does not take is left to the page', () => {
  assert.equal(timeKey([8, 30], 0, 'Tab', ''), null);
  assert.equal(timeKey([8, 30], 0, 'a', ''), null);
});

test('a range travels as its start and its end, each null while a segment is empty', () => {
  assert.deepEqual(timeRangeValue([8, 0, 17, 0]), ['08:00', '17:00']);
  assert.deepEqual(timeRangeValue([8, 0, null, 0]), ['08:00', null]);
});

test('the time picker speaks every language the components do', () => {
  assert.equal(componentText('de').timePicker.hour, 'Stunden');
  assert.equal(componentText('en').timePicker.to, 'to');
});
