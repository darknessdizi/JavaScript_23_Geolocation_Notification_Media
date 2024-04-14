export default class TimelineController {
  constructor(editor) {
    this.edit = editor;
  }

  init() {
    this.edit.bindToDOM();

    this.edit.addInputListeners(this.onPressInput.bind(this));
    this.edit.addMicroListeners(this.onPressMicro.bind(this));
    this.edit.addVideoListeners(this.onPressVideo.bind(this));
    this.edit.addPopupListeners(this.onPopupClick.bind(this));
  }

  compareCords(value) {
    // Проверка ввода данных координат пользователем
    const regexp2 = /^[-+]?\d{1,2}(?:\.\d+)?,\s*[-+]?\d{1,3}(?:\.\d+)?$/;
    const regexp = /^\[[-+]?\d{1,2}(?:\.\d+)?,\s*[-+]?\d{1,3}(?:\.\d+)?\]$/;

    if (regexp.test(value)) {
      console.log('проверка успешна', regexp.test(value));
      return true;
    } else {
      if (regexp2.test(value)) {
        console.log('проверка успешна', regexp2.test(value));
        return true;
      }
    }
    console.log('Проверка не пройдена');
    return false;
  }

  onPopupClick(event) {
    // Callback - нажатие кнопки ОК в поле popup
    console.log('нажали ОК в popup', event);
    const parent = event.target.closest('.popup');
    const input = parent.querySelector('.popup-input');
    if (input.validity['valueMissing']) {
      input.setCustomValidity('Укажите широту и долготу согласно образца');
      return;
    }
    // if (!parent.checkValidity()) {
    //   console.log('/////////////', parent.checkValidity());
    //   return;
    // }
    const check = this.compareCords(input.value);
    if (!check) {
      input.setCustomValidity('Проверка не пройдена');
      return;
    }
    event.preventDefault();
    this.edit.cords = {
      latitude: 11, // указать новые координаты
      longitude: 22
    }
    this.edit.popup.remove();
    this.edit.drawMessage();
  }

  onPressInput(event) {
    // Callback - нажатие кнопки enter в поле ввода сообщения
    this.edit.drawMessage();
  }

  onPressMicro(event) {
    // Callback - нажатие кнопки микрофон
  }

  onPressVideo(event) {
    // Callback - нажатие кнопки видео
  }
}