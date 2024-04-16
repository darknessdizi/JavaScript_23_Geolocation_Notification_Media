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

  getStringCords(number) {
    // Получение строки с координатами
    const listLatitude = String(this.edit.cords.latitude).split('.');
    let latitude = null;
    if (listLatitude.length > 1) {
      if (listLatitude[1].length < number) {
        latitude = this.edit.cords.latitude.toFixed(listLatitude[1].length);
      } else {
        latitude = this.edit.cords.latitude.toFixed(number);
      }
    } else {
      latitude = this.edit.cords.latitude;
    }

    const listLongitude = String(this.edit.cords.longitude).split('.');
    let longitude = null;
    if (listLongitude.length > 1) {
      if (listLongitude[1].length < number) {
        longitude = this.edit.cords.longitude.toFixed(listLongitude[1].length);
      } else {
        longitude = this.edit.cords.longitude.toFixed(number);
      }
    } else {
      longitude = this.edit.cords.longitude;
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
      input.setCustomValidity('Укажите широту и долготу согласно образца');
      return;
    }
    const cords = this.getCords(input);
    if (!cords) {
      return;
    }
    event.preventDefault();
    this.edit.cords = {
      latitude: cords.latitude, // указать новые координаты
      longitude: cords.longitude,
    }
    this.edit.popup.remove();
    const date = this.getStringCords(5);
    if (type === 'message') {
      this.edit.drawMessage(date);
    }
    if (type === 'micro') {
      this.edit.drawAudio(date);
    }
    if (type === 'video') {
      this.edit.drawVideo(date);
    }
  }

  onPressInput(event) {
    // Callback - нажатие кнопки enter в поле ввода сообщения
    // const nav = navigator.geolocation;
    // if (nav) {
    //   console.log('Получаем коры');
    //   nav.getCurrentPosition((data) => {
    //     this.edit.cords = {
    //       latitude: data.coords.latitude,
    //       longitude: data.coords.longitude
    //     }
    //   });
    // }

    if (!this.edit.cords) {
      this.edit.drawPopup();
      return;
    }
    const date = this.getStringCords(5);
    this.edit.drawMessage(date);
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
    console.log('нажали видео', event.target);
    if (!this.edit.cords) { // проверяем наличие координат
      this.edit.drawPopup('video');
      return;
    } 

    // const date = this.getStringCords(5); // получение координат
    // this.edit.drawVideo(date);
    this.stream = await navigator.mediaDevices.getUserMedia({ // получаем видеопоток
      video: true, // получение разрешения на пользование видеокамерой
    });

    const { target } = event;
    const parent = target.closest('.content-field-input');
    this.edit.drawFieldVideo(parent);
    this.edit.fieldVideo.srcObject = this.stream;
    this.edit.btnVideo.classList.toggle('hidden');
    this.edit.btnMicro.classList.toggle('hidden');
    this.edit.btnAccept.classList.toggle('hidden');
    this.edit.btnCancel.classList.toggle('hidden');
    this.edit.time.classList.toggle('hidden');

    this.edit.fieldVideo.addEventListener('canplay', () => {
      console.log('Нашлось видео');
      this.edit.fieldVideo.play();
      this.timerId = setTimeout(this.secundomer.bind(this), 1000);
    });
  }

  secundomer() {
    // метод вызываемый таймером
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

      this.timerId = setTimeout(this.secundomer.bind(this), 1000);
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
    this.stream.getTracks().forEach(function(track) {
      track.stop(); // отключаем все дорожки видео потока
    });
    this.edit.fieldVideo.remove();
    clearTimeout(this.timerId);
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

  onPressAccept() {
    // Callback - нажатие кнопки принять (сохранение аудио/видео записи)
    console.log('сохранение аудио/видео записи');
  }
}