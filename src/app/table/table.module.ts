import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableComponent } from './table.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbdSortableHeaderDirective } from './_directives/sortable.directive';

@NgModule({
  declarations: [TableComponent, NgbdSortableHeaderDirective],
  imports: [CommonModule, NgbModule, FormsModule, ReactiveFormsModule],
  exports: [TableComponent]
})
export class TableModule {}
