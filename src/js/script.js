/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },

    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },

    cart: {
      wrapperActive: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    },

    cart: {
      defaultDeliveryFee: 20,
    },
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
  };

  class Product {
    constructor(id, data) {
      const thisProduct = this;

      thisProduct.id = id;
      thisProduct.data = data;

      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();
    }

    renderInMenu() {
      const thisProduct = this;
      const generatedHTML = templates.menuProduct(thisProduct.data);

      thisProduct.element = utils.createDOMFromHTML(generatedHTML);

      const menuContainer = document.querySelector(select.containerOf.menu);

      menuContainer.appendChild(thisProduct.element);
    }

    getElements(){
      const thisProduct = this;

      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
    }

    initAccordion(){
      const thisProduct = this;

      const clickableTrigger = thisProduct.accordionTrigger;

      clickableTrigger.addEventListener('click', function(event){

        event.preventDefault();

        thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);

        const activeProducts = document.querySelectorAll(select.all.menuProductsActive);

        for (let activeProduct of activeProducts) {

          if (!(activeProduct === thisProduct.element)) {

            activeProduct.classList.remove(classNames.menuProduct.wrapperActive);

          }

        }

      });
    }

    initOrderForm(){
      const thisProduct = this;

      thisProduct.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });

      for (let input of thisProduct.formInputs){
        input.addEventListener('change', function(){
          thisProduct.processOrder();
        });
      }

      thisProduct.cartButton.addEventListener('click', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });

    }

    processOrder(){
      const thisProduct = this;
      const formData = utils.serializeFormToObject(thisProduct.form); //----pokazuje ktora opcja jest zaznaczona - nazwa to klucz
      let price = thisProduct.data.price;

      const params = thisProduct.data.params; //------obiekt - klucze i wlasciwosci PARAMS - obiekt dla sauce, topping, crust itd

      for (let paramId in params) {

        const param = params[paramId]; //---------------------------------obiekt - klucze i wlasciwosci dla kazdego paramu osobno

        const options = param.options; //--------obiekt - zbior kluczy i wlasciwosci dla klucza 'options' dla pojedynczego paramu
        for (let optionId in options) {

          const option = options[optionId]; //------------------------obiekt - zbior kluczy i wlasciwosci dla kazdej opcji osobno

          const optionSelected = formData.hasOwnProperty(paramId) && formData[paramId].indexOf(optionId) > -1;
          const optionNotSelected = (formData.hasOwnProperty(paramId) && formData[paramId].indexOf(optionId) == -1) || !formData.hasOwnProperty(paramId);

          if(optionSelected && !option.default){
            price = price + option.price;
          } else if(optionNotSelected && option.default) {
            price = price - option.price;
          }

          const targetImages = thisProduct.imageWrapper.querySelectorAll('.' + paramId + '-' + optionId);

          if(optionSelected){
            for(let targetImage of targetImages) {
              targetImage.classList.add(classNames.menuProduct.imageVisible);
            }
          } else {
            for(let targetImage of targetImages) {
              targetImage.classList.remove(classNames.menuProduct.imageVisible);
            }
          }
        }
      }

      price *= thisProduct.amountWidget.value;
      thisProduct.priceElem.innerHTML = price;
    }

    initAmountWidget(){
      const thisProduct = this;

      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);

      thisProduct.amountWidgetElem.addEventListener('updated', function(){
        thisProduct.processOrder();
      });
    }

  }

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

      const event = new Event('updated');
      thisWidget.element.dispatchEvent(event); //wysylamy nowo stworzony event do standardowej grupy eventow
    }
  }

  const app = {
    initMenu: function(){
      const thisApp = this;

      for (let productData in thisApp.data.products){
        new Product(productData, thisApp.data.products[productData]);
      }
    },

    initData: function(){
      const thisApp = this;

      thisApp.data = dataSource;
    },

    init: function(){
      const thisApp = this;
      //console.log('*** App starting ***');
      //console.log('thisApp:', thisApp);
      //console.log('classNames:', classNames);
      //console.log('settings:', settings);
      //console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();
    },
  };

  app.init();
}
