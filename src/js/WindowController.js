import Tooltip from './Tooltip';

const errors = {
  user: {
    valueMissing: 'Укажите свой псевдоним!',
    // patternMismatch: 'Имя только на латинице!', // для вариантов развития
    doubleName: 'Такое имя уже используется!',
  },
};

export default class WindowController {
  constructor(editor, url) {
    this.editor = editor;
    // this.urlServer = `http://localhost:${port}`;
    this.urlServer = url;
    this.toolTip = new Tooltip();
    this.actualMessages = [];
    this.id = null;
    // Для открытия соединения достаточно создать объект WebSocket
    // протокол для ws/wss в скобках
    this.ws = new WebSocket('wss://javascript-21-websockets-backend.onrender.com');
    this.createChat = false;
  }

  async onSubmitForm(event) {
    // Callback - событие submit ввода имя пользователя
    console.log('****1 event', event); // event это объект формы
    const { elements } = event.target; // список элементов содержащихся в форме
    console.log('****2 состав elements', elements);
    [...elements].some((elem) => {
      console.log('****2.. состав elem', elem); // поиск среди элементов
      const error = WindowController.getError(elem); // поиск ошибки (текст описания ошибки например - укажите свой псевдоним)
      console.log('****2..1 значение error', error);
      if (error) {
        // если ошибка есть вернет true
        console.log('****2..2 есть ошибка', error);
        this.showTooltip(error, elem); // показывает popup об ошибке ввода имени
        elem.focus();
        return true;
      }
      // если ошибки нет вернет false
      return false;
    });

    if (!event.target.checkValidity()) {
      // если форма не валидна - то прервать обработку
      return;
    }

    const url = `${this.urlServer}/addUser/`;
    const data = new FormData(event.target);
    data.append('id', this.id);
    const response = await fetch(url, {
      method: 'POST',
      body: data,
    });

    const obj = await response.json();
    if (response.status === 201) {
      this.editor.popup.remove();
      this.editor.popup = null;
      this.createChat = this.editor.drawChat();
      for (const item of obj.array) {
        if (item.name) {
          this.editor.drawUser(item.id, item.name);
        }
        if (item.id === this.id) {
          this.editor.constructor.colorName(item.id);
          this.ws.send(JSON.stringify({ id: item.id, name: item.name }));
        }
      }
      for (const item of obj.meassages) {
        this.editor.drawMessage(item);
      }
      this.editor.chat.scrollTop = this.editor.chat.scrollHeight;
    }
    if (obj.status === 'имя занято') {
      const elem = [...elements].find((el) => el.name === 'user');
      this.showTooltip(errors.user.doubleName, elem);
    }
  }

  showTooltip(message, el) {
    // Сохраняет имя элемента с ошибкой и его номер
    this.actualMessages.push({
      name: el.name,
      id: this.toolTip.showTooltip(message, el),
    });
  }

  static getError(el) {
    // Возвращает текст сообщения об ошибке
    console.log('1 ---- Метод getError - el', el.validity); // передали элемент формы, которая имеет свои поля валидности
    console.log('2 ---- Object.keys(ValidityState.prototype)', Object.keys(ValidityState.prototype)); // список ключей для валидации формы 'valueMissing', 'typeMismatch', 'patternMismatch', 'tooLong', 'tooShort', 'rangeUnderflow', 'rangeOverflow', 'stepMismatch', 'badInput', 'customError', 'valid'
    const errorKey = Object.keys(ValidityState.prototype).find((key) => { // если не найдет true вернет undefined
      console.log('2.. +++++ key', key); // перебор всех ключей 
      if (!el.name) return false; // если элемент не имеет поля name тогда прервать обработку
      if (key === 'valid') return false; // если дошли до этого ключа то прервать
      return el.validity[key]; // возвращает значения поля валидности для данного ключа текущего элемента
    });
    console.log('3 ---- errorKey', errorKey); // если вернет имя ключа - valueMissing
    if (!errorKey) return false; // если все ключи валидны вернуть ложь
    return errors[el.name][errorKey]; // если errorKey имеет имя ключа то будет возвращено значение по этому ключу
    // вернуть ошибку из списка для поля формы под именем el.name под ключом например valueMissing
  }

  onInputValue() {
    // Удаление сообщения об ошибке в поле input
    this.actualMessages.forEach((item) => {
      this.toolTip.removeTooltip(item.id);
    });
    this.actualMessages = [];
  }
}
