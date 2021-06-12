import {Injectable} from '@angular/core';
import {generate, interval, Observable, of, timer} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';

@Injectable({providedIn: 'root'})
export class SmeltingService {

  fakeEvents = []

  counter = 0;
  expectedHeatlossValue = 50;

  fakers = [
    {
      parameter: 'Prędkość podmuchu',
      min: 40,
      max: 70,
      maxDelta: 2,
      unit: 'm/s'
    },
    {
      parameter: 'Intensywność SPD',
      min: 1300,
      max: 3500,
      maxDelta: 80,
      unit: 'Nm^3/h'
    },
    {
      parameter: 'Stężenie tlenu',
      min: 65,
      max: 81,
      maxDelta: 0.8,
      unit: '%'
    },
  ]

  state: SmeltingState = {
    airVelocity: 52,
    oxygenPercentage: 49,
    airStreamIntensity: 2150,
  }

  constructor(private httpClient: HttpClient) {
    for (let i = 0; i < 10; i++) {
      this.fakeEvents.push(this.generateFakeEvent())
    }
  }

  changeExpectedValue(newValue: number) {
    if (environment.production) {
      this.httpClient.post('https://cors-anywhere.herokuapp.com/http://34.105.241.43:2137/expectedValue', {
        value: newValue
      }).subscribe(() => {
        console.log('Value changed')
      })
    }
    this.expectedHeatlossValue = newValue;
  }


  getSmeltingEvents(): Observable<SmeltingEvent[]> {
    return timer(0, 2000).pipe(
      map(() => {
        this.updateFakeEvents()
        return this.fakeEvents
      })
    )
  }


  getHeatlossEvent(): Observable<HeatlossState> {
    if (environment.production) {
      return timer(0, 500).pipe(
        switchMap(() => {
            return this.httpClient.get<HeatlossState>('https://cors-anywhere.herokuapp.com/http://34.105.241.43:2137/current', {responseType: 'json'})
          }
        )
      )
    } else {
      return timer(0, 500).pipe(
        map(() => {
          this.counter += 1;
          return {
            total: (Math.sin(this.counter * 40) * 30 + Math.cos(this.counter * 10) * 30 + this.expectedHeatlossValue),
            s100: (Math.sin(this.counter * 40) * 30 + Math.cos(this.counter * 10) * 30 + this.expectedHeatlossValue),
            s200: (Math.sin(this.counter * 40) * 30 + Math.cos(this.counter * 10) * 30 + this.expectedHeatlossValue),
            s300: (Math.sin(this.counter * 40) * 30 + Math.cos(this.counter * 10) * 30 + this.expectedHeatlossValue),
            s400: (Math.sin(this.counter * 40) * 30 + Math.cos(this.counter * 10) * 30 + this.expectedHeatlossValue),
            s500: (Math.sin(this.counter * 40) * 30 + Math.cos(this.counter * 10) * 30 + this.expectedHeatlossValue),
            s600: (Math.sin(this.counter * 40) * 30 + Math.cos(this.counter * 10) * 30 + this.expectedHeatlossValue)
          }
        })
      )
    }
  }

  private updateFakeEvents() {
    this.fakeEvents.pop()
    this.fakeEvents.unshift(this.generateFakeEvent())
  }

  private generateFakeEvent() {
    const item = this.fakers[Math.floor(Math.random() * this.fakers.length)];
    const delta = (Math.random() * item.maxDelta);
    const deltaString = (Math.random() >= 0.5 ? '+' : '-') + delta.toFixed(2).toString() + ' ' + item.unit;
    let min = 0;
    if (item.parameter === 'Prędkość podmuchu') {
      min = this.state.airVelocity;
    } else if (item.parameter === 'Intensywność SPD') {
      min = this.state.airStreamIntensity;
    } else {
      min = this.state.oxygenPercentage;
    }
    const minString = min.toFixed(2).toString() + ' ' + item.unit;
    const max = delta >= (item.maxDelta / 2) ? min + delta : min - delta;
    const maxString = max.toFixed(2).toString() + ' ' + item.unit;
    if (item.parameter === 'Prędkość podmuchu') {
      this.state.airVelocity = max;
    } else if (item.parameter === 'Intensywność SPD') {
      this.state.airStreamIntensity = max;
    } else {
      this.state.oxygenPercentage = max;
    }
    return {
      parameter: item.parameter,
      date: new Date().toLocaleString(),
      oldValue: minString,
      newValue: maxString,
      delta: deltaString,
    }
  }
}


export interface SmeltingEvent {
  parameter: string
  date: string
  oldValue: string
  newValue: string
  delta: string
}

export interface SmeltingState {
  airVelocity: number;
  oxygenPercentage: number;
  airStreamIntensity: number;
}


export interface HeatlossState {
  total: number;
  s100: number;
  s200: number;
  s300: number;
  s400: number;
  s500: number;
  s600: number;
}
