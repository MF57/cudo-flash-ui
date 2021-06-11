import {Injectable} from '@angular/core';
import {generate, interval, Observable, of, timer} from 'rxjs';
import {map} from 'rxjs/operators';

@Injectable({providedIn: 'root'})
export class SmeltingService {

  fakeEvents = []

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

  constructor() {
    for (let i = 0; i < 10; i++) {
      this.fakeEvents.push(this.generateFakeEvent())
    }
  }


  getSmeltingEvents(): Observable<SmeltingEvent[]> {
    return timer(0, 2000).pipe(
      map(() => {
        this.updateFakeEvents()
        return this.fakeEvents
      })
    )
  }

  private updateFakeEvents() {
    this.fakeEvents.pop()
    this.fakeEvents.unshift(this.generateFakeEvent())
  }

  private generateFakeEvent() {
    const item = this.fakers[Math.floor(Math.random() * this.fakers.length)];
    const delta = (Math.random()*item.maxDelta);
    const deltaString = (Math.random() >= 0.5 ? '+' : '-') + delta.toFixed(2).toString() + ' ' + item.unit;
    let min = 0;
    if (item.parameter === "Prędkość podmuchu") {
      min = this.state.airVelocity;
    } else if (item.parameter === "Intensywność SPD") {
      min = this.state.airStreamIntensity;
    } else {
      min = this.state.oxygenPercentage;
    }
    const minString =  min.toFixed(2).toString() + ' ' + item.unit;
    const max = delta >= (item.maxDelta/2) ? min + delta : min - delta;
    const maxString = max.toFixed(2).toString() + ' ' + item.unit;
    if (item.parameter === "Prędkość podmuchu") {
      this.state.airVelocity = max;
    } else if (item.parameter === "Intensywność SPD") {
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
