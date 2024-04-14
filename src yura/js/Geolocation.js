export default class Geolocation {
  constructor(chatInput) {
    this.chatInput = chatInput;
  }

  setLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => this.handleSuccess(position),
        (error) => this.handleFailure(error),
      );
    } else {
      this.chatInput.dataset.geoResponse = JSON.stringify({
        header: 'Ваш браузер не поддерживает геолокацию',
        message: 'Смените браузер, либо введите местоположение в ручную.',
      });
    }
  }

  handleSuccess(position) {
    this.chatInput.dataset.geoResponse = JSON.stringify({
      success: true,
      lat: position.coords.latitude,
      lon: position.coords.longitude,
    });
  }

  handleFailure(error) {
    const response = {
      header: '',
      message: '',
    };

    switch (error.code) {
      case error.PERMISSION_DENIED:
        response.header = 'Настройками текущего браузера запрещен запрос геолокации';
        response.message = 'Измените настройки конфиденциальности, либо введите местоположение в ручную.';
        break;
      case error.POSITION_UNAVAILABLE:
        response.header = 'Информация о вашем местоположении недоступна';
        response.message = 'Введите местоположение в ручную.';
        break;
      case error.TIMEOUT:
        response.header = 'Истекло время ожидания запроса вашего местоположения';
        response.message = 'Нажмите "Отмена" и попробуйте ещё раз, либо введите местоположение в ручную.';
        break;
      default:
        response.header = 'Произошла неизвестная ошибка';
        response.message = 'Нажмите "Отмена" и попробуйте ещё раз, либо введите местоположение в ручную.';
        break;
    }

    this.chatInput.dataset.geoResponse = JSON.stringify(response);
  }
}
