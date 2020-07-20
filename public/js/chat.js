const socket = io();

const $messageForm = document.querySelector("#message-form");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");
const $messages = document.querySelector("#messages");
const $locations = document.querySelector("#location-link");

//templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-template").innerHTML;

//Options
const {username, room} = Qs.parse(location.search, { ignoreQueryPrefix: true})

function htmlToElement(html) {
  var template = document.createElement("template");
  html = html.trim(); // Never return a text node of whitespace as the result
  template.innerHTML = html;
  return template.content.firstChild;
}

socket.on("message", (message) => {
  console.log(message);
  const html = Mustache.render(messageTemplate, {
    message: message.text,
    createdAt: moment(message.createdAt).format('HH:mm')
  });
  const htmlElement = htmlToElement(html);
  $messages.insertAdjacentElement("beforeend", htmlElement);
});

socket.on("locationMessage", (url) => {
  console.log(url);
  const html = Mustache.render(locationTemplate, {
    url,
  });
  const htmlElement = htmlToElement(html);
  $locations.insertAdjacentElement("beforeend", htmlElement);
});

const messageForm = document.querySelector("form");

messageForm.addEventListener("submit", (e) => {
  e.preventDefault();

  //disable
  $messageFormButton.setAttribute("disabled", "disabled");

  const message = e.target[0].value;

  socket.emit("sendMessage", message, (error) => {
    //enable
    $messageFormButton.removeAttribute("disabled");
    $messageFormInput.value = "";
    $messageFormInput.focus();

    if (error) {
      return console.log(error);
    }

    console.log("Message delivered");
  });
});

const $locationButton = document.querySelector("#send-location");

$locationButton.addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("geolocation is not supported");
  }
  $locationButton.setAttribute("disabled", "disabled");

  navigator.geolocation.getCurrentPosition((position) => {
    const data = {
      lat: position.coords.latitude,
      long: position.coords.longitude,
    };

    socket.emit("sendLocation", data, (message) => {
      $locationButton.removeAttribute("disabled");
      console.log(message);
    });
  });
});

socket.emit('join', {username, room})