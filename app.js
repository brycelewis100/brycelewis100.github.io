'use strict';

// Define UI variables
const inputForm = document.querySelector('.input-form');
const feetInput = document.querySelector('#feet'); // need to convert to number
const inchesInput = document.querySelector('#inches'); // need to convert to number

const chartStartInput = document.querySelector('#chart-range-start');
const chartEndInput = document.querySelector('#chart-range-end');

const massInput = document.querySelector('#mass');
const avgPowerInput = document.querySelector('#avg-power');
const submitBtn = document.querySelector('#submit');
const avgSpeedOutput = document.querySelector('#avg-speed');
const cdaOutput = document.querySelector('#cda');

// Define constants
const r = 1.3; // air density
const cr = 0.007; //rolling coefficient
const g = 9.8; // Gravity
const eta = 0.93; // Efficiency

//Load Event Listeners

function loadEventListeners() {
  inputForm.addEventListener('submit', submitForm);
}

loadEventListeners();

class DataPoint {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

// Submit Form

function submitForm(e) {
  generateSpeedVsWatts(e);
  // generateForceChart(e);
}

function generateSpeedVsWatts(e) {
  // Calculate constants
  const height =
    0.0254 * (Number(feetInput.value) * 12 + Number(inchesInput.value));
  const m = (Number(massInput.value) + 25) * 0.453592;
  const cda = 0.7 * (0.18964 * height + 0.00215 * m - 0.07861); // Austrailian institute of sport

  const A = (cr * m * g) / eta;
  const B = (r * cda) / 2 / eta;

  // Instantiate Variables
  let V = 0; //velocity
  let P = 0; //Power
  let avgSpeed;
  const newData = [];
  let vMax = 0;
  let vMin = 0;

  // Solve for Velocity
  while (P <= chartEndInput.value - 1) {
    P = B * Math.pow(V, 3) + A * V;

    if (P >= chartStartInput.value - 1) {
      // Create X,Y Object for each point for charting
      const dataPoint = new DataPoint(P, V * 2.23694);
      newData.push(dataPoint);

      // solve for the desired average speed
      if (P <= avgPowerInput.value) {
        avgSpeed = V;
      }
    }
    V = V + 0.01;
  }

  if (avgSpeed === undefined) {
    alert('Average power must lie in the Chart Range');
  }

  // Convert m/s to mph
  V = avgSpeed * 2.23694;
  avgSpeedOutput.value = V.toFixed(2);

  // CDA
  cdaOutput.value = cda.toFixed(3);

  // Charting Power vs Speed
  var ctx = document.getElementById('myChart');

  var myChart = new Chart(ctx, {
    type: 'scatter',
    data: {
      datasets: [
        {
          data: [{ x: avgPowerInput.value, y: V }],
          pointRadius: 5,
          pointBackgroundColor: 'black',
        },
        {
          pointRadius: 0,

          backgroundColor: '#ffcccb',
          backgroundOpacity: 0.3,
          showLine: true,
          borderColor: 'red',
          data: newData,
        },
      ],
    },

    options: {
      responsive: true,
      maintainAspectRatio: false,
      hover: {
        animationDuration: 0,
      },
      tooltip: {
        enabled: false,
      },
      legend: {
        display: false,
      },
      scales: {
        xAxes: [
          {
            scaleLabel: {
              display: true,
              labelString: 'Power (watts)',
            },
            type: 'linear',
            position: 'bottom',
            labelString: 'Power',
            ticks: {
              stepSize: 5,
            },
          },
        ],
        yAxes: [
          {
            scaleLabel: {
              display: true,
              labelString: 'Estimated Speed (mph)',
            },
            type: 'linear',
            ticks: {
              stepSize: 1,
            },
          },
        ],
      },
    },
  });

  // Generate Force Chart

  // Access min and max V values
  vMin = newData[0].y;
  vMax = newData[newData.length - 1].y;

  const rollingDataSet = [];
  let windDataSet = [];
  V = vMin / 2.23694;
  while (V <= vMax / 2.23694) {
    let fRolling = cr * m * g * V;
    let fWind = 0.5 * r * cda * Math.pow(V, 3);

    const rollingData = new DataPoint(V * 2.23694, fRolling);
    rollingDataSet.push(rollingData);

    const windData = new DataPoint(V * 2.23694, fWind);
    windDataSet.push(windData);

    V = V + 0.1;
  }

  // Charting
  var ctx = document.getElementById('forceChart');
  var forceChart = new Chart(ctx, {
    type: 'scatter',
    data: {
      datasets: [
        {
          pointRadius: 0,
          label: 'Rolling Resistance',
          backgroundColor: '#ffcccb',
          backgroundOpacity: 0.3,
          showLine: true,
          borderColor: 'red',
          fill: false,
          data: rollingDataSet,
        },
        {
          pointRadius: 0,
          label: 'Aerodynamic Drag',
          backgroundColor: '#ffcccb',
          backgroundOpacity: 0.3,
          showLine: true,
          borderColor: 'blue',
          fill: false,
          data: windDataSet,
        },
      ],
    },

    options: {
      responsive: true,
      maintainAspectRatio: false,
      hover: {
        animationDuration: 0,
      },
      tooltip: {
        enabled: false,
      },
      legend: {
        display: true,
      },
      scales: {
        xAxes: [
          {
            scaleLabel: {
              display: true,
              labelString: 'Speed(mph))',
            },
            type: 'linear',
            position: 'bottom',
            labelString: 'Power',
            ticks: {
              minStepSize: 1,
            },
          },
        ],
        yAxes: [
          {
            scaleLabel: {
              display: true,
              labelString: 'Drag Force (N)',
            },
            type: 'linear',
            ticks: {
              stepSize: 20,
            },
          },
        ],
      },
    },
  });

  e.preventDefault();
}
