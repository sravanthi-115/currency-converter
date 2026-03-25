const API = "https://open.er-api.com/v6/latest";

const dropdowns = document.querySelectorAll("select");
const fromCurr = document.querySelector(".from select");
const toCurr = document.querySelector(".to select");
const msg = document.querySelector(".msg");
const amount = document.querySelector(".amount input");
const swapBtn = document.querySelector(".swap-btn");

let chart;

// Populate dropdowns
for (let select of dropdowns) {

  for (let currCode in countryList) {

    let option = document.createElement("option");
    option.value = currCode;
    option.innerText = currCode;

    if (select.name === "from" && currCode === "USD") {
      option.selected = "selected";
    }

    if (select.name === "to" && currCode === "INR") {
      option.selected = "selected";
    }

    select.append(option);
  }

  select.addEventListener("change", (evt) => {
    updateFlag(evt.target);
    updateExchangeRate();
  });
}

// Update flag
function updateFlag(element) {

  let currCode = element.value;
  let countryCode = countryList[currCode];
  let img = element.parentElement.querySelector("img");

  img.src = `https://flagsapi.com/${countryCode}/flat/64.png`;
}

// Update exchange rate
async function updateExchangeRate() {

  let amt = parseFloat(amount.value);

  if (isNaN(amt) || amt <= 0) {
    amt = 1;
  }

  let res = await fetch(`${API}/${fromCurr.value}`);
  let data = await res.json();

  let rate = data.rates[toCurr.value];
  let finalAmount = amt * rate;

  msg.innerText = `${amt} ${fromCurr.value} = ${finalAmount.toFixed(2)} ${toCurr.value}`;

  loadChart(rate);
}

// Swap currencies
swapBtn.addEventListener("click", () => {

  let temp = fromCurr.value;
  fromCurr.value = toCurr.value;
  toCurr.value = temp;

  updateFlag(fromCurr);
  updateFlag(toCurr);

  updateExchangeRate();
});

// Amount change
amount.addEventListener("input", updateExchangeRate);

// Search currency
function filterCurrencies(inputClass, selectElement) {

  const input = document.querySelector(inputClass);

  input.addEventListener("keyup", () => {

    let filter = input.value.toUpperCase();
    let options = selectElement.options;

    for (let i = 0; i < options.length; i++) {

      let txt = options[i].text;

      options[i].style.display = txt.includes(filter) ? "" : "none";
    }
  });
}

filterCurrencies(".from-search", fromCurr);
filterCurrencies(".to-search", toCurr);

// Theme toggle
const themeBtn = document.querySelector(".theme-toggle");

themeBtn.addEventListener("click", () => {

  document.body.classList.toggle("dark");

  themeBtn.innerHTML = document.body.classList.contains("dark")
    ? '<i class="fa-solid fa-sun"></i>'
    : '<i class="fa-solid fa-moon"></i>';
});

// Chart
function loadChart(rate) {

  let labels = ["1","2","3","4","5","6","7"];
  let values = [];

  for (let i = 0; i < 7; i++) {
    values.push(rate * (0.98 + Math.random() * 0.04));
  }

  if (chart) chart.destroy();

  const ctx = document.getElementById("chart").getContext("2d");

  chart = new Chart(ctx, {

    type: "line",

    data: {
      labels: labels,
      datasets: [{
        label: `${fromCurr.value} → ${toCurr.value}`,
        data: values,
        borderColor: "#ff758c",
        backgroundColor: "rgba(255,117,140,0.2)",
        fill: true,
        tension: 0.4
      }]
    },

    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      }
    }

  });
}

// Initial load
window.onload = updateExchangeRate;