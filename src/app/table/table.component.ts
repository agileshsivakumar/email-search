import { DatePipe } from '@angular/common';
import { Component, QueryList, ViewChildren, ViewEncapsulation } from '@angular/core';
import { Observable } from 'rxjs';
import {
  NgbdSortableHeaderDirective,
  SortEvent
} from './_directives/sortable.directive';
import { Email } from './_model/email';
import { EmailService } from './_services/email.service';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  providers: [EmailService, DatePipe]
})
export class TableComponent {
  emails$: Observable<Email[]>;
  total$: Observable<number>;

  @ViewChildren(NgbdSortableHeaderDirective) headers: QueryList<NgbdSortableHeaderDirective>;

  constructor(public emailService: EmailService) {
    this.emails$ = emailService.emails$;
    this.total$ = emailService.total$;
  }

  onSort({column, direction}: SortEvent): void {
    this.headers.forEach(header => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });
    this.emailService.sortColumn = column;
    this.emailService.sortDirection = direction;
  }
}
