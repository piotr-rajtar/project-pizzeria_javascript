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
        thisProduct.addToCart();
      });

    }

    processOrder(){
      const thisProduct = this;
      const formData = utils.serializeFormToObject(thisProduct.form); //----pokazuje ktora opcja jest zaznaczona - nazwa to klucz
      thisProduct.params = {};
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
            if(!thisProduct.params[paramId]) {
              thisProduct.params[paramId] = {
                label: param.label,
                options: {},
              };
            }
            thisProduct.params[paramId].options[optionId] = option.label;

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

      thisProduct.priceSingle = price;
      thisProduct.price = thisProduct.priceSingle * thisProduct.amountWidget.value;

      thisProduct.priceElem.innerHTML = thisProduct.price;
      //console.log('product params', thisProduct.params);
    }

    initAmountWidget(){
      const thisProduct = this;

      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);

      thisProduct.amountWidgetElem.addEventListener('updated', function(){
        thisProduct.processOrder();
      });
    }

    addToCart(){
      const thisProduct = this;

      thisProduct.name = thisProduct.data.name;
      thisProduct.amount = thisProduct.amountWidget.value;

      app.cart.add(thisProduct);

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

      const event = new CustomEvent('updated', {
        bubbles: true
      });
      thisWidget.element.dispatchEvent(event); //wysylamy nowo stworzony event do standardowej grupy eventow
    }
  }

  class Cart {
    constructor(element){
      const thisCart = this;

      thisCart.products = []; //produkty dodane do koszyka
      thisCart.deliveryFee = settings.cart.defaultDeliveryFee;

      thisCart.getElements(element); //pobiera elementy z produktów w koszyku
      thisCart.initActions();

      //console.log('new Cart', thisCart);
    }

    getElements(element){
      const thisCart = this;

      thisCart.dom = {}; //tu beda przechowywane wszystkie elementy DOM, wyszukane w koszyku

      thisCart.dom.wrapper = element; //cały koszyk
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger); //podsumowanie zamówienia na dole
      thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList); //lista produktów w koszyku
      
      thisCart.renderTotalKeys = ['totalNumber', 'totalPrice', 'subtotalPrice', 'deliveryFee'];

      for (let key of thisCart.renderTotalKeys){
        thisCart.dom[key] = thisCart.dom.wrapper.querySelectorAll(select.cart[key]);
      }
    }

    initActions(){
      const thisCart = this;
      thisCart.dom.toggleTrigger.addEventListener('click', function(){
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive); //za kliknięciem pojawia się ukryty koszyk
      });

      thisCart.dom.productList.addEventListener('updated', function(){
        thisCart.update();
      });
    }

    add(menuProduct){
      const thisCart = this;
      const generatedHTML = templates.cartProduct(menuProduct); //z obiektu produktu - np pizza z zaznaczonymi opcjami, generujemy HTML
      const generatedDOM = utils.createDOMFromHTML(generatedHTML); // ten kod HTML wrzucamy do diva
      const cartProductList = document.querySelector(select.cart.productList); //do stałej przypisuje wrapper produktow w HTMLu
      thisCart.dom.productList = generatedDOM; //do wrappera produktow w koszyku wrzucam swoje divy

      cartProductList.appendChild(thisCart.dom.productList); //do wrappera produktow w HTML wrzucam produkty z wrappera produktow w koszyku
    
      thisCart.products.push(new CartProduct(menuProduct, generatedDOM)); // do tablicy wrzucam nowe instancje klasy, czyli każdego wybranego produktu osobno
      //console.log('this cart product:', thisCart.products);
      thisCart.update();
    }

    update(){
      const thisCart = this;

      thisCart.totalNumber = 0;
      thisCart.subtotalPrice = 0;

      for (let product of thisCart.products) {
        thisCart.subtotalPrice += product.price;
        thisCart.totalNumber += product.amount;
      }

      thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;

      for (let key of thisCart.renderTotalKeys){
        for (let elem of thisCart.dom[key]){
          elem.innerHTML = thisCart[key];
        }
      }

      //console.log('subprice', thisCart.subtotalPrice);
      //console.log('total number', thisCart.totalNumber);
      //console.log('total price', thisCart.totalPrice);
    }
  }

  class CartProduct{
    constructor(menuProduct, element){ // menu product - to obiekt - to np pizza z zaznaczoymi opcjami a element - dom element - to fragment html z zapisem tej pizzy
      const thisCartProduct = this;

      thisCartProduct.id = menuProduct.id;
      thisCartProduct.name = menuProduct.name;
      thisCartProduct.price = menuProduct.price;
      thisCartProduct.priceSingle = menuProduct.priceSingle;
      thisCartProduct.amount = menuProduct.amount;
      thisCartProduct.params = JSON.parse(JSON.stringify(menuProduct.params));

      thisCartProduct.getElements(element);
      thisCartProduct.initAmountWidget();

      //console.log('new cart product', thisCartProduct);
      //console.log('product data', menuProduct);
    }

    getElements(element){
      const thisCartProduct = this;

      thisCartProduct.dom = {};

      thisCartProduct.dom.wrapper = element;
      thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
      thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
      thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
      thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);
    }

    initAmountWidget(){
      const thisCartProduct = this;

      thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget);

      thisCartProduct.dom.amountWidget.addEventListener('updated', function(){
        thisCartProduct.amount = thisCartProduct.amountWidget.value;
        thisCartProduct.price = thisCartProduct.priceSingle * thisCartProduct.amount;
        thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
      });
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

    initCart: function(){
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
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
      thisApp.initCart();
    },
  };

  app.init();
}
