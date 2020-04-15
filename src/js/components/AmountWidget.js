import {settings, select} from '../settings.js';
import BaseWidget from './BaseWidget.js';

class AmountWidget extends BaseWidget {
  constructor(element) { //tu przekazuje kod html
    super(element, settings.amountWidget.defaultValue);
    
    const thisWidget = this;

    thisWidget.getElements(element);

    thisWidget.dom.input.value = settings.amountWidget.defaultValue; //zeby na starcie byla widoczna domysla wartosc w inpucie

    thisWidget.initActions(thisWidget.dom.input.value);
   
  }

  getElements(){
    const thisWidget = this;

    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.amount.input);
    thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkIncrease);
  }

  isValid(value){

    return !isNaN(value)
      && value >= settings.amountWidget.defaultMin
      && value <= settings.amountWidget.defaultMax;
     
  }

  renderValue(){ //metode renderujaca, czyli wyswietlajaca wartosc na stronie
    const thisWidget = this;

    thisWidget.dom.input.value = thisWidget.value;
  }

  initActions() {
    const thisWidget = this;

    const inputValue = thisWidget.dom.input;
    const plusButton = thisWidget.dom.linkIncrease;
    const minusButton = thisWidget.dom.linkDecrease;

    inputValue.addEventListener('change', function(){
      thisWidget.value = thisWidget.dom.input.value;
    });

    plusButton.addEventListener('click', function(event){
      event.preventDefault();
      thisWidget.setValue(thisWidget.value + 1);
    });

    minusButton.addEventListener('click', function(event){
      event.preventDefault();
      thisWidget.setValue(thisWidget.value - 1);
    });
  }
}

export default AmountWidget;