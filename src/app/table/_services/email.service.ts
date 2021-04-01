
/* tslint:disable:variable-name */

import { DatePipe } from '@angular/common';
import { Injectable, PipeTransform } from '@angular/core';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { debounceTime, delay, switchMap, tap } from 'rxjs/operators';
import * as email from '../../../data/email.json';
import { SortDirection } from '../_directives/sortable.directive';
import { Email } from '../_model/email';

interface SearchResult {
  emails: Email[];
  total: number;
}

interface State {
  page: number;
  pageSize: number;
  searchTerm: string;
  sortColumn: string;
  sortDirection: SortDirection;
}

@Injectable()
export class EmailService {
  private _loading$ = new BehaviorSubject<boolean>(true);
  private _search$ = new Subject<void>();
  private _emails$ = new BehaviorSubject<Email[]>([]);
  private _total$ = new BehaviorSubject<number>(0);

  private _state: State = {
    page: 1,
    pageSize: 5,
    searchTerm: '',
    sortColumn: '',
    sortDirection: ''
  };

  constructor(private pipe: DatePipe) {
    this._search$
      .pipe(
        tap(() => this._loading$.next(true)),
        debounceTime(200),
        switchMap(() => this._search()),
        delay(200),
        tap(() => this._loading$.next(false))
      )
      .subscribe(result => {
        this._emails$.next(result.emails);
        this._total$.next(result.total);
      });

    this._search$.next();
  }

  get emails$(): Observable<Email[]> {
    return this._emails$.asObservable();
  }
  get total$(): Observable<number> {
    return this._total$.asObservable();
  }
  get loading$(): Observable<boolean> {
    return this._loading$.asObservable();
  }
  get page(): number {
    return this._state.page;
  }
  set page(page: number) {
    this._set({ page });
  }
  get pageSize(): number {
    return this._state.pageSize;
  }
  set pageSize(pageSize: number) {
    this._set({ pageSize });
  }
  get searchTerm(): string {
    return this._state.searchTerm;
  }
  set searchTerm(searchTerm: string) {
    this._set({ searchTerm });
  }

  set sortColumn(sortColumn: string) {
    this._set({ sortColumn });
  }
  set sortDirection(sortDirection: SortDirection) {
    this._set({ sortDirection });
  }

  // tslint:disable-next-line: typedef
  private _set(patch: Partial<State>) {
    Object.assign(this._state, patch);
    this._search$.next();
  }

  private _getEmailData(): Email[] {
    return (email as any).default;
  }

  private _compare(v1, v2): number {
    return v1 < v2 ? -1 : v1 > v2 ? 1 : 0;
  }

  private _sort(emails: Email[], column: string, direction: string): Email[] {
    if (direction === '') {
      return emails;
    } else {
      return [...emails].sort((a, b) => {
        const res = this._compare(a[column], b[column]);
        return direction === 'asc' ? res : -res;
      });
    }
  }

  // tslint:disable-next-line: no-shadowed-variable
  private _matches(email: Email, term: string, pipe: PipeTransform): any {
    return (
      email.from.toLowerCase().includes(term) ||
      email.to[0]?.toLowerCase().includes(term) ||
      email.cc[0]?.toLowerCase().includes(term) ||
      email.bcc[0]?.toLowerCase().includes(term) ||
      email.subject.toLowerCase().includes(term) ||
      email.body.toLowerCase().includes(term) ||
      pipe.transform(email.date).includes(term)
    );
  }

  private _search(): Observable<SearchResult> {
    const {
      sortColumn,
      sortDirection,
      pageSize,
      page,
      searchTerm
    } = this._state;

    let emails = this._sort(this._getEmailData(), sortColumn, sortDirection);

    // tslint:disable-next-line: no-shadowed-variable
    emails = emails.filter(email =>
      this._matches(email, searchTerm.toLowerCase(), this.pipe)
    );
    const total = emails.length;

    emails = emails.slice(
      (page - 1) * pageSize,
      (page - 1) * pageSize + pageSize
    );
    return of({ emails, total });
  }
}
