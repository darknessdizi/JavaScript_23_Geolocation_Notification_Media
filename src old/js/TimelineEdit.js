export default class TimelineEdit {
  constructor() {
    this.main = null;
    this.fieldPosts = null;
    this.input = null;
    this.popup = null;
    this.videoListeners = [];
    this.microListeners = [];
    this.inputListeners = [];
    this.popupListeners = [];
    this.cords = null;
  }

  bindToDOM() {
    // Добавляет поле main к элементу body
    const nav = navigator.geolocation;
    if (nav) {
      nav.getCurrentPosition((data) => {
        this.cords = {
          latitude: data.coords.latitude,
          longitude: data.coords.longitude
        }
      });
    }

    this.createMain();
  }

  getStringCords(number) {
    // Получение строки с координатами
    const latitude = this.cords.latitude.toFixed(number);
    const longitude = this.cords.longitude.toFixed(number);
    return `${latitude}, ${longitude}`;
  }

  createMain() {
    // Создает элемент main содержащий весь контент
    const body = document.querySelector('body');
    this.main = TimelineEdit.addTagHTML(body, 'content', 'main');
    this.fieldPosts = TimelineEdit.addTagHTML(this.main, 'content-field-posts');
    const fieldInput = TimelineEdit.addTagHTML(this.main, 'content-field-input');

    this.input = TimelineEdit.addTagHTML(fieldInput, 'field-input', 'input');
    this.input.setAttribute('placeholder', 'Введите текстовое сообщение');
    this.input.focus();
    const micro = TimelineEdit.addTagHTML(fieldInput, 'input-actions');
    micro.classList.add('action-micro');
    const video = TimelineEdit.addTagHTML(fieldInput, 'input-actions');
    video.classList.add('action-video');

    this.input.addEventListener('change', (o) => this.onPressInput(o));
    micro.addEventListener('click', (o) => this.onPressMicro(o));
    video.addEventListener('click', (o) => this.onPressVideo(o));
  }

  drawPopup() {
    // Отрисовывает всплывающее окно
    this.popup = TimelineEdit.addTagHTML(this.main, 'background-popup');
    const conteiner = TimelineEdit.addTagHTML(this.popup, 'popup', 'form');

    const messages = TimelineEdit.addTagHTML(conteiner, 'popup-message');
    const lineFirst = TimelineEdit.addTagHTML(messages, 'popup-body', 'p');
    lineFirst.textContent = 'Что-то пошло не так';
    const lineSecond = TimelineEdit.addTagHTML(messages, 'popup-body', 'p');
    lineSecond.textContent = 'К сожалению, нам не удалось определить Ваше местонахождение, пожалуйста, дайте разрешение на использование геолокации, либо введите координаты вручную.';
    const lineThred = TimelineEdit.addTagHTML(messages, 'popup-body', 'p');
    lineThred.textContent = 'Широта и долгота через запятую';

    const input = TimelineEdit.addTagHTML(conteiner, 'popup-input', 'input');
    input.setAttribute('required', '');
    input.value = '51.50851, -0.12572';
    input.focus();

    const blockDiv = TimelineEdit.addTagHTML(conteiner, 'popup-control');
    const cancel = TimelineEdit.addTagHTML(blockDiv, 'control-cancel', 'button');
    cancel.setAttribute('type', 'button');
    cancel.textContent = 'Отмена';

    const btnOk = TimelineEdit.addTagHTML(blockDiv, 'control-ok', 'button');
    btnOk.setAttribute('type', 'submit');
    btnOk.textContent = 'Ок';

    cancel.addEventListener('click', () => {
      this.popup.remove();
    });

    btnOk.addEventListener('click', (o) => this.onPopupClick(o));
    input.addEventListener('input', () => {
      input.setCustomValidity('');
    });
  }

  drawMessage() {
    // Отрисовка нового текстового сообщения
    if (!this.cords) {
      this.drawPopup();
      return;
    }
    const conteiner = document.createElement('div');
    conteiner.classList.add('content-post');
    this.fieldPosts.prepend(conteiner);

    const row = TimelineEdit.addTagHTML(conteiner, 'content-row');
    const message = TimelineEdit.addTagHTML(row, 'post-message');
    message.textContent = this.input.value;
    this.input.value = '';
    const date = TimelineEdit.addTagHTML(row, 'post-date');
    const time = Date.now();
    date.textContent = TimelineEdit.getNewFormatDate(time);
    const cords = TimelineEdit.addTagHTML(conteiner, 'post-cords');
    cords.textContent = `[${this.getStringCords(5)}]`;
  }

  static getNewFormatDate(timestamp) {
    // возвращает новый формат даты и времени
    const start = new Date(timestamp);
    const year = String(start.getFullYear());
    const month = TimelineEdit._addZero(start.getMonth() + 1);
    const date = TimelineEdit._addZero(start.getDate());
    const hours = TimelineEdit._addZero(start.getHours());
    const minutes = TimelineEdit._addZero(start.getMinutes());
    const time = `${date}.${month}.${year} ${hours}:${minutes}`;
    return time;
  }

  static _addZero(number) {
    // делает число двухзначным
    let result = number;
    if (result < 10) {
      result = `0${result}`;
    }
    return result;
  }

  static addTagHTML(parent, className = null, type = 'div') {
    // Создает заданный тег и добавляет его в parent
    const div = document.createElement(type);
    div.classList.add(className);
    parent.append(div);
    return div;
  }

  onPopupClick(event) {
    // Вызывает callback при нажатии ОК поля popup
    // event.preventDefault(); // необходимо отключить, чтобы использовать подсказки браузера
    this.popupListeners.forEach((o) => o.call(null, event));
  }

  addPopupListeners(callback) {
    this.popupListeners.push(callback);
  }

  onPressInput(event) {
    // Вызывает callback при нажатии ввода поля input
    console.log('нажали enter');
    this.inputListeners.forEach((o) => o.call(null, event));
  }

  addInputListeners(callback) {
    this.inputListeners.push(callback);
  }

  onPressMicro(event) {
    // Вызывает callback при нажатии иконки микрофона
    console.log('нажали микрофон');
    this.microListeners.forEach((o) => o.call(null, event));
  }

  addMicroListeners(callback) {
    this.microListeners.push(callback);
  }

  onPressVideo(event) {
    // Вызывает callback при нажатии иконки видео
    console.log('нажали видео');
    this.videoListeners.forEach((o) => o.call(null, event));
  }

  addVideoListeners(callback) {
    this.videoListeners.push(callback);
  }
}