const socket = io();

const $messageForm = document.querySelector("#message-form");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");
const $messages = document.querySelector("#messages");
const $locations = document.querySelector("#location-link");

//templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-template").innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

//Options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

function htmlToElement(html) {
  var template = document.createElement("template");
  html = html.trim(); // Never return a text node of whitespace as the result
  template.innerHTML = html;
  return template.content.firstChild;
}

socket.on("message", (message) => {
  const { username, text, createdAt } = message;
  const html = Mustache.render(messageTemplate, {
    username: username,
    message: text,
    createdAt: moment(createdAt).format("HH:mm"),
  });
  const htmlElement = htmlToElement(html);
  $messages.insertAdjacentElement("beforeend", htmlElement);
});

socket.on("locationMessage", (message) => {
  const { username, url, createdAt } = message;
  const html = Mustache.render(locationTemplate, {
    username,
    url,
    createdAt: moment(createdAt).format("HH:mm"),
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
    });
  });
});

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users,
  });
  document.querySelector("#sidebar").innerHTML = html;
});

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
