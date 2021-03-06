import {
  AfterContentInit,
  Component,
  ContentChildren,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  QueryList
} from '@angular/core';

import {
  Subscription
} from 'rxjs/Subscription';

import {
  SkyCardTitleComponent
} from './card-title.component';

@Component({
  selector: 'sky-card',
  styleUrls: ['./card.component.scss'],
  templateUrl: './card.component.html'
})
export class SkyCardComponent implements AfterContentInit, OnDestroy {
  @Input()
  public size: string;

  @Input()
  public selectable: boolean;

  @Input()
  public selected: boolean;

  @Output()
  public selectedChange = new EventEmitter<boolean>();

  @ContentChildren(SkyCardTitleComponent)
  public titleComponent: QueryList<SkyCardTitleComponent>;

  public showTitle: boolean = true;

  private subscription: Subscription;

  public ngAfterContentInit() {
    this.showTitle = this.titleComponent.length > 0;

    this.subscription = this.titleComponent.changes.subscribe(() => {
      this.showTitle = this.titleComponent.length > 0;
    });
  }

  public contentClick() {
    if (this.selectable) {
      this.selected = !this.selected;
      this.selectedChange.emit(this.selected);
    }
  }

  public onCheckboxChange(newValue: boolean) {
    if (this.selectable && this.selected !== newValue) {
      this.selected = newValue;
      this.selectedChange.emit(this.selected);
    }
  }

  public ngOnDestroy() {
    /* istanbul ignore else */
    /* sanity check */
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
