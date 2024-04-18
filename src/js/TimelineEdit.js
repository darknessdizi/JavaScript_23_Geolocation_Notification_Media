export default class TimelineEdit {
  constructor() {
    this.main = null;
    this.fieldPosts = null;
    this.input = null;
    this.popup = null;
    this.btnVideo = null;
    this.btnMicro = null;
    this.btnAccept = null;
    this.btnCancel = null;
    this.time = null;
    this.videoListeners = [];
    this.microListeners = [];
    this.inputListeners = [];
    this.popupListeners = [];
    this.crossListeners = [];
    this.acceptListeners = [];
    this.cords = null;
    this.fieldVideo = null;
  }

  bindToDOM() {
    // Добавляет поле main к элементу body
    // const nav = navigator.geolocation;
    // console.log('получение nav', nav);
    // if (nav) {
    //   console.log('условие координат');
    //   nav.getCurrentPosition((data) => {
    //     console.log('получение координат', data);
    //     this.cords = {
    //       latitude: data.coords.latitude,
    //       longitude: data.coords.longitude
    //     }
    //   });
    // }

    this.createMain();
  }

  createMain() {
    // Создает элемент main содержащий весь контент
    const body = document.querySelector('body');
    this.main = TimelineEdit.addTagHTML(body, 'content', 'main');
    const field = TimelineEdit.addTagHTML(this.main, 'content-field');
    this.fieldPosts = TimelineEdit.addTagHTML(field, 'content-field-posts');
    const fieldInput = TimelineEdit.addTagHTML(this.main, 'content-field-input', 'form');

    this.input = TimelineEdit.addTagHTML(fieldInput, 'field-input', 'input');
    this.input.setAttribute('placeholder', 'Введите текстовое сообщение');
    this.input.focus();

    this.btnMicro = TimelineEdit.addTagHTML(fieldInput, 'input-actions');
    this.btnMicro.classList.add('action-micro');

    this.btnAccept = TimelineEdit.addTagHTML(fieldInput, 'input-actions');
    this.btnAccept.classList.add('action-accept');
    this.btnAccept.classList.add('hidden');

    this.time = TimelineEdit.addTagHTML(fieldInput, 'actions-text');
    const span = TimelineEdit.addTagHTML(this.time, 'text-time', 'span');
    span.textContent = '00.00';
    this.time.classList.add('hidden');

    this.btnCancel = TimelineEdit.addTagHTML(fieldInput, 'input-actions');
    this.btnCancel.classList.add('action-cancel');
    this.btnCancel.classList.add('hidden');

    this.btnVideo = TimelineEdit.addTagHTML(fieldInput, 'input-actions');
    this.btnVideo.classList.add('action-video');

    fieldInput.addEventListener('submit', (o) => this.onPressInput(o));
    this.btnMicro.addEventListener('click', (o) => this.onPressMicro(o));
    this.btnVideo.addEventListener('click', (o) => this.onPressVideo(o));
    this.btnCancel.addEventListener('click', () => this.onPressCross());
    this.btnAccept.addEventListener('click', (o) => this.onPressAccept(o));
  }

  drawFieldVideo(parent) {
    // Отрисовывает всплывающее окно для записи видеопотока
    this.fieldVideo = TimelineEdit.addTagHTML(parent, 'field-video', 'video');
    this.fieldVideo.setAttribute('autoplay', '');
    this.fieldVideo.setAttribute('muted', '');
    // this.fieldVideo.setAttribute('src', 'null');
    this.input.value = '';
  }

  drawPopup(type = 'message') {
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
    input.setAttribute('placeholder', 'Пример: [51.50851, -0.12572]');
    input.focus();

    const blockDiv = TimelineEdit.addTagHTML(conteiner, 'popup-control');
    const cancel = TimelineEdit.addTagHTML(blockDiv, 'control-cancel', 'button');
    cancel.setAttribute('type', 'button');
    cancel.textContent = 'Отмена';

    const btnOk = TimelineEdit.addTagHTML(blockDiv, 'control-ok', 'button');
    btnOk.setAttribute('type', 'submit');
    btnOk.textContent = 'Ок';

    cancel.addEventListener('click', () => this.popup.remove());
    btnOk.addEventListener('click', (o) => this.onPopupClick(o, type));
    input.addEventListener('input', () => input.setCustomValidity(''));
  }

  drawMessage(stringDate) {
    // Добавляет новое сообщение в ленту
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
    cords.textContent = `[${stringDate}]`;
  }

  drawAudio(stringDate) {
    // добавляет аудио в ленту
    const conteiner = document.createElement('div');
    conteiner.classList.add('content-post');
    this.fieldPosts.prepend(conteiner);

    const row = TimelineEdit.addTagHTML(conteiner, 'content-row');
    const audio = TimelineEdit.addTagHTML(row, 'post-audio', 'audio');
    audio.setAttribute('controls', '');
    // message.textContent = this.input.value;
    // this.input.value = '';
    const date = TimelineEdit.addTagHTML(row, 'post-date');
    const time = Date.now();
    date.textContent = TimelineEdit.getNewFormatDate(time);
    const cords = TimelineEdit.addTagHTML(conteiner, 'post-cords');
    cords.textContent = `[${stringDate}]`;
  }

  drawVideo(stringDate, url) {
    // Добавляет видео в ленту
    const conteiner = document.createElement('div');
    conteiner.classList.add('content-post');
    this.fieldPosts.prepend(conteiner);

    const row = TimelineEdit.addTagHTML(conteiner, 'content-row');
    const video = TimelineEdit.addTagHTML(row, 'post-video', 'video');
    video.setAttribute('controls', '');
    video.src = url; // добавляем видеопоток
    this.input.value = '';
    const date = TimelineEdit.addTagHTML(row, 'post-date');
    const time = Date.now();
    date.textContent = TimelineEdit.getNewFormatDate(time);
    const cords = TimelineEdit.addTagHTML(conteiner, 'post-cords');
    cords.textContent = `[${stringDate}]`;
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

  onPopupClick(event, type) {
    // Вызывает callback при нажатии ОК поля popup
    // event.preventDefault(); // необходимо отключить, чтобы использовать подсказки браузера
    this.popupListeners.forEach((o) => o.call(null, event, type));
  }

  addPopupListeners(callback) {
    this.popupListeners.push(callback);
  }

  onPressInput(event) {
    // Вызывает callback при нажатии ввода поля input
    event.preventDefault();
    this.inputListeners.forEach((o) => o.call(null, event));
  }

  addInputListeners(callback) {
    this.inputListeners.push(callback);
  }

  onPressMicro(event) {
    // Вызывает callback при нажатии иконки микрофона
    this.microListeners.forEach((o) => o.call(null, event));
  }

  addMicroListeners(callback) {
    this.microListeners.push(callback);
  }

  onPressVideo(event) {
    // Вызывает callback при нажатии иконки видео
    this.videoListeners.forEach((o) => o.call(null, event));
  }

  addVideoListeners(callback) {
    this.videoListeners.push(callback);
  }

  onPressCross() {
    // Вызывает callback при нажатии иконки крестик
    this.crossListeners.forEach((o) => o.call(null));
  }

  addCrossListeners(callback) {
    this.crossListeners.push(callback);
  }

  onPressAccept() {
    // Вызывает callback при нажатии иконки принять запись
    this.acceptListeners.forEach((o) => o.call(null));
  }

  addAcceptListeners(callback) {
    this.acceptListeners.push(callback);
  }
}