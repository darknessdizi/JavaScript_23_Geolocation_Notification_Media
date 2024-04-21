/**
 * @jest-environment jsdom
 */

import TimelineController from '../TimelineController';

let arrayCorrds = [
  ['34, 45', { latitude: 34, longitude: 45 }],
  ['-51.50851, 0.12572', { latitude: -51.50851, longitude: 0.12572 }],
  ['51.50851,-0.12572', { latitude: 51.50851, longitude: -0.12572 }],
  ['[51.50851, -0.12572]', { latitude: 51.50851, longitude: -0.12572 }],
  ['[51.50851666,-0.12572777]', { latitude: 51.50851666, longitude: -0.12572777 }],
  ['45.508, -159.12', { latitude: 45.508, longitude: -159.12 }],
];

let testArray = test.each(arrayCorrds);

testArray('Ввод валидных координат (%s)', (currentValue, result) => {
  const input = document.createElement('input');
  input.setAttribute('required', '');
  input.value = currentValue;

  const value = TimelineController.checkCoords(input);
  expect(value).toBeTruthy();
  expect(value).toEqual(result);
  expect(input.checkValidity()).toBeTruthy();
});

arrayCorrds = [
  '',
  'word, 45',
  '-51.50851, 0.12572w',
  '51.,-0.12572',
  '[515.50851, -0.12572]',
  '[51.50851666,-4567.12572777]',
  '51.50851 -45.12572',
];

testArray = test.each(arrayCorrds);

testArray('Ввод невалидных координат (%s)', (currentValue) => {
  const input = document.createElement('input');
  input.setAttribute('required', '');
  input.value = currentValue;

  const value = TimelineController.checkCoords(input);
  expect(value).toBeFalsy();
  expect(input.checkValidity()).toBeFalsy();
});
