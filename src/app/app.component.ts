import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ɵɵclassMap } from '@angular/core';
import { interval, Observable, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  apiKey_: string = 'yrQCRzHx7vDSvo7ygZCCax1ZeZ07b4pV';

  set apiKey(key: string) {
    this.apiKey_ = key;
    this.setObservables();
  }

  get apiKey(): string {
    return this.apiKey_;
  }
  title = 'enes100';

  isHardwareConnected: Observable<boolean>;
  peopleCount: Observable<string>;

  hardwareConnectionError: string;
  peopleCountError: string;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.setObservables();
  }

  setObservables(): void {
    console.log('resetting observables');
    this.isHardwareConnected = this.http.get(`http://blynk-cloud.com/${this.apiKey}/isHardwareConnected`).pipe(
      map(response => {
        this.hardwareConnectionError = undefined;
        return response as any as boolean;
      }),
      catchError(_ => {
        this.hardwareConnectionError = 'Bad request (hardware connection) - check api key';
        return of(false);
      })
    );
    this.peopleCount = this.isHardwareConnected.pipe(
      switchMap((response) => {
        if (response) {
          return interval(1000).pipe(
            switchMap(_ => {
              return this.http.get(`http://blynk-cloud.com/${this.apiKey}/get/V0`).pipe(
                map(count => {
                  console.log('received');
                  this.peopleCountError = undefined;
                  return count as unknown as string;
                }),
                catchError(_ => {
                  this.peopleCountError = 'Bad request (people count)';
                  return of('0');
                })
              );
            })
          );
        } else {
          return of('unknown');
        }
      })
    );
  }
}
