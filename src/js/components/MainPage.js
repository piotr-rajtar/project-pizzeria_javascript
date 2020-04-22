import {utils} from '../utils.js';
import {select, templates} from '../settings.js';

class MainPage {
  constructor(element){
    const thisPage = this;

    thisPage.render();
    thisPage.getElements(element);
    console.log('element', element);

  }

  render() {
    const thisPage = this;
    const generatedHTML = templates.mainPage();

    thisPage.element = utils.createDOMFromHTML(generatedHTML);

    const pageContainer = document.querySelector(select.containerOf.mainPage);

    pageContainer.appendChild(thisPage.element);
  }

  getElements(element){
    const thisPage = this;

    thisPage.dom = {};

    thisPage.dom.wrapper = element;

    console.log(thisPage.dom.wrapper);

  }
}

export default MainPage;