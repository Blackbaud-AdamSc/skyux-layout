import {
  AnimationEvent
} from '@angular/animations';

import {
  Component,
  Input,
  ChangeDetectorRef,
  Output,
  EventEmitter
} from '@angular/core';

import {
  skyAnimationEmerge
} from '@skyux/animations';

import {
  SkyInlineDeleteType
 } from './inline-delete-type';

@Component({
  selector: 'sky-inline-delete',
  styleUrls: ['./inline-delete.component.scss'],
  templateUrl: './inline-delete.component.html',
  animations: [
    skyAnimationEmerge
  ]
})
export class SkyInlineDeleteComponent {

  public animationState: string = 'open';

  @Input()
  public pending: boolean = false;

  @Output()
  public cancelTriggered = new EventEmitter<void>();

  @Output()
  public deleteTriggered = new EventEmitter<void>();

  public type: SkyInlineDeleteType = SkyInlineDeleteType.Standard;

  constructor(private changeDetector: ChangeDetectorRef) {}

  public setType(type: SkyInlineDeleteType) {
    this.type = type;
    this.changeDetector.detectChanges();
  }

  public onAnimationDone(event: AnimationEvent) {
    if (event.toState === 'closed') {
      this.cancelTriggered.emit();
    }
  }

}
