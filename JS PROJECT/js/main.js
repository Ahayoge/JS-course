const header = document.querySelector('.header'); // Хэдер
const modal = document.querySelector('.modal'); // Модальное окно (поп-ап корзина)
const buttonCart = document.querySelector('.cart'); // Кнопка, открывающая корзину (в хэдере)
const buttonsModal = document.querySelectorAll('.modal__button');
let cartCounter = 0;
let cartCount = document.querySelector('.cart__count'); //<span> - счётчик позиций в корзине (тот, что на кнопке в хэдере)
let modalSum = document.querySelector('.modal__sum'); // <span> - счётчик итоговой суммы в корзине.
let modalList = document.querySelector('.modal__list'); // <ul> в корзине, в который помещаются позиции
let paySum = document.querySelector('.pay__sum');
let payPage = document.querySelector('.pay-page');
let totalSum = 0;
let payButtons = document.querySelectorAll('.pay__button');
let sections = document.querySelectorAll('section');

// Динамическая тень хэдера
window.addEventListener("scroll", () => {
  if (!window.scrollY) {
    header.classList.remove('shadow');
  } else {
    header.classList.add('shadow');
  }
});

buttonCart.addEventListener("click", () => {
  modal.classList.add('_open');
  document.body.classList.add('_lock');
});

buttonsModal[0].addEventListener("click", () => {
  if (!totalSum) {
    alert('Ваша корзина пуста! Для перехода к оплате добавьте в корзину как минимум 1 позицию.');
  } else {
    modal.classList.remove('_open');
    payPage.classList.add('_open');
  }
});

buttonsModal[1].addEventListener("click", () => {
  cart.cleanCart();
});

buttonsModal[2].addEventListener("click", () => {
  modal.classList.remove('_open');
  document.body.classList.remove('_lock');
});

payButtons[1].addEventListener("click", () => {
  payPage.classList.remove('_open');
  document.body.classList.remove('_lock');
});

var select = document.querySelector('select');
select.addEventListener('change', () => {
  sections.forEach(section => {
    if (section.id !== select.value && select.value !== 'category') {
      section.classList.add('_hidden');
    } else {
      section.classList.remove('_hidden');
    }
  });
});

let allFoods = [];

function fillSection(foodType, foodList) {
  foodList = document.querySelector(foodList);
  allFoods.filter(food => food.type === foodType).forEach(element => {
    foodList.append(createCard(element.name, element.price, element.img, element.id));
  });
}

function fillPage() {
  fillSection('burger', '.burger__list');
  fillSection('dessert', '.dessert__list');
  fillSection('drink', '.drink__list');
}

async function getFoods() {
  await fetch("http://localhost:3000/foods").then(res => res.json()).then(result => (allFoods = result));
  fillPage();
  cart.renderCart();
}

const cart = {
  cartFoods: [],
  addCartId(idx) {
    const foodItem = this.cartFoods.find(food => food.id === idx);
    if (foodItem) {
      this.plusFood(idx);
    } else {
      const { id, name, price, img } = allFoods.find(food => food.id === idx);
      this.cartFoods.push({ id, name, price, img, count: 1 });
      cartCounter++;
    }
    this.applyChanges();
  },

  plusFood(idx) {
    const elem = this.cartFoods.find(el => el.id === idx);
    if (elem) {
      let modalAmount = document.querySelector('[data-id="' + idx + '"].modal__amount');
      elem.count++;
      modalAmount.textContent = elem.count;
      cartCounter++;
    }
    this.applyChanges();
  },

  minusFood(idx) {
    const elem = this.cartFoods.find(el => el.id === idx);
    if (elem.count === 1) {
      this.cartFoods.splice(this.cartFoods.indexOf(elem), 1);
      let modalItem = document.querySelector('[data-id="' + idx + '"].modal__item');
      modalItem.parentNode.removeChild(modalItem);
    } else {
      let modalAmount = document.querySelector('[data-id="' + idx + '"].modal__amount');
      elem.count--;
      modalAmount.textContent = elem.count;
    }
    cartCounter--;

    this.applyChanges();
  },

  cleanCart() {
    this.cartFoods = [];
    cartCounter = 0;
    this.applyChanges();
  },

  saveData(key, data) {
    let jsonData = JSON.stringify(data);
    localStorage.setItem(key, jsonData);
  },

  getData(key) {
    let storage = localStorage.getItem(key);
    return storage ? JSON.parse(storage) : [];
  },

  applyChanges() {
    this.saveData('food', this.cartFoods);
    this.saveData('cartCounter', cartCounter);
    this.getTotalSum();
    this.renderCart();
  },

  getTotalSum() {
    totalSum = this.cartFoods.reduce((total, item) => total + item.price * item.count, 0);
    this.saveData('total_price', totalSum);
  },

  renderCart() {
    // Получаем из локал стореджа список товаров в корзине
    this.cartFoods = this.getData('food');
    modalList.innerHTML = '';


    modalSum.textContent = this.getData('total_price') + ' ₽';
    paySum.textContent = this.getData('total_price') + ' ₽';
    cartCounter = this.getData('cartCounter');
    cartCount.textContent = cartCounter;

    if (this.cartFoods.length) {
      for (let element of this.cartFoods) {
        let menuItem = createModalItem(element.name, element.price, element.img, element.id, element.count);
        modalList.append(menuItem);
      }
    }
  }
}

// Это карточка каждой позиции на главной странице
function createCard(title, price, src, id) {
  let card = document.createElement('li');
  let cardImg = document.createElement('img');
  let cardTitle = document.createElement('h3');
  let cardBottom = document.createElement('div');
  let cardPrice = document.createElement('h4');
  let cardButton = document.createElement('button');

  card.classList.add('card', 'flex');
  cardImg.classList.add('card__img');
  cardImg.src = src;
  cardTitle.classList.add('card__title');
  cardTitle.textContent = title;
  cardBottom.classList.add('card__bottom', 'flex');
  cardPrice.classList.add('card__price');
  cardPrice.textContent = price + ' ₽';
  cardButton.classList.add('btn-reset', 'card__button');
  cardButton.textContent = 'В корзину'
  cardButton.dataset.id = id;

  cardButton.addEventListener('click', () => {
    cart.addCartId(cardButton.dataset.id);
  });

  cardBottom.append(cardPrice, cardButton);
  card.append(cardImg, cardTitle, cardBottom);

  return card;
}


// А это карточка в корзине
function createModalItem(name, price, img, id, count) {

  let modalItem = document.createElement('li');
  modalItem.className = "modal__item flex";
  modalItem.dataset.id = id;

  let modalImg = document.createElement('img');
  modalImg.className = "modal__img";
  modalImg.src = img;
  modalItem.appendChild(modalImg);

  let modalText = document.createElement('div');
  modalText.className = "modal__text";

  let modalTitle = document.createElement('h3');
  modalTitle.className = "modal__title";
  modalTitle.textContent = name;
  modalText.appendChild(modalTitle);

  let modalAmountWrap = document.createElement('div');
  modalAmountWrap.className = "modal__amount__wrap flex";

  let buttonMinus = document.createElement('button');
  buttonMinus.className = "btn-reset modal-minus";
  buttonMinus.textContent = "-";
  buttonMinus.dataset.id = id;
  buttonMinus.addEventListener('click', () => {
    cart.minusFood(buttonMinus.dataset.id);
  });
  modalAmountWrap.appendChild(buttonMinus);

  let spanAmount = document.createElement('span');
  spanAmount.className = "modal__amount";
  spanAmount.textContent = count;
  spanAmount.dataset.id = id;
  modalAmountWrap.appendChild(spanAmount);

  let buttonPlus = document.createElement('button');
  buttonPlus.className = "btn-reset modal-plus";
  buttonPlus.textContent = "+";
  buttonPlus.dataset.id = id;

  buttonPlus.addEventListener('click', () => {
    cart.plusFood(buttonPlus.dataset.id);
  });
  modalAmountWrap.appendChild(buttonPlus);

  modalText.appendChild(modalAmountWrap);
  modalItem.appendChild(modalText);

  let modalPrice = document.createElement('h3');
  modalPrice.className = "modal__price";
  modalPrice.textContent = price + " ₽";
  modalItem.appendChild(modalPrice);

  return modalItem;
}

document.addEventListener('DOMContentLoaded', () => {
  getFoods();
});