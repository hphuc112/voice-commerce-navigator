let currentSlide = 0;
const slides = document.querySelectorAll(".hero-slide");
const totalSlides = slides.length;

function showSlide(index) {
  slides.forEach(s => s.classList.remove("active"));
  slides[index].classList.add("active");
}

function nextSlide() {
  currentSlide = (currentSlide + 1) % totalSlides;
  showSlide(currentSlide);
}

setInterval(nextSlide, 4000);

