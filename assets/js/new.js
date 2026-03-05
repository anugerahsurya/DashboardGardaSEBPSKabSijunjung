const wrapper = document.getElementById("eventsWrapper");

document.getElementById("nextEvent").onclick = () => {
  wrapper.scrollBy({ left: 320, behavior: "smooth" });
};

document.getElementById("prevEvent").onclick = () => {
  wrapper.scrollBy({ left: -320, behavior: "smooth" });
};