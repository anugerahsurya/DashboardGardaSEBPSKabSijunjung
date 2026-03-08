const wrapper = document.getElementById("eventsWrapper");

document.getElementById("nextEvent").onclick = () => {
  wrapper.scrollBy({ left: 320, behavior: "smooth" });
};

document.getElementById("prevEvent").onclick = () => {
  wrapper.scrollBy({ left: -320, behavior: "smooth" });
};

let slideIndex = 0;
const slides = document.querySelectorAll(".ig-slide");

function showSlide(index){
  slides.forEach(slide => slide.classList.remove("active"));
  slides[index].classList.add("active");
}

document.querySelector(".ig-next").onclick = () => {
  slideIndex++;
  if(slideIndex >= slides.length) slideIndex = 0;
  showSlide(slideIndex);
};

document.querySelector(".ig-prev").onclick = () => {
  slideIndex--;
  if(slideIndex < 0) slideIndex = slides.length - 1;
  showSlide(slideIndex);
};

showSlide(slideIndex);

const igSlides = document.querySelectorAll(".ig-slide");
const nextBtn = document.querySelector(".ig-next");
const prevBtn = document.querySelector(".ig-prev");

let current = 0;

function updateSlides(){

  igSlides.forEach(slide=>{
    slide.classList.remove("prev","active","next");
  });

  const prev = (current - 1 + igSlides.length) % igSlides.length;
  const next = (current + 1) % igSlides.length;

  igSlides[current].classList.add("active");
  igSlides[prev].classList.add("prev");
  igSlides[next].classList.add("next");
}

nextBtn.onclick = ()=>{
  current = (current + 1) % igSlides.length;
  updateSlides();
};

prevBtn.onclick = ()=>{
  current = (current - 1 + igSlides.length) % igSlides.length;
  updateSlides();
};

updateSlides();