import ChatMessagesMaker from './ChatMessagesMaker';
import Modal from './Modal';
import Geolocation from './Geolocation';
import enterHandler from './enterHandler';

const chat = document.querySelector('.chat-widget');
const messagesContainer = chat.querySelector('.chat-widget__messages-container');
const messages = chat.querySelector('.chat-widget__messages');
const chatInput = chat.querySelector('.chat-widget__input');

const chatMessagesMaker = new ChatMessagesMaker(
  chatInput,
  messages,
  messagesContainer,
);

const modalWindow = document.querySelector('.modal');
const modalHeader = modalWindow.querySelector('.modal__header');
const modalMessage = modalWindow.querySelector('.modal__message');
const modalForm = modalWindow.querySelector('.modal__form');
const modalFormInput = modalWindow.querySelector('.modal-form__input');
const modalCancelButton = modalWindow.querySelector('.modal-form__button-cancel');

const modal = new Modal(
  modalWindow,
  modalHeader,
  modalMessage,
  modalForm,
  modalFormInput,
  modalCancelButton,
  chatInput,
  chatMessagesMaker,
);

modal.assignInputCheckerHandler();
modal.assignSubmitHandler();
modal.assignCancelHandler();

const geolocation = new Geolocation(chatInput);

chatInput.addEventListener('keyup', (event) => enterHandler(
  event,
  chatInput,
  chatMessagesMaker,
  geolocation,
  modal,
));

chatInput.value = 'Хорошего дня! &#128512;';

chatMessagesMaker.addMessage({ lat: 51.50851, lon: -0.12572 });

chatInput.focus();
