var ctx = document.getElementById('myChart').getContext('2d');
var myChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
        datasets: [{
            fill: false,
            label: 'S&P 500',
            data: [12, 19, 3, 5, 2, 3],
            rgba(255, 159, 64, 0.2)'
            borderColor: [
                'green'
            ],
            borderWidth: 2
        },
        {
            fill: false,
            label: 'DOW',
            data: [20, 9, 13, 8, 21, 3],
            borderColor: [
                'red'
            ],
            borderWidth: 2
        },
        {
            fill: false,
            label: 'NASDAQ',
            data: [3, 9, 3, 8, 21, 3],
            borderColor: [
                'blue'
            ],
            borderWidth: 2
        },

      ]
    },

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
