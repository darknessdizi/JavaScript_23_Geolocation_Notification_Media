export default class TimelineController {
  constructor(editor) {
    this.edit = editor;
    this.time = {
      hours: 0,
      minutes: 0,
      seconds: 0,
    }
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

  getCoords() {
    // Запрос на получение координат
    return new Promise((resolve) => {
      if (navigator.geolocation) { // проверка на поддержку геолокации браузером
        navigator.geolocation.getCurrentPosition(
          (data) => { // callback - на успешное получение координат
            console.log('data', data);
            resolve({ // вернет объект с координатами
              latitude: data.coords.latitude,
              longitude: data.coords.longitude
            });
          },
          (error) => { // callback - ошибка при получении координат
            console.log('ошибка', error);
            resolve(false);
          }
        )
      } else {
        resolve(false);
      }
    });
  }

  getStringCoords(cords, number) {
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

  checkCoords(input) {
    // Проверка ввода данных координат пользователем
    const regexp2 = /^[-+]?\d{1,2}(?:\.\d+)?,\s*[-+]?\d{1,3}(?:\.\d+)?$/;
    const regexp = /^\[[-+]?\d{1,2}(?:\.\d+)?,\s*[-+]?\d{1,3}(?:\.\d+)?\]$/;
    const { value } = input;
    if (regexp.test(value)) {
      console.log('проверка успешна', regexp.test(value));
      const [latitude, longitude] = value.split(',');
      const cords = {
        latitude: Number(latitude.replace('[', '').trim()),
        longitude: Number(longitude.replace(']', '').trim()),
      };
      return cords;
    } else {
      if (regexp2.test(value)) {
        console.log('проверка успешна', regexp2.test(value));
        const [latitude, longitude] = value.split(',');
        const cords = {
          latitude: Number(latitude.trim()),
          longitude: Number(longitude.trim()),
        };
        return cords;
      }
    }
    console.log('Проверка не пройдена');
    // Делаем поле input не валидным
    input.setCustomValidity('Не верно указаны координаты');
    return false;
  }

  onPopupClick(event, type) {
    // Callback - нажатие кнопки ОК в поле popup
    const parent = event.target.closest('.popup');
    const input = parent.querySelector('.popup-input');
    if (input.validity['valueMissing']) {
      // полю input назначаем не валидное состояние
      input.setCustomValidity('Укажите широту и долготу согласно образца');
      return;
    }
    const cords = this.checkCoords(input); // проверка шаблона ввода координат
    if (!cords) {
      return;
    }
    event.preventDefault();
    this.edit.popup.remove();
    const data = this.getStringCoords(cords, 5);
    if (type === 'message') {
      this.edit.drawMessage(data);
    }
    if (type === 'micro') {
      this.edit.drawAudio(data, this.url);
      this.save = false;
    }
    if (type === 'video') {
      this.edit.drawVideo(data, this.url);
      this.save = false;
    }
  }

  async onPressInput() {
    // Callback - нажатие кнопки enter в поле ввода сообщения
    const cords = await this.getCoords(); // получение координат
    if (!cords) {
      this.edit.drawPopup(); // если координат нет, то отрисовать окно
      return;
    }
    const data = this.getStringCoords(cords, 5);
    this.edit.drawMessage(data);
  }

  async onPressMicro(event) {
    // Callback - нажатие кнопки микрофон
    console.log('нажали микрофон');
    const { target } = event;
    const parent = target.closest('.content-field-input');

    this.stream = await navigator.mediaDevices.getUserMedia({ // получаем аудио
      audio: true // получение разрешения на пользование микрофоном
    });

    this.edit.drawFieldAudio(parent);
    this.edit.fieldAudio.srcObject = this.stream; // Отображаем видеопоток в теге audio
    this.edit.fieldAudio.play();

    this.changingButtons(); // скрываем ненужные кнопки

    this.recorder = new MediaRecorder(this.stream); // нужен для записи видеопотока
    this.recorder.start();

    this.recorder.addEventListener('start', () => { // начало записи
      console.log('начало записи');
      this.timerId = setTimeout(this.secundomer.bind(this), 1000);
    });

    this.recorder.addEventListener('dataavailable', (event) => { // получение данных
      console.log('получение данных');
      this.chunks.push(event.data); // для сохранения кусков данных по аудио в наш массив
      console.log('this.chunks:', this.chunks);
    });

    this.recorder.addEventListener('stop', async () => { // конец записи
      console.log('конец записи');
      if (this.save) {
        const blob = new Blob(this.chunks); // получение двоичных данных по аудио
        this.url = URL.createObjectURL(blob);

        const cords = await this.getCoords(); // получение координат
        if (!cords) {
          this.edit.drawPopup('micro'); // если координат нет, то отрисовать окно
          return;
        }
        const data = this.getStringCoords(cords, 5);

        this.edit.drawAudio(data, this.url); // отрисовка аудио в ленту
        this.save = false;
      }
    });
  }

  async onPressVideo(event) {
    // Callback - нажатие кнопки видео
    const { target } = event;
    const parent = target.closest('.content-field-input');

    this.stream = await navigator.mediaDevices.getUserMedia({ // получаем видеопоток
      video: true, // получение разрешения на пользование видеокамерой
      audio: true,
    });

    this.edit.drawFieldVideo(parent);
    this.edit.fieldVideo.srcObject = this.stream; // Отображаем видеопоток в теге video
    this.edit.fieldVideo.play();

    this.changingButtons(); // скрываем ненужные кнопки

    this.recorder = new MediaRecorder(this.stream); // нужен для записи видеопотока
    this.recorder.start();

    this.recorder.addEventListener('start', () => { // начало записи
      console.log('начало записи');
      this.timerId = setTimeout(this.secundomer.bind(this), 1000);
    });

    this.recorder.addEventListener('dataavailable', (event) => { // получение данных
      console.log('получение данных');
      this.chunks.push(event.data); // для сохранения кусков данных по видео в наш массив
      console.log('this.chunks:', this.chunks);
    });

    this.recorder.addEventListener('stop', async () => { // конец записи
      console.log('конец записи');
      if (this.save) {
        const blob = new Blob(this.chunks); // получение двоичных данных по видео
        this.url = URL.createObjectURL(blob);

        const cords = await this.getCoords(); // получение координат
        if (!cords) {
          this.edit.drawPopup('video'); // если координат нет, то отрисовать окно
          return;
        }
        const data = this.getStringCoords(cords, 5);

        this.edit.drawVideo(data, this.url); // отрисовка видео в ленту
        this.save = false;
      }
    });

    // this.edit.fieldVideo.addEventListener('canplay', () => { // Событие когда тег видео получил доступ к данным
      // console.log('Нашлось видео');
      // this.edit.fieldVideo.play(); // запускаем воспроизведение видео в теге video
      // this.recorder.start(); // запуск записи видеопотока
      // this.timerId = setTimeout(this.secundomer.bind(this), 1000);
    // });
  }

  secundomer() {
    // метод вызываемый с помощью setTimeout
      this.time.seconds += 1;
      if (this.time.seconds === 60) {
        this.time.minutes += 1;
        this.time.seconds = 0;
        if (this.time.minutes === 60) {
          this.time.hours += 1;
          this.time.minutes = 0;
        }
      }

      const seconds = this.getStringTime(this.time.seconds);
      const minutes = this.getStringTime(this.time.minutes);
      const hours = this.getStringTime(this.time.hours);

      if (this.time.hours === 0) {
        this.edit.time.children[0].textContent = `${minutes}.${seconds}`;
      } else {
        this.edit.time.children[0].textContent = `${hours}.${minutes}.${seconds}`;
      }

      this.timerId = setTimeout(this.secundomer.bind(this), 1000); // зацикливание таймера
  }

  getStringTime(number) {
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
    console.log('сохранение аудио/видео записи');
    this.save = true;
    this.recorder.stop(); // остановка записи видеопотока
    this.clearData();
  }

  clearData() {
    //Очищает данные после добавления записи
    this.stream.getTracks().forEach(function(track) {
      track.stop(); // отключаем все дорожки видео потока
    });
    this.url = null;
    this.chunks = [];
    if (this.edit.fieldVideo) {
      this.edit.fieldVideo.remove(); // удаляем поле с видео
    }
    if (this.edit.fieldAudio) {
      this.edit.fieldAudio.remove();
    }
    clearTimeout(this.timerId); // отключаем таймер
    this.changingButtons(); // замена кнопок
    this.edit.time.children[0].textContent = '00.00';
    this.edit.input.value = '';
    this.time = {
      hours: 0,
      minutes: 0,
      seconds: 0,
    }
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