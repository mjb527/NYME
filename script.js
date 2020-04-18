
// Author: Matthew Batko
// https://github.com/mjb527

const api = '885e1189903c4121bb6d6fdd11a43d2d';
const api2 = '6099a928390345399a37d357988f72ac';
const api3 = '7e4c5400cadd4b7ba8be1cae1b6454a4';
const api4 = '3c7e3b085d96493cb29445d7ce287c35';

let userBalance = 0;
let stocksList;



  function getIndexes() {

    const table = $('#table');
    // create table header
    const thead = $('<thead>')
    table.append(thead);
    const headerRow = $('<tr>');
    thead.append(headerRow);

    const symbols = ['DJI', 'SPX', 'IXIC'];
    const chartData = [];
    let hasDates = false;

    symbols.forEach(symbol => {

      const settings = {
        "async" : true,
        "crossDomain" : true,
        "url" : `https://api.twelvedata.com/time_series?symbol=${symbol}&outputsize=24&interval=1week&apikey=${api}`,
        "method" : "GET"
      }

      $.ajax(settings).then(function (response) {

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

        // create table header
        if(!hasDates) {
          const firstObjValue = response[Object.keys(response)[0]].values;
          $.each(firstObjValue, function(index, x) {
            dates.push(x.datetime);
          });
          const headerRow = $('<tr>');
          // top left corner
          headerRow.append('<th>');
          dates.forEach((date) => {
            headerRow.append(`<th>${date}</th>`);
          });
          table.append(headerRow);
          hasDates = true;
        }
        const tbody = $('<tbody>');
        table.append(tbody);

        const row = $('<tr>');
        row.append(`<th>${label}</th>`);
        $.each(response.values, function(index, value) {
          // value will be the value for each key (index)

          // formattedData.label = value.meta.symbol;
          // formattedData.data = [];
          // formattedData.dates = dates;

          // value.values is each data point's json with datetime, high, low, etc.
          row.append(`<td>Open: ${parseInt(value.open).toFixed(3)}<br>Close: ${parseInt(value.close).toFixed(3)}<br>High: ${parseInt(value.high).toFixed(3)}</td>`);
          row.css('font-size', '10px');

        });

          tbody.append(row);

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

    const ctx = document.querySelector('#canvas').getContext('2d');
    $('#canvas').addClass('bg-light');
    ctx.canvas.width = 300;
    ctx.canvas.height = 500;
    const myChart = new Chart(ctx, {
        type: 'line',
        data: processedData,
        options: {
          // sizng components
          responsive: true,
          maintainAspectRatio: false,

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

  function getQuotes(event) {
    // reset table
    $('#table').empty();
    // reset chart
    $('#canvas').remove();
    $('#canvas-div').html(`<canvas id="canvas" class="outline rounded p-2"  width="300" height="300"></canvas>`);


    // comma delimited list of symbols to query the api
    // add comma to adjust the return json so it's consistent
    const symbols = $('#input').val().trim()+',';
    // make sure the list is comma delimited and not spaces
    symbols.replace(/ /g, ',');
    let outputsize = '';
    let interval = '';

    const checked = $("form input[type='radio']:checked").val();
    console.log(checked);

    // 1 day, hour by hour, 3 days, every 3 hours, 1 week, daily, 1 month daily
    if(checked === 'oneDay') {
      console.log('checked');
        outputsize = '24';
        interval = '1h'
    }
    else if(checked === 'oneWeek') {
      outputsize = '7';
      interval = '1day';
    }
    else if(checked === "twoWeek") {
      outputsize = '14';
      interval = '1day';
    }
    else if(checked === "oneMonth") {
      console.log("one month");
      outputsize = '30';
      interval = '1day';
    }
    else if(checked === "#threeMonth") {
      outputsize = '12';
      interval = '1week';
    }
    else if(checked === "#oneYear") {
      outputsize = '52';
      interval = '1week';
    }
    // 6 month
    else {
      outputsize = '24';
      interval = '1week';
    }

    const canvas = $('#canvas');
    canvas.removeAttr('class');

    const settings = {
      "async" : true,
      "crossDomain" : true,
      "url" : `https://api.twelvedata.com/time_series?symbol=${symbols}&outputsize=${outputsize}&interval=${interval}&apikey=${api2}`,
      "method" : "GET"
    }


    $.ajax(settings).then(function (response) {
      chartData = [];

      // dates for the table
      const dates = [];
      // populate dates array
      const firstObjValue = response[Object.keys(response)[0]].values;
      $.each(firstObjValue, function(index, x) {
        dates.push(x.datetime);
      });

      // get the table
      const table = $('#table');
      // create table header
      const thead = $('<thead>')
      table.append(thead);
      const headerRow = $('<tr>');
      thead.append(headerRow);

      // top left corner
      headerRow.append('<th>')
      dates.forEach((date) => {
        headerRow.append(`<th>${date}</th>`);
      });
      table.append(headerRow);

      const tbody = $('<tbody>');
      table.append(tbody);

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
          row.append(`<td>Open: ${parseInt(data.open).toFixed(3)}<br>Close: ${parseInt(data.close).toFixed(3)}<br>High: ${parseInt(data.high).toFixed(3)}</td>`);

        });
        chartData.push(formattedData);
        tbody.append(row);

      });
      buildChart(chartData);

    });

  }

  // on load, run this so we always have an account set up
  function setProfile() {

    // if no account exists, create an account with $2500
    if(localStorage.getItem('stonks') === null || localStorage.getItem('stonks') === undefined) {
      let stonks = {};
      stonks.balance = 2500;
      stonks.stonkList = {};
      stonks.total = 2500;

      // add to localStorage
      localStorage.setItem('stonks', JSON.stringify(stonks));
    }
  }

  function getProfile() {
    // get list of their stocks
    $('#profile-body').addClass('text-white');
    const stonks = JSON.parse(localStorage.getItem('stonks'));
    console.log("balance " + stonks.balance);
    userBalance = stonks.balance;
    stocksList = stonks.stonkList;
    // TODO set total
    let total = 0;
    const keys = Object.keys(stocksList).toString();

    // query the list of the stock symbols
    const url = `https://api.twelvedata.com/price?symbol=${keys}&apikey=${api3}`;

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

      // if the object key is not 'balance'
      $.each(data, function(index, value) {
          if(index !== 'balance')
            total += parseFloat(value.worth);
        });

      total += parseInt(data.balance);
      console.log(stocksList);

      $('#profile-body').html(`
        <div class="modal-body text-dark">
          <div id="profile-balance" class='my-2'>Your Balance: ${userBalance.toFixed(2)}</div>
          <div id="profile-stocks" class='my-2'>Stocks:
            <ul id="profile-stocks-ul"></ul>
          </div>
          <div id="profile-total" class='my-2'>Total: ${total.toFixed(2)}</div>
        </div>`);
        $('#profile-body').removeClass('text-white')

      // do with data what we must - add to page somewhere
      if(Object.keys(stocksList).length === 0)
        $("#profile-stocks-ul").append(`<li>None</li>`);
      else {
        $.each(stocksList, function(index, value) {
          $("#profile-stocks-ul").append(`<li>${index}: ${value}</li>`);

        });
      }

    });

  }

  function addStockValue(stocksList, wallet, stockPrices) {
    let price = -1;

    // the json changes if we have just 1 stock, this compensates for it
    if(Object.keys(stockPrices).length === 1) price = stockPrices.price;

    const formattedData = {balance: wallet};
    // calculates the value of the number of stocks per price
    $.each(stocksList, function(index, value) {
      if(price === -1)
        price = stockPrices[index].price;
      formattedData[index] = {price: price,
                              count: value,
                              worth: value * price }
      console.log(formattedData);
      formattedData.balance += value * price;
    });
    formattedData.balance = formattedData.balance.toFixed(2);
    return formattedData;
  }

  async function purchase(symbol, count) {
    count = parseInt(count);
    symbol = symbol.toUpperCase();
    // can't be 0 or negative
    if(count < 1) {
      $('#buy-modal').modal('hide');
      $('#error-body').html(`
        <span>Be sure you're trying to buy at least one stock!</span>`);
      $('#error-modal').modal('show');
      return;
    }

    // call api to get the current stock price for that symbol
    const total = await getValue(symbol) * count;

    // check their available funds, if the price exceeds their amount, must alert user and return
    if(total > userBalance) {
      $('#buy-modal').modal('hide');
      $('#error-body').html(`
        <span>The cost of your purchase exceeded your funds!</span>`);
      $('#error-modal').modal('show');
      return;
    }

    userBalance -= total;
    console.log(userBalance);

    // adjust the count if they already have some of those stocks
    console.log(symbol + " " + count);
    console.log(stocksList);
    if(stocksList[symbol] === undefined || stocksList[symbol] === null)
      stocksList[symbol] = count;
    // add the stock to the list if it does not exist in the list
    else
      stocksList[symbol] += count;

    writeToLocalStorage();

  }

  function buildSelect() {
    $('#sellDropdown').empty();
    $('#sellDropdown').append('<option>Select Symbol</option>')
    $.each(stocksList, function(index, value) {
      $('#sellDropdown').append(`<option>${index}</option>`);
    });
  }

  async function sell(symbol, count) {

    if(symbol === 'Select Symbol') {
      $('#sell-modal').modal('hide');
      $('#error-body').html(`
        <span>Please select a stock!</span>`);
      $('#error-modal').modal('show');
      return;
    }

    // if count < 1, notify & return
    if(count < 1) {
      $('#sell-modal').modal('hide');
      $('#error-body').html(`
        <span>Please select a positive number!</span>`);
      $('#error-modal').modal('show');
      return;
    }
    if(stocksList[symbol] === null || stocksList[symbol] === undefined) {
      console.log(symbol);
      $('#sell-modal').modal('hide');
      $('#error-body').html(`
        <span>You seem to not own any of that stock!</span>`);
      $('#error-modal').modal('show');
      return;
    }
    // if there is an appropriate number of stocks specified
    else if(stocksList[symbol] > 0 && stocksList[symbol] <= count) {
      console.log(symbol);
      stocksList[symbol] -= count;
      if(stocksList[symbol] === 0) delete stocksList[symbol];
      userBalance += await getValue(symbol) * count;

      writeToLocalStorage();
    }
    // if the amount specified > available)
    else {
      $('#sell-modal').modal('hide');
      $('#error-body').html(`
        <span>The number you selected exceeds the number you own!</span>`);
      $('#error-modal').modal('show');
      return;
    }

  }

  function writeToLocalStorage() {
    console.log(userBalance);
    console.log(stocksList);
    localStorage.setItem('stonks', JSON.stringify({'balance' : userBalance,
        'stonkList' : stocksList}));
  }

  // return the current value of a stock
  function getValue(symbol) {

    const url = `https://api.twelvedata.com/price?symbol=${symbol}&apikey=${api4}`;

    const settings = {
      "async" : true,
      "crossDomain" : true,
      "url" : url,
      "method" : "GET"
    }

    return new Promise(resolve => {
        $.ajax(settings).then(function(response) {
          console.log('getValue');
          console.log(response);
          console.log(parseFloat(response.price));
          resolve(parseFloat(response.price));
    } )});

  }


  // twelvedata api key
  // 885e1189903c4121bb6d6fdd11a43d2d

  // alphavantage api key
  //7FIN2ZW34TALB8CQ
