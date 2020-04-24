import {classNames, select, templates} from '../settings.js';

class MainPage {
  constructor(element){
    const thisPage = this;

    thisPage.render(element);
    thisPage.getElements();
    thisPage.initCarousel();
    thisPage.initBoxPages();

  }

  render(element) {
    const thisPage = this;
    const generatedHTML = templates.mainPage();
    thisPage.dom = {}; 
    thisPage.dom.wrapper = element;
    thisPage.dom.wrapper.innerHTML = generatedHTML;
  }

  getElements() {
    const thisPage = this;

    thisPage.pages = document.querySelector(select.containerOf.pages).children;
    thisPage.navLinks = document.querySelectorAll(select.nav.links);

    thisPage.orderBox = document.querySelector(select.mainPage.orderBox);
    thisPage.bookingBox = document.querySelector(select.mainPage.bookingBox);
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

  initBoxPages() {
    const thisPage = this;

    thisPage.orderBox.addEventListener('click', function(event){
      event.preventDefault();
      thisPage.removeActive();
      thisPage.initOrderBox();
    });

    thisPage.bookingBox.addEventListener('click', function(event){
      event.preventDefault();
      thisPage.removeActive();
      thisPage.initBookingBox();
    });

  }

  removeActive() {
    const thisPage = this;

    for (let page of thisPage.pages) {
      page.classList.remove(classNames.pages.active);
    }

    for (let link of thisPage.navLinks) {
      link.classList.remove(classNames.nav.active);
    }

  }

  initOrderBox() {
    const thisPage = this;

    for (let page of thisPage.pages) {
      if (page.id == 'order') {
        page.classList.add(classNames.pages.active);
      }
    }

    for (let link of thisPage.navLinks) {
      let linkAttribute = link.getAttribute('href').replace('#', '');
      
      if (linkAttribute == 'order') {
        link.classList.add(classNames.nav.active);
      }
    }
    
  }

  initBookingBox() {
    const thisPage = this;

    for (let page of thisPage.pages) {
      if (page.id == 'booking') {
        page.classList.add(classNames.pages.active);
      }
    }

    for (let link of thisPage.navLinks) {
      let linkAttribute = link.getAttribute('href').replace('#', '');
      
      if (linkAttribute == 'booking') {
        link.classList.add(classNames.nav.active);
      }
    }

  }

}

export default MainPage;