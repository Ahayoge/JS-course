const API = {
  base: 'https://api.openweathermap.org/data/2.5/',
  key: 'b49d80984fbce55039e1dae7b89418e1'
}


const container = document.querySelector('.location-container');
const input = document.querySelector('.searchbar');

let city = localStorage.getItem('city');
let store = {};

const dateBuilder = (d) => {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"];
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
  ];

  const day = days[d.getDay()];
  const date = d.getDate();
  const month = months[d.getMonth()];
  const year = d.getFullYear();

  return `${day} ${date} ${month} ${year}`
}

input.addEventListener('keyup', (e) => {

  const value = e.target.value;

  if (e.key == "Enter" && value) {
    city = value;
    localStorage.setItem('city', city);
    fetchData();
    e.target.value = '';
  }
})

const fetchData = async () => {
  getLoader();  
  const response = await fetch(`${API.base}weather?q=${city}&appid=${API.key}`).then(res => res.json());
  const {name, weather, main: {temp}, sys: {country}} = response;
  store = {
    name,
    weather: weather[0].main,
    temp,
    country
  };
  renderComponent();
}

const getLoader = () => {
  container.innerHTML = `<span class="loader"></span>`
}
const renderComponent = () => {
  container.innerHTML = getContent();
}

const getContent = () => {

  const {name, weather, temp, country} = store;
  // Тем не менее получилось через Date();
  return `<div class="location-container">
  <div class="location-box">
    <div class="location">
      ${name}, ${country}
    </div>
    <div class="date">${dateBuilder(new Date())}</div>
  </div>

  <div class="weather-box">
    <div class="temp">${Math.round((temp-273.15) * 100) / 100} °C</div>
    <div class="weather">${weather}</div>
  </div>
</div>`
}
fetchData();