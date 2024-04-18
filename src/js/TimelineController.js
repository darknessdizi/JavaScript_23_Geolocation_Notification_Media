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
    this.blob = null;
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

  getStringCords(cords, number) {
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

  getCords(input) {
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
    const cords = this.getCords(input); // проверка шаблона ввода координат
    if (!cords) {
      return;
    }
    event.preventDefault();
    this.edit.popup.remove();
    const data = this.getStringCords(cords, 5);
    if (type === 'message') {
      this.edit.drawMessage(data);
    }
    if (type === 'micro') {
      this.edit.drawAudio(data);
    }
    if (type === 'video') {
      this.edit.drawVideo(data);
    }
  }

  async onPressInput(event) {
    // Callback - нажатие кнопки enter в поле ввода сообщения
    const cords = await this.getCoords(); // получение координат
    if (!cords) {
      this.edit.drawPopup(); // если координат нет, то отрисовать окно
      return;
    }
    const data = this.getStringCords(cords, 5);
    this.edit.drawMessage(data);
  }

  onPressMicro(event) {
    // Callback - нажатие кнопки микрофон
    console.log('нажали микрофон');
    if (!this.edit.cords) {
      this.edit.drawPopup('micro');
      return;
    }
    const date = this.getStringCords(5);
    this.edit.drawAudio(date);
    const audio = navigator.mediaDevices.getUserMedia({
      audio: true, // получение разрешения на пользование микрофоном
    });
  }

  async onPressVideo(event) {
    // Callback - нажатие кнопки видео
    // if (!this.edit.cords) { // проверяем наличие координат
    //   this.edit.drawPopup('video');
    //   return;
    // } 

    // const date = this.getStringCords(5); // получение координат
    // this.edit.drawVideo(date);
    this.stream = await navigator.mediaDevices.getUserMedia({ // получаем видеопоток
      video: true, // получение разрешения на пользование видеокамерой
      audio: true,
    });

    const { target } = event;
    const parent = target.closest('.content-field-input');
    this.edit.drawFieldVideo(parent);
    this.edit.fieldVideo.srcObject = this.stream; // Отображаем видеопоток в теге video 
                                                  // (blob объекты не подходят для этого)
    this.edit.fieldVideo.play();
    this.edit.btnVideo.classList.toggle('hidden');
    this.edit.btnMicro.classList.toggle('hidden');
    this.edit.btnAccept.classList.toggle('hidden');
    this.edit.btnCancel.classList.toggle('hidden');
    this.edit.time.classList.toggle('hidden');

    this.recorder = new MediaRecorder(this.stream); // для записи видеопотока

    this.recorder.addEventListener('start', () => {
      console.log('начало записи');
    }); // начало записи

    this.recorder.addEventListener('dataavailable', (event) => {
      console.log('получение данных');
      this.chunks.push(event.data); // для сохранения кусков данных по видео в наш массив
      console.log('this.chunks:', this.chunks);
    }); // получение данных

    this.recorder.addEventListener('stop', () => {
      console.log('конец записи');
      if (this.save) {
        const nav = navigator.geolocation;
        if (nav) {
          console.log('Получаем коры');
          nav.getCurrentPosition(async (data) => {
            console.log('Получаем data', data);
            this.edit.cords = {
              latitude: data.coords.latitude,
              longitude: data.coords.longitude
            }
          });
        }

        this.blob = new Blob(this.chunks); // получение двоичных данных по видео
        const url = URL.createObjectURL(this.blob);
        this.edit.drawVideo('12, 34', url); // отрисовка видео в ленту
        this.save = false;
      }
    }); // конец записи

    this.edit.fieldVideo.addEventListener('canplay', () => {
      console.log('Нашлось видео');
      // this.edit.fieldVideo.play(); // запускаем воспроизведение видео в теге video
      this.recorder.start(); // запуск записи видеопотока
      this.timerId = setTimeout(this.secundomer.bind(this), 1000);
    });
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
    this.blob = null;
    this.chunks = [];
    this.edit.fieldVideo.remove(); // удаляем поле с видео
    clearTimeout(this.timerId); // отключаем таймер
    this.edit.btnVideo.classList.toggle('hidden');
    this.edit.btnMicro.classList.toggle('hidden');
    this.edit.btnAccept.classList.toggle('hidden');
    this.edit.btnCancel.classList.toggle('hidden');
    this.edit.time.classList.toggle('hidden');
    this.edit.time.children[0].textContent = '00.00';
    this.edit.input.value = '';
    this.time = {
      hours: 0,
      minutes: 0,
      seconds: 0,
    }
  }
}