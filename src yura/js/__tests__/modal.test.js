import Modal from '../Modal';

const testObject = { value: '51.50851, −0.12572' };

const modal = new Modal(null, null, null, null, testObject);

test('modal window should process input correctly', () => {
  expect(modal.checkModalFormInput()).toBeTruthy();
  testObject.value = '51.50851,−0.12572';
  expect(modal.checkModalFormInput()).toBeTruthy();
  testObject.value = '[51.50851, −0.12572]';
  expect(modal.checkModalFormInput()).toBeTruthy();
  testObject.value = '−120.22222222';
  expect(modal.checkModalFormInput()).toBeFalsy();
  testObject.value = '[00051.50851, −0.12]';
  expect(modal.checkModalFormInput()).toBeFalsy();
  testObject.value = '[51.50851, −12572]';
  expect(modal.checkModalFormInput()).toBeFalsy();
  testObject.value = '[51.50851, −190.12572]';
  expect(modal.checkModalFormInput()).toBeFalsy();
});
