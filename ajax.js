
const api = '885e1189903c4121bb6d6fdd11a43d2d';

let userBalance = 0;
let stocksList;



  function getIndexes() {

    const symbols = ['DJI', 'SPX', 'IXIC'];
    const chartData = [];

    // "url": `https://twelvedata.p.rapidapi.com/bbands?sd=2&outputsize=24&series_type=close&ma_type=SMA&time_period=20&symbol=${symbol}&interval=1day&apikey=${api}`,

    symbols.forEach(symbol => {

      const settings = {
        "async" : true,
        "crossDomain" : true,
        "url" : `https://api.twelvedata.com/time_series?symbol=${symbol}&outputsize=24&interval=1week&apikey=${api}`,
        "method" : "GET"
      }

      $.ajax(settings).then(function (response) {
        console.log(symbol);
        console.log(response);

        const data = [];
        const dates = [];

        $.each(response.values, function(index, value) {
          // insert the highest for that day and the datetime into list as the dataset
          data.push(value.high); // set to upper_band if using the rapidapi call commented out
          dates.push(value.datetime);
        });

        let label = '';
        if(symbol === 'DJI') label = 'DOW';
        else if(symbol === 'SPX') label = 'S&P 500';
        else label = 'NASDAQ';

        // build data into the right format, store in list, then create a chart
        chartData.push({
          label : label,
          dates: dates,
          data : data
        });

        buildChart(chartData);

      });

    });
  }

  // generic function to take dataset of any size and build a chart
  // needs to be formatted as follows:
  // [{ label : 'the name of the stock or symbol',
  //    dates : [array of dates to be used],
  //    data : [dataset, same length as dates]},
  // {...}]

  function buildChart(stockData) {
    console.log(stockData);

    // const labelList = [];
    // for(let i = 0; i < 100; i+=20)
    //   labelList.push(stockData['0'].dates.reverse()[i]);

    // will be set as the value for the datasets property
    const processedData = {};
    processedData.labels = stockData['0'].dates.reverse();
    processedData.datasets = [];

    for(let i = 0; i < stockData.length; i++) {
      // dataset to be pushed to `processedData`
      const dataset = {};

      // rng to get 3 values 100 - 255 for the RGB values for data.color
      const color1 = Math.floor((Math.random() * 150) + 100);
      const color2 = Math.floor((Math.random() * 150) + 100);
      const color3 = Math.floor((Math.random() * 150) + 100);

      dataset.fill = false;
      dataset.label = stockData[i].label;
      dataset.data = stockData[i].data.reverse();

      dataset.borderColor = [`rgba(${color1}, ${color2}, ${color3}, .8)`];
      dataset.borderWidth = 2;

      dataset.pointRadius = 2;
      dataset.pointBorderWidth = 1;
      dataset.pointBackgroundColor = ['rgba(124,124,124,1)'];
      dataset.pointHoverBackgroundColor = ['rgba(0,0,0,1)']

      processedData.datasets.push(dataset);

    }

    console.log(processedData);

    const ctx = document.querySelector('#canvas').getContext('2d');
    const myChart = new Chart(ctx, {
        type: 'line',
        data: processedData,
        options: {
          scales: {
              yAxes: [{
                  ticks: {
                      beginAtZero: true
                  }
              }]
          }
      }
    });
  }

  function getQuotes() {
    // comma delimited list of symbols to query the api
    // add comma to adjust the return json so it's consistent
    const symbols = $('#input').val().trim()+',';
    // make sure the list is comma delimited and not spaces
    symbols.replace(/ /g, ',');
    let outputsize = '';
    let interval = '';

    // 1 day, hour by hour, 3 days, every 3 hours, 1 week, daily, 1 month daily
    if($("#oneDay").prop("checked", true)) {
        outputsize = '24';
        interval = '1h'
    }
    else if($("#oneWeek").prop("checked", true)) {
      outputsize = '7';
      interval = '1day';
    }
    else if($("#twoWeek").prop("checked", true)) {
      outputsize = '14';
      interval = '1day';
    }
    else if($("#oneMonth").prop("checked", true)) {
      outputsize = '30';
      interval = '1day';
    }
    else if($("#threeMonth").prop("checked", true)) {
      outputsize = '12';
      interval = '1week';
    }
    else if($("#oneYear").prop("checked", true)) {
      outputsize = '52';
      interval = '1week';
    }
    // 6 month
    else {
      outputsize = '24';
      interval = '1week';
    }

    const canvas = document.querySelector('#canvas');

    const settings = {
      "async" : true,
      "crossDomain" : true,
      "url" : `https://api.twelvedata.com/time_series?symbol=${symbols}&outputsize=${outputsize}&interval=${interval}&apikey=${api}`,
      "method" : "GET"
    }


    $.ajax(settings).then(function (response) {
      // console.log(response);
      chartData = [];

      // dates for the table
      const dates = [];
      // populate dates array
      const firstObjValue = response[Object.keys(response)[0]].values;
      $.each(firstObjValue, function(index, x) {
        dates.push(x.datetime);
      });

      // create table
      const table = $('<table>');
      // create table header
      const headerRow = $('<tr>');
      // top left corner
      headerRow.append('<th>')
      dates.forEach((date) => {
        headerRow.append(`<th>${date}</th>`);
      });
      table.append(headerRow);

      $.each(response, function(index, value) {
        const formattedData = {};
        // value will be the value for each key (index)
        const row = $('<tr>');
        row.append(`<th>${value.meta.symbol}</th>`);
        formattedData.label = value.meta.symbol;
        formattedData.data = [];
        formattedData.dates = dates;

        // table variables will be the open, close, and high
        //chart will use the highest of each day, week, etc.
        // value.values is each data point's json with datetime, high, low, etc.
        $.each(value.values, function(index, data){
          formattedData.data.push(data.high);
          row.append(`<td>Open: ${data.open}<br>Close: ${data.close}<br>High: ${data.high}</td>`);
          row.css('font-size', '10px');

        });
        console.log(formattedData);
        chartData.push(formattedData);
        table.append(row);

      });
      $('#tableDiV').append(table);
      buildChart(chartData);

    });

  }

  // on load, run this so we always have an account set up
  function setProfile() {
    // if no account exists, create an account with $2500
    if(localStorage.getItem('stonks') === null) {
      let stonks = {};
      stonks.balance = 2500;
      stonks.stonkList = {'IBM' : 10, 'AAPL' : 5};
      stonks.total = 2500; // balance + worth of the list of stocks

      // add to localStorage
      localStorage.setItem('stonks', JSON.stringify(stonks));
    }
  }

  function getProfile() {
    // get list of their stocks
    const stonks = JSON.parse(localStorage.getItem('stonks'));
    userBalance = stonks.balance;
    stocksList = stonks.stonkList;
    const keys = Object.keys(stocksList).toString();
    console.log(keys);

    // query the list of the stock symbols
    const url = `https://api.twelvedata.com/price?symbol=${keys}&apikey=${api}`;

    const settings = {
      "async" : true,
      "crossDomain" : true,
      "url" : url,
      "method" : "GET"
    }

    $.ajax(settings).then(function (response) {
      const data = addStockValue(stocksList, userBalance, response);
      /*
      example data:
      {
        balance: <some number to 2 decimal places,
        # stock<n> is going to the stock symbol
        stock1: {
          count: <number of this stock owned>,
          price: <price of the stock when they logged in>,
          worth: <count * price>
        },
        stock2: {
          ...
        }
      }
      */

      // do with data what we must - add to page somewhere
    });


  }

  function addStockValue(stocksList, wallet, stockPrices) {
    const formattedData = {balance: wallet};
    // calculates the value of the number of stocks per price
    $.each(stocksList, function(index, value) {
      formattedData[index] = {price: stockPrices[index].price,
                              count: value,
                              worth: value * parseFloat(stockPrices[index].price)}
      formattedData.balance += value * parseFloat(stockPrices[index].price);
    });
    formattedData.balance = formattedData.balance.toFixed(2);
    return formattedData;
  }

  function purchase(symbol, count) {
    // can't be 0 or negative
    if(count <= 1) {
      // TODO create modal to alert user they need at least 1 stock

      return;
    }

    // call api to get the current stock price for that symbol
    const total = getValue(symbol.trim()) * count;

    // check their available funds, if the price exceeds their amount, must alert user and return
    if(total > userBalance) {
      // TODO create modal and alert user they're broke

      return;
    }

    userBalance -= total;

    // adjust the count if they already have some of those stocks
    if(stocksList[symbol] === undefined || stocksList[symbol] === null)
      stocksList[symbol] += count;
    // add the stock to the list if it does not exist in the list
    else
      stocksList[symbol] = count;

    writeToLocalStorage();

  }

  function sell(symbol, count) {
    // if count < 1, notify & return
    if(count <= 0) {
      // TODO: notify the user
      return;
    }
    if(stockList[symbol] === null || stockList[symbol] === undefined) {
      // TODO: notify the user
      return;
    }
    // if there is an appropriate number of stocks specified
    else if(stockList[symbol] > 0 && stockList[symbol] <= count) {
      stockList[symbol] -= count;
      userBalance += getValue(symbol) * count;
    }
    // if there is an inappropriate number of stocks ( < 0 or > available)
    else
      // TODO: notify the user
      return;

  }

  function writeToLocalStorage() {
    localStorage.setItem('stonks', JSON.stringify({'balance' : userBalance,
        'stonkList' : stocksList}));
  }

  // return the current value of a stock
  function getValue(symbol) {

    const url = `https://api.twelvedata.com/price?symbol=${symbol}&apikey=${api}`;

    const settings = {
      "async" : true,
      "crossDomain" : true,
      "url" : url,
      "method" : "GET"
    }

    $.ajax(settings).then(function(response) {

      return parseFloat(response.price);

    });

  }


  // twelvedata api key
  // 885e1189903c4121bb6d6fdd11a43d2d

  // alphavantage api key
  //7FIN2ZW34TALB8CQ
