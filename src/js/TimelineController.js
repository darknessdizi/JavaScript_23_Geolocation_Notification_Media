export default class TimelineController {
  constructor(editor) {
    this.edit = editor;
    this.time = {
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
    this.stream = null;
    this.timerId = null;
    this.recorder = null;
    this.chunks = []; // для сохранения данных (чанков) по видео
    this.url = null;
    this.save = false;
  }

  init() {
    this.edit.bindToDOM();

    this.edit.addInputListeners(this.onPressInput.bind(this));
    this.edit.addMicroListeners(this.onPressMicro.bind(this));
    this.edit.addVideoListeners(this.onPressVideo.bind(this));
    this.edit.addPopupListeners(this.onPopupClick.bind(this));
    this.edit.addCrossListeners(this.onPressCross.bind(this));
    this.edit.addAcceptListeners(this.onPressAccept.bind(this));
  }

  static getCoords() {
    // Запрос на получение координат
    return new Promise((resolve) => {
      if (navigator.geolocation) { // проверка на поддержку геолокации браузером
        navigator.geolocation.getCurrentPosition(
          (data) => { // callback - на успешное получение координат
            console.log('data', data);
            resolve({ // вернет объект с координатами
              latitude: data.coords.latitude,
              longitude: data.coords.longitude,
            });
          },
          (error) => { // callback - ошибка при получении координат
            console.log('ошибка', error);
            resolve(false);
          },
          {
            timeout: 3000, // ограничили время ответа на запрос координат
          },
        );
      } else {
        resolve(false);
      }
    });
  }

  static getStringCoords(cords, number) {
    // Получение строки с координатами
    const listLatitude = String(cords.latitude).split('.');
    let latitude = null;
    if (listLatitude.length > 1) {
      if (listLatitude[1].length < number) {
        latitude = cords.latitude.toFixed(listLatitude[1].length);
      } else {
        latitude = cords.latitude.toFixed(number);
      }
    } else {
      latitude = cords.latitude;
    }

    const listLongitude = String(cords.longitude).split('.');
    let longitude = null;
    if (listLongitude.length > 1) {
      if (listLongitude[1].length < number) {
        longitude = cords.longitude.toFixed(listLongitude[1].length);
      } else {
        longitude = cords.longitude.toFixed(number);
      }
    } else {
      longitude = cords.longitude;
    }
    return `${latitude}, ${longitude}`;
  }

  static checkCoords(input) {
    // Проверка ввода данных координат пользователем
    const regexp2 = /^[-+]?\d{1,2}(?:\.\d+)?,\s*[-+]?\d{1,3}(?:\.\d+)?$/;
    const regexp = /^\[[-+]?\d{1,2}(?:\.\d+)?,\s*[-+]?\d{1,3}(?:\.\d+)?\]$/;
    const { value } = input;
    if (regexp.test(value)) {
      const [latitude, longitude] = value.split(',');
      const cords = {
        latitude: Number(latitude.replace('[', '').trim()),
        longitude: Number(longitude.replace(']', '').trim()),
      };
      return cords;
    }
    if (regexp2.test(value)) {
      const [latitude, longitude] = value.split(',');
      const cords = {
        latitude: Number(latitude.trim()),
        longitude: Number(longitude.trim()),
      };
      return cords;
    }
    // Делаем поле input не валидным
    input.setCustomValidity('Не верно указаны координаты');
    return false;
  }

  onPopupClick(event, type) {
    // Callback - нажатие кнопки ОК в поле popup
    const parent = event.target.closest('.popup');
    const input = parent.querySelector('.popup-input');
    if (input.validity.valueMissing) {
      // полю input назначаем не валидное состояние
      input.setCustomValidity('Укажите широту и долготу согласно образца');
      return;
    }
    const cords = TimelineController.checkCoords(input); // проверка шаблона ввода координат
    if (!cords) {
      return;
    }
    event.preventDefault();
    this.edit.popup.remove();
    const data = TimelineController.getStringCoords(cords, 5);
    if (type === 'message') {
      this.edit.drawMessage(data);
    }
    if (type === 'audio') {
      this.edit.drawMedia(data, this.url, 'audio');
    }
    if (type === 'video') {
      this.edit.drawMedia(data, this.url, 'video');
    }
  }

  async onPressInput() {
    // Callback - нажатие кнопки enter в поле ввода сообщения
    const cords = await TimelineController.getCoords(); // получение координат
    if (!cords) {
      this.edit.drawPopup(); // если координат нет, то отрисовать окно
      return;
    }
    const data = TimelineController.getStringCoords(cords, 5);
    this.edit.drawMessage(data);
  }

  async mediaProcessing(event, type, options) {
    // Обработка запроса на запись аудио или видео
    const { target } = event;
    const parent = target.closest('.content-field-input');
    try {
      this.stream = await navigator.mediaDevices.getUserMedia(options);
    } catch (error) {
      let message = null;
      if (type === 'audio') {
        message = 'У Вас нет разрешения на использование микрофона. Подключите микрофон и попробуйте заново.';
      } else {
        message = 'У Вас нет разрешения на использование вебкамеры или микрофона. Подключите устройства и попробуйте заново.';
      }
      this.edit.drawPopupError(message);
      return;
    }
    this.edit.drawFieldMedia(parent, type);
    this.edit.media.srcObject = this.stream; // Отображаем медиапоток в теге
    this.edit.media.play();
    this.changingButtons(); // скрываем ненужные кнопки
    this.recorder = new MediaRecorder(this.stream); // нужен для записи медиапотока
    this.recorder.start();

    this.recorder.addEventListener('start', () => { // начало записи
      this.timerId = setInterval(this.secundomer.bind(this), 1000);
    });

    this.recorder.addEventListener('dataavailable', (e) => { // получение данных
      this.chunks.push(e.data); // для сохранения кусков данных по медиа в наш массив
    });

    this.recorder.addEventListener('stop', async () => { // конец записи
      if (this.save) {
        const blob = new Blob(this.chunks); // получение двоичных данных по медиапотоку
        this.url = URL.createObjectURL(blob);

        const cords = await TimelineController.getCoords(); // получение координат
        if (!cords) {
          this.edit.drawPopup(type); // если координат нет, то отрисовать окно
          return;
        }
        const data = TimelineController.getStringCoords(cords, 5);

        this.edit.drawMedia(data, this.url, type); // отрисовка медиа в ленту
        this.save = false;
      }
    });

    // Событие когда тег видео получил доступ к данным
    this.edit.media.addEventListener('canplay', () => {
      // console.log('Нашлось видео');
      // this.edit.fieldVideo.play(); // запускаем воспроизведение видео в теге video
      // this.recorder.start(); // запуск записи видеопотока
      // this.timerId = setTimeout(this.secundomer.bind(this), 1000);
    });
  }

  onPressMicro(event) {
    // Callback - нажатие кнопки микрофон
    const type = 'audio';
    const options = {
      audio: true, // получение разрешения на пользование микрофоном
    };

    this.mediaProcessing(event, type, options);
  }

  onPressVideo(event) {
    // Callback - нажатие кнопки видео
    const type = 'video';
    const options = {
      video: true, // получение разрешения на пользование видео
      audio: true, // получение разрешения на пользование микрофоном
    };

    this.mediaProcessing(event, type, options);
  }

  secundomer() {
    // метод вызываемый с помощью setInterval
    this.time.seconds += 1;
    if (this.time.seconds === 60) {
      this.time.minutes += 1;
      this.time.seconds = 0;
      if (this.time.minutes === 60) {
        this.time.hours += 1;
        this.time.minutes = 0;
      }
    }

    const seconds = TimelineController.getStringTime(this.time.seconds);
    const minutes = TimelineController.getStringTime(this.time.minutes);
    const hours = TimelineController.getStringTime(this.time.hours);

    if (this.time.hours === 0) {
      this.edit.time.children[0].textContent = `${minutes}.${seconds}`;
    } else {
      this.edit.time.children[0].textContent = `${hours}.${minutes}.${seconds}`;
    }

    // this.timerId = setTimeout(this.secundomer.bind(this), 1000); // зацикливание таймера
  }

  static getStringTime(number) {
    // Делает число двухзначным и преобразует в строку
    let seconds = String(number);
    if (seconds.length < 2) {
      seconds = `0${number}`;
    }
    return seconds;
  }

  onPressCross() {
    // Callback - нажатие кнопки крестик (отмена записи)
    this.recorder.stop(); // остановка записи видеопотока
    this.clearData();
  }

  onPressAccept() {
    // Callback - нажатие кнопки принять (сохранение аудио/видео записи)
    this.save = true;
    this.onPressCross();
  }

  clearData() {
    // Очищает данные после добавления записи
    this.stream.getTracks().forEach((track) => {
      track.stop(); // отключаем все дорожки видео потока
    });
    this.url = null;
    this.chunks = [];
    this.edit.media.remove(); // удаляем поле с media
    clearTimeout(this.timerId); // отключаем таймер
    this.changingButtons(); // замена кнопок
    this.edit.time.children[0].textContent = '00.00';
    this.edit.input.value = '';
    this.time = {
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
  }

  changingButtons() {
    // Смена состояния кнопок
    this.edit.btnVideo.classList.toggle('hidden');
    this.edit.btnMicro.classList.toggle('hidden');
    this.edit.btnAccept.classList.toggle('hidden');
    this.edit.btnCancel.classList.toggle('hidden');
    this.edit.time.classList.toggle('hidden');
  }
}
