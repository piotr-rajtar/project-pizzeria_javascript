import {settings, select, classNames, templates} from '../settings.js';
import {utils} from '../utils.js';
import CartProduct from './CartProduct.js';

class Cart {
  constructor(element){
    const thisCart = this;

    thisCart.products = []; //produkty dodane do koszyka
    thisCart.deliveryFee = settings.cart.defaultDeliveryFee;

    thisCart.getElements(element); //pobiera elementy z produktów w koszyku
    thisCart.initActions();

  }

  getElements(element){
    const thisCart = this;

    thisCart.dom = {};

    thisCart.dom.wrapper = element; //cały koszyk
    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger); //podsumowanie zamówienia na dole
    thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList); //lista produktów w koszyku
    thisCart.renderTotalKeys = ['totalNumber', 'totalPrice', 'subtotalPrice', 'deliveryFee'];
    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
    thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
    thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);

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

    thisCart.dom.productList.addEventListener('remove', function(){
      thisCart.remove(event.detail.cartProduct);
    });

    thisCart.dom.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisCart.phone = thisCart.dom.phone.value;
      thisCart.address = thisCart.dom.address.value;
      thisCart.sendOrder();
    });
  }

  add(menuProduct){
    const thisCart = this;
    const generatedHTML = templates.cartProduct(menuProduct);
    const generatedDOM = utils.createDOMFromHTML(generatedHTML); // ten kod HTML wrzucamy do diva
    const cartProductList = document.querySelector(select.cart.productList);
    thisCart.dom.productList = generatedDOM; //do wrappera produktow w koszyku wrzucam swoje divy

    cartProductList.appendChild(thisCart.dom.productList); //do wrappera produktow w HTML wrzucam produkty z wrappera produktow w koszyku
    
    thisCart.products.push(new CartProduct(menuProduct, generatedDOM)); // do tablicy wrzucam nowe instancje klasy, czyli każdego wybranego produktu osobno
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
  }

  remove(cartProduct){
    const thisCart = this;

    const index = thisCart.products.indexOf(cartProduct); //zbieram indeks elementu ktory chce usunac

    thisCart.products.splice(index, 1); 

    cartProduct.dom.wrapper.remove(); //usuwam dany element DOM (element li  z koszyka ktory jest przekazywany do klasy cartProduct)
    thisCart.update();
  }

  sendOrder(){
    const thisCart = this;

    const url = settings.db.url + '/' + settings.db.order;

    const payload = {
      phone: thisCart.phone,
      address: thisCart.address,
      number: thisCart.totalNumber,
      subtotalPrice: thisCart.subtotalPrice,
      deliveryFee: thisCart.deliveryFee,
      totalPrice: thisCart.totalPrice,
      products: [],
    };

    for (let product of thisCart.products){
      payload.products.push(product.getData()); //thisCart.product to instancja klasy cart product wiec mozna sie do nich odwolywac
    }

    const options = {
      method: 'POST', //zmieniamy domyslna metode GET na POST
      headers: { 
        'Content-Type': 'application/json', //dajemy serwerowi znac jaki rodzaj danych do niego wysylamy
      },
      body: JSON.stringify(payload), //tresc 
    };

    fetch(url, options)
      .then(function(response){
        return response.json();
      }).then(function(parsedResponse){
        console.log('parsedResponse', parsedResponse);
      });
  }

}

export default Cart;