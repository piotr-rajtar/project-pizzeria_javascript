import {settings, select} from '../settings.js';

class AmountWidget {
  constructor(element) { //tu przekazuje kod html
    const thisWidget = this; //na podstawie kodu tworzy sie obiekt

    thisWidget.getElements(element); //wywoluje metode getElements ktora wyodrebniam guziki i miejsce na liczbe

    thisWidget.value = settings.amountWidget.defaultValue;

    thisWidget.setValue(thisWidget.input.value); //uruchamiam metode set value ktora wstawia mi nowe liczby na strone
    thisWidget.initActions(thisWidget.input.value);
    //console.log('Amount Widget:', thisWidget); //obiekt ze wszystkim, guzikami, inputem, elementami html
    //console.log('constructor arguments: ', element); //tylko kod html z divem z tym
  }

  getElements(element){
    const thisWidget = this;

    thisWidget.element = element; //caly div z widgetem
    thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input); //miejsce na liczbe
    thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease); //guzik z minusem
    thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease); //guzik z plusem
  }

  setValue(value) {
    const thisWidget = this;

    const newValue = parseInt(value); //zmienna newValue przyjmuje wartosc value zmieniona na liczbe calkowita, bo wartosc z pola input bedzie tekstem

    const validMin = thisWidget.value >= settings.amountWidget.defaultMin && thisWidget.input.value >= settings.amountWidget.defaultMin;
    const validMax = thisWidget.value <= settings.amountWidget.defaultMax  && thisWidget.input.value <= settings.amountWidget.defaultMax;

    if (validMin && validMax) {
      thisWidget.value = newValue; // zmienna newValue bedzie nowa wlasciwoscia obiektu thisWidget klucz: value-newValue
      thisWidget.announce();
    }

    thisWidget.input.value = thisWidget.value; //wrzucamy do inputa ta liczbe uzyskana z tekstu, dzieki temu nowa wartosc wyswietli sie na stronie

  }

  initActions() {
    const thisWidget = this;

    const inputValue = thisWidget.input; //const czy let
    const plusButton = thisWidget.linkIncrease;
    const minusButton = thisWidget.linkDecrease;

    inputValue.addEventListener('change', function(){ //przy zmianie inputu, jest on znowu konwertowany na cyfre
      thisWidget.setValue(thisWidget.input.value);
    });

    plusButton.addEventListener('click', function(event){ //przy klikinieciu zmienia wartosc o 1 i konwertuje na cyfre
      event.preventDefault();
      if (thisWidget.value == 9) {
        thisWidget.setValue(thisWidget.value);
      } else {
        thisWidget.setValue(thisWidget.value + 1);
      }
    });

    minusButton.addEventListener('click', function(event){
      event.preventDefault();
      if (thisWidget.value == 1) {
        thisWidget.setValue(thisWidget.value);
      } else {
        thisWidget.setValue(thisWidget.value - 1);
      }
    });
  }

  announce() {
    const thisWidget = this;

    const event = new CustomEvent('updated', {
      bubbles: true
    });
    thisWidget.element.dispatchEvent(event); //wysylamy nowo stworzony event do standardowej grupy eventow
  }
}

export default AmountWidget;