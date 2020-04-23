import {templates} from '../settings.js';

class MainPage {
  constructor(element){
    const thisPage = this;

    thisPage.render(element);
    thisPage.initCarousel();

  }

  render(element) {
    const thisPage = this;
    const generatedHTML = templates.mainPage();
    thisPage.dom = {}; 
    thisPage.dom.wrapper = element;
    thisPage.dom.wrapper.innerHTML = generatedHTML;
  }

  initCarousel() {
    const thisPage = this;
    thisPage.slideIndex = 0;
    thisPage.showSlides();
  }

  showSlides() {
    const thisPage = this;
    let i;
    let slides = document.getElementsByClassName('slide');
    for (i = 0; i < slides.length; i++) {
      slides[i].style.display = 'none';
    }
    thisPage.slideIndex++;
    if (thisPage.slideIndex > slides.length) {thisPage.slideIndex = 1;}
    slides[thisPage.slideIndex-1].style.display = 'block';
    setTimeout(thisPage.showSlides(), 3000); // Change image every 2 seconds
  }



}

export default MainPage;