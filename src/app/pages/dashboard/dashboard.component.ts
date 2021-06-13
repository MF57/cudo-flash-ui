import { Component, OnInit } from '@angular/core';
import Chart from 'chart.js';
import {HeatlossState, SmeltingEvent, SmeltingService, SmeltingState} from './smelting.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: 'dashboard.component.html',
  styleUrls: ['dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  public canvas : any;
  public ctx;
  public datasets: any;
  public myChartData;
  public clicked = true;
  public clicked1 = false;
  public clicked2 = false;
  public chart_labels = [];
  public chartData = [];
  public expectedValueChartData = []



  events: SmeltingEvent[] = []
  state: SmeltingState = {
    airVelocity: 52,
    oxygenPercentage: 49,
    airStreamIntensity: 2150,
  }

  deltaState: any = {
    airVelocity: '',
    oxygenPercentage: '',
    airStreamIntensity: '',
  }

  airVelocityChanged = false;
  oxygenPercentageChanged = false;
  airStreamIntensityChanged = false;
  heatLossChanged = false;

  initialized = false;

  expectedValue = 22;
  tmpExpectedValue = this.expectedValue;
  expectedValueEdit = false;

  heatlossState: HeatlossState;

  constructor(private smeltingService: SmeltingService) {}

  ngOnInit() {

    this.smeltingService.getHeatlossState().subscribe(state => {
      if (!!state) {
        this.heatlossState = state;
        this.addToChart(state.total);
        this.myChartData.update();
      }
    })

    this.smeltingService.getSmeltingState().subscribe(state => {
      this.airVelocityChanged = false;
      this.oxygenPercentageChanged = false;
      this.airStreamIntensityChanged = false;
      if (this.state.airVelocity.toFixed(2) !== state.airVelocity.toFixed(2)) {
        const sign = this.state.airVelocity < state.airVelocity ? '+' : '-';
        const delta = sign + Math.abs(this.state.airVelocity - state.airVelocity).toFixed(2) + ' m/s';
        this.deltaState.airVelocity = delta
        this.airVelocityChanged = true;
        if(this.events.length > 100) {
          this.events.pop()
        }
        this.events.unshift({
          parameter: "Prędkość podmuchu",
          date: new Date().toLocaleString(),
          oldValue: this.state.airVelocity.toFixed(2),
          newValue: state.airVelocity.toFixed(2),
          delta: delta
        })
      }
      if (this.state.airStreamIntensity.toFixed(2) !== state.airStreamIntensity.toFixed(2)) {
        const sign = this.state.airStreamIntensity < state.airStreamIntensity ? '+' : '-';
        const delta = sign + Math.abs(this.state.airStreamIntensity - state.airStreamIntensity).toFixed(2) + ' Nm^3/h'
        this.deltaState.airStreamIntensity = delta
        this.airStreamIntensityChanged = true;
        if(this.events.length > 100) {
          this.events.pop()
        }
        this.events.unshift({
          parameter: "Intensywność SPD",
          date: new Date().toLocaleString(),
          oldValue: this.state.airStreamIntensity.toFixed(2),
          newValue: state.airStreamIntensity.toFixed(2),
          delta: delta
        })
      }
      if (this.state.oxygenPercentage.toFixed(2) !== state.oxygenPercentage.toFixed(2)) {
        const sign = this.state.oxygenPercentage < state.oxygenPercentage ? '+' : '-';
        const delta = sign + Math.abs(this.state.oxygenPercentage - state.oxygenPercentage).toFixed(2) + ' %'
        this.deltaState.oxygenPercentage = delta
        this.oxygenPercentageChanged = true;
        if(this.events.length > 100) {
          this.events.pop()
        }
        this.events.unshift({
          parameter: "Stężenie tlenu",
          date: new Date().toLocaleString(),
          oldValue: this.state.oxygenPercentage.toFixed(2),
          newValue: state.oxygenPercentage.toFixed(2),
          delta: delta
        })
      }
      this.state = state;
    })



    const gradientChartOptionsConfigurationWithTooltipRed: any = {
      maintainAspectRatio: false,
      legend: {
        display: false
      },

      tooltips: {
        backgroundColor: '#f5f5f5',
        titleFontColor: '#333',
        bodyFontColor: '#666',
        bodySpacing: 4,
        xPadding: 12,
        mode: 'nearest',
        intersect: 0,
        position: 'nearest'
      },
      responsive: true,
      scales: {
        yAxes: [{
          barPercentage: 1.6,
          gridLines: {
            drawBorder: false,
            color: 'rgba(29,140,248,0.0)',
            zeroLineColor: 'transparent',
          },
          ticks: {
            suggestedMin: 20,
            suggestedMax: 30,
            padding: 20,
            fontColor: '#9a9a9a'
          }
        }],
        xAxes: [{
          barPercentage: 1.6,
          gridLines: {
            drawBorder: false,
            color: 'rgba(233,32,16,0.1)',
            zeroLineColor: 'transparent',
          },
          ticks: {
            padding: 20,
            fontColor: '#9a9a9a'
          }
        }]
      }
    };

    this.canvas = document.getElementById('chartBig1');
    this.ctx = this.canvas.getContext('2d');

    const gradientStroke = this.ctx.createLinearGradient(0, 230, 0, 50);

    gradientStroke.addColorStop(1, 'rgba(233,32,16,0.2)');
    gradientStroke.addColorStop(0.4, 'rgba(233,32,16,0.0)');
    gradientStroke.addColorStop(0, 'rgba(233,32,16,0)'); // red colors




    const config = {
      type: 'line',
      data: {
        labels: this.chart_labels,
        datasets: [{
          label: 'Strata Cieplna [MW]',
          fill: true,
          backgroundColor: gradientStroke,
          borderColor: '#ec250d',
          borderWidth: 2,
          borderDash: [],
          borderDashOffset: 0.0,
          pointBackgroundColor: '#ec250d',
          pointBorderColor: 'rgba(255,255,255,0)',
          pointHoverBackgroundColor: '#ec250d',
          pointBorderWidth: 20,
          pointHoverRadius: 4,
          pointHoverBorderWidth: 15,
          pointRadius: 4,
          data: this.chartData,
        },
          {
            label: 'Wartość zadana',
            fill: true,
            borderColor: '#0040ff',
            borderWidth: 2,
            borderDash: [10,5],
            borderDashOffset: 0.0,
            pointBackgroundColor: '#0361d0',
            pointBorderColor: 'rgba(255,255,255,0)',
            pointHoverBackgroundColor: '#0d23ec',
            pointBorderWidth: 20,
            pointHoverRadius: 4,
            pointHoverBorderWidth: 15,
            pointRadius: 4,
            data: this.expectedValueChartData,
          }
        ]
      },
      options: gradientChartOptionsConfigurationWithTooltipRed
    };
    this.myChartData = new Chart(this.ctx, config);
  }

  public updateOptions() {
    this.myChartData.data.datasets[0].data = this.chartData;
    this.myChartData.update();
  }

  public getDeltaClass(delta: string) {
    if (delta.startsWith('+')) {
      return 'plus'
    } else if (delta.startsWith('-')) {
      return 'minus'
    } else {
      return ''
    }
  }


  private addToChart(value: number) {
    this.chartData.push(value.toFixed(2))
    this.expectedValueChartData.push(this.expectedValue);
    this.chart_labels.push(new Date().toLocaleTimeString())
    if (this.chart_labels.length > 20) {
      this.chartData.shift();
      this.chart_labels.shift();
      this.expectedValueChartData.shift();
    }
  }

  editExpectedValue() {
    this.tmpExpectedValue = this.expectedValue;
    this.expectedValueEdit = true;
  }

  confirmExpectedValue() {
    this.expectedValue = +this.tmpExpectedValue;
    this.smeltingService.changeExpectedValue(this.expectedValue);
    this.expectedValueEdit = false;
  }

  start() {
    this.smeltingService.start();
  }

  stop() {
    this.smeltingService.stop();
  }
}
