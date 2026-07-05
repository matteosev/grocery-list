import { Directive, ElementRef, inject, OnInit, OnDestroy, output } from '@angular/core';
import { GestureController, Gesture } from '@ionic/angular/standalone';

@Directive({
  selector: '[appLongPress]',
  standalone: true
})
export class LongPressDirective implements OnInit, OnDestroy {
  private readonly el = inject(ElementRef);
  private readonly gestureCtrl = inject(GestureController);
  
  private gesture?: Gesture;
  private longPressTimeout: any;

  readonly longPress = output<Event>();

  ngOnInit() {
    this.gesture = this.gestureCtrl.create({
      el: this.el.nativeElement,
      gestureName: 'long-press',
      threshold: 0, // Activates upon contact
      onStart: (detail) => {
        // Start the timer when touched
        this.longPressTimeout = setTimeout(() => {
          this.longPress.emit(detail.event);
        }, 600);
      },
      onMove: (detail) => {
        // Cancel the long press if the user moves their finger
        if (Math.abs(detail.deltaX) > 10 || Math.abs(detail.deltaY) > 10) {
          clearTimeout(this.longPressTimeout);
        }
      },
      onEnd: () => {
        // Cancel the long press if the user releases before 600ms
        clearTimeout(this.longPressTimeout);
      }
    });

    this.gesture.enable(true);
  }

  ngOnDestroy() {
    this.gesture?.destroy();
  }
}