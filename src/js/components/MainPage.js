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
    let slides = document.getElementsByClassName('slide');

    for (let i = 0; i < slides.length; i++) {
      slides[i].style.display = 'none';
    }

    if(!slides) {
      return;
    }

    slides[0].style.display = 'block';

    setInterval(function(){

      for (let i = 0; i < slides.length; i++) {
        slides[i].style.display = 'none';
      }

      thisPage.slideIndex++;

      if (thisPage.slideIndex > slides.length) {
        thisPage.slideIndex = 1;
      }
      
      slides[thisPage.slideIndex-1].style.display = 'block';
  
    }, 3000);
  }

}

export default MainPage;