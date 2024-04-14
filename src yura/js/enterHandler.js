export default function enterHandler(event, chatInput, chatMessagesMaker, geolocation, modal) {
  if (event.key === 'Enter') {
    const { value } = chatInput;
    if (!value || !value.trim()) {
      chatInput.setAttribute('value', '');
      return;
    }

    geolocation.setLocation();

    chatInput.setAttribute('disabled', '');

    chatInput.setAttribute('disabled', '');

    const promise = new Promise((resolve) => {
      setTimeout(() => {
        if (chatInput.dataset.geoResponse) {
          resolve();
        }
      }, 100);
    });

    promise.then(() => {
      const geoResponse = JSON.parse(chatInput.dataset.geoResponse);

      chatInput.removeAttribute('disabled');

      if (geoResponse.success) {
        chatMessagesMaker.addMessage(geoResponse);
      } else {
        modal.setContent(geoResponse);
        modal.toggle();
      }
    });
  }
}
