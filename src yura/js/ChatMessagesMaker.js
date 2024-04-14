export default class ChatMessagesMaker {
  constructor(
    chatInput,
    messages,
    messagesContainer,
  ) {
    this.chatInput = chatInput;
    this.messages = messages;
    this.messagesContainer = messagesContainer;
  }

  static getTime() {
    const date = new Date();

    const options = { dateStyle: 'short', timeStyle: 'short' };

    const formattedDate = new Intl.DateTimeFormat('ru-RU', options).format(date).replace(/\d{2}(\d{2}),/, '$1');

    return formattedDate;
  }

  addMessage(coords) {
    const time = this.constructor.getTime();

    this.messages.insertAdjacentHTML('beforeend', `
      <div class="message">
        <div class="message__header">${time}</div>
        <div class="message__text">${this.chatInput.value}</div>
        <div class="message__coordinates">[${coords.lat}, ${coords.lon}] <a href="http://www.google.com/maps/place/${coords.lat},${coords.lon}" target="_blank">&#128065;</a></div>
      </div>
    `);

    this.messagesContainer.scrollTo(0, this.messagesContainer.scrollHeight);

    this.chatInput.value = '';

    this.chatInput.dataset.geoResponse = '';

    this.chatInput.focus();
  }
}
