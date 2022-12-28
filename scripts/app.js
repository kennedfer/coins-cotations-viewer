function getDateFromTimestamp(strTimestamp) {
  let timestamp = parseFloat(strTimestamp);
  let date = new Date(timestamp * 1000);
  var day = date.getDate();
  var month = date.getMonth() + 1;

  return `${day}/${month}`;
}

function getLabelsFromTimestamp(timestamps) {
  let labels = [];
  timestamps.forEach((timestamp) => {
    labels.push(getDateFromTimestamp(timestamp));
  });

  return labels;
}

function getArrayFromTheCurrentValueOption(
  currencyValuesObjects,
) {
  let dataCurrent = [];

  let timestamps = [];
  let lowPeriod = 10;
  let highPeriod = 0;

  for (let [key, value] of Object.entries(currencyValuesObjects)) {
    let currValue = value["ask"];
    let low = value["low"];
    let high = value["high"];
    
    lowPeriod = (low<lowPeriod)? low:lowPeriod;
    highPeriod = (high>highPeriod)? high:highPeriod;

    dataCurrent.push(currValue);
    timestamps.push(value["timestamp"]);
  }


  return [
    dataCurrent.reverse(),
    timestamps.reverse(),
    lowPeriod,
    highPeriod,
  ];
}

function getArrayOfCurrencys(dataApi) {
  let currencysObjectsArray = [];
  for (let [key, value] of Object.entries(dataApi)) {
    currencysObjectsArray.push(value);
  }

  return currencysObjectsArray;
}

async function buildCurrenciesDropdown() {
  let reply = await fetch(
    "https://kennedfer.github.io/coins-cotations-viewer/data/currencies.json"
  );

  let data = await reply.json();
  for (let [key, value] of Object.entries(data)) {
    var currentCurrencieHtml = document.createElement("option");
    currentCurrencieHtml.value = key;
    currentCurrencieHtml.innerHTML = value.trim();
    dropDownCurrencies.appendChild(currentCurrencieHtml);
  }
}


async function getApiResponse(currencie, period) {
  let reply = await fetch(
    `https://economia.awesomeapi.com.br/json/daily/${currencie}/${period}`
  );
  let data = await reply.json();

  return data;
}

async function refreshChart(){
  await resfreshApiObjects(currenciesDropdown.value,periodDaysDropdown.value);
  currentValuesArray = getArrayFromTheCurrentValueOption(dataApi, currentValueOption);
  chart.config.data.datasets[0].data = currentValuesArray[0];
  chart.config.data.labels = getLabelsFromTimestamp(currentValuesArray[1]);
  chart.update();
}

async function resfreshApiObjects(currencie, period){
  dataApi = await getApiResponse(currencie, period);
  currentValuesArray = await getArrayFromTheCurrentValueOption(dataApi);
  labels = getLabelsFromTimestamp(currentValuesArray[1]);
  
  let firstObjectResponse = dataApi['0'];
  variationHtml.innerHTML = firstObjectResponse.varBid;
  percentVariationHtml.innerHTML = firstObjectResponse.pctChange;
  buyHtml.innerHTML = firstObjectResponse.bid;
  sellHtml.innerHTML = firstObjectResponse.ask;
  createdDateHtml.innerHTML = firstObjectResponse["create_date"].split(" ")[1];

  lowTodayHtml.innerHTML = firstObjectResponse.low;
  highTodayHtml.innerHTML = firstObjectResponse.high;
  lowPeriodHtml.innerHTML = currentValuesArray[2];
  highPeriodHtml.innerHTML = currentValuesArray[3];
}

let dataApi;
let currentValueOption;
let currentValuesArray;
let labels;

const variationHtml = document.getElementById("variation-text");
const percentVariationHtml = document.getElementById("percent-variation-text");
const buyHtml = document.getElementById("buy-text");
const sellHtml = document.getElementById("sell-text");
const createdDateHtml = document.getElementById("created-text");
const lowTodayHtml = document.getElementById("low-today");
const highTodayHtml = document.getElementById("high-today");
const lowPeriodHtml = document.getElementById("low-period");
const highPeriodHtml = document.getElementById("high-period");
const dropDownCurrencies = document.getElementById("cotation-dropdown");
const periodDaysDropdown = document.getElementById("period-days");
const currenciesDropdown = document.getElementById("cotation-dropdown");
let chart;

async function main() {
  
  await buildCurrenciesDropdown();
  periodDaysDropdown.onchange = async () =>{
    await refreshChart();
  }

  currenciesDropdown.onchange = async () =>{
    await refreshChart();
  }

  await resfreshApiObjects(currenciesDropdown.value,periodDaysDropdown.value);

  const ctx = document.getElementById("myChart");
  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          data: currentValuesArray[0],
          backgroundColor: "rgba(255, 99, 132, 1)",
          borderColor: "rgba(255, 50, 102, 1)",
          pointStyle: false,
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,

      plugins: {
        
        legend: {
          display: false,
        },
      },

      scales: {
        y: {
          grid: {
            lineWidth: 0.1,
            color: "rgba(255,255,255,1)",
          },

        },
        x: {
          grid: {
            lineWidth: 0.1,
            color: "rgba(255,255,255,1)",
          },
        },
      },
    },
  });
}

main();