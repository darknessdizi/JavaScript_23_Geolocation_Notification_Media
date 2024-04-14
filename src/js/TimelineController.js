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

  onPopupClick(event) {
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
    this.edit.drawMessage(date);
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
    const date = this.getStringCords(5);
    this.edit.drawAudio(date);
    const audio = navigator.mediaDevices.getUserMedia({
      audio: true, // получение разрешения на пользование микрофоном
    });
  }

  onPressVideo(event) {
    // Callback - нажатие кнопки видео
    console.log('нажали видео');
    const date = this.getStringCords(5);
    this.edit.drawVideo(date);
    const video = navigator.mediaDevices.getUserMedia({
      video: true, // получение разрешения на пользование видеокамерой
    });
  }
}