
  function getIndexes() {
    const api = '885e1189903c4121bb6d6fdd11a43d2d';

    const symbols = ['DJI', 'SPX', 'IXIC'];
    const chartData = [];

    // "url": `https://twelvedata.p.rapidapi.com/bbands?sd=2&outputsize=24&series_type=close&ma_type=SMA&time_period=20&symbol=${symbol}&interval=1day&apikey=${api}`,


    symbols.forEach(symbol => {
      // const settings = {
      // 	"async": true,
      // 	"crossDomain": true,
      // 	"url": `https://twelvedata.p.rapidapi.com/bbands?outputsize=24&symbol=${symbol}&interval=1week&apikey=${api}`,
      // 	"method": "GET",
      // 	"headers": {
      // 		"x-rapidapi-host": "twelvedata.p.rapidapi.com",
      // 		"x-rapidapi-key": "d087c8eb1fmsh4556820e86d6313p134de0jsn55cd89f11097"
      // 	}
      // }

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
  //    data : [dataset, same length as dates]}]

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
              // TODO populate x axis with every 20th date, with the origin being 100 days ago
          }
      }
    });
  }


  // twelvedata api key
  // 885e1189903c4121bb6d6fdd11a43d2d

  // alphavantage api key
  //7FIN2ZW34TALB8CQ

//   const api = '885e1189903c4121bb6d6fdd11a43d2d';
//   const symbols = ['DJI', 'GSPC', 'IXIC'];
//   let chartData = [];
//
//   // get each of the major 3 indexes' quotes for the past 100 days
//   for(let i = 0; i < 3; i++) {
//     const url = 'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=' + symbols[i] + '&outputsize=compact&apikey=' + api;
//
//
//     $.ajax({url, 'Access-Control-Allow-Origin': '*'})
//       .then(function(response)  {
//           console.log(response);
//           console.log(symbols[i]);
//
//           const symbol = response["Meta Data"]["2. Symbol"];
//           // console.log('Symbol: ' + symbol);
//           const dailyData = response["Time Series (Daily)"];
//           // console.log(dailyData);
//
          // // returns all keys in an array in the chronological order starting from today to today - 99 days
          // const dates = Object.keys(dailyData);
          // // console.log('Dates: ' + dates);
          //
          // // build data into the right format, store in list, then create a chart
          // chartData.push({
          //   symbol : symbol,
          //   dates: dates,
          //   data : dailyData
          // });
//
//           // buildChart(chartData);
//
//         });
//       }
//       console.log(chartData);
//
// });
//
