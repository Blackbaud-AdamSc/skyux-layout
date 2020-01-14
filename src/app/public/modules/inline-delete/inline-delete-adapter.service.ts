import {
  Injectable,
  Renderer2,
  RendererFactory2
} from '@angular/core';

@Injectable()
export class SkyInlineDeleteAdapterService {

  private element: HTMLElement;
  private focussableElements: HTMLElement[];
  private parentEl: HTMLElement;
  private parentElUnlistenFn: Function;
  private renderer: Renderer2;

  constructor(
    private rendererFactory: RendererFactory2
  ) {
    this.renderer = this.rendererFactory.createRenderer(undefined, undefined);
  }

  public setEl(element: HTMLElement): void {
    this.element = element;
    this.parentEl = element.parentElement;
    this.parentElUnlistenFn = this.renderer.listen(this.parentEl, 'focusin',
      (event: KeyboardEvent) => {
        const target: any = event.target;
        if (!this.element.contains(target)) {
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();

          target.blur();
          this.focusNextElement(target, this.isShift(event), this.parentEl);
        }
      });
  }

  public clearListeners(): void {
    this.parentElUnlistenFn();
  }

  private focusNextElement(targetElement: HTMLElement, shiftKey: boolean, busyEl: Element): void {
    const focussable = this.getFocussableElements();

    // If shift tab, go in the other direction
    const modifier = shiftKey ? -1 : 1;

    // Find the next navigable element that isn't waiting
    const startingIndex = focussable.indexOf(targetElement);
    let curIndex = startingIndex + modifier;
    while (focussable[curIndex] && this.isElementHiddenOrCovered(focussable[curIndex])) {
      curIndex += modifier;
    }

    if (focussable[curIndex] && !this.isElementHiddenOrCovered(focussable[curIndex])) {
      focussable[curIndex].focus();
    } else {
      // Try wrapping the navigation
      curIndex = modifier > 0 ? 0 : focussable.length - 1;
      while (
        curIndex !== startingIndex &&
        focussable[curIndex] &&
        this.isElementHiddenOrCovered(focussable[curIndex])
      ) {
        curIndex += modifier;
      }

      /* istanbul ignore else */
      /* sanity check */
      if (focussable[curIndex] && !this.isElementHiddenOrCovered(focussable[curIndex])) {
        focussable[curIndex].focus();
      } else {
        // No valid target, wipe focus
        // This should never happen in practice due to the multiple inline delete buttons
        if (document.activeElement && (document.activeElement as any).blur) {
          (document.activeElement as any).blur();
        }
        document.body.focus();
      }
    }

    // clear focussableElements list so that if things change between tabbing we know about it
    this.focussableElements = undefined;
  }

  private getFocussableElements(): HTMLElement[] {
    // Keep this cached so we can reduce querys
    if (this.focussableElements) {
      return this.focussableElements;
    }

    // Select all possible focussable elements
    const focussableElements =
      'a[href], ' +
      'area[href], ' +
      'input:not([disabled]):not([tabindex=\'-1\']), ' +
      'button:not([disabled]):not([tabindex=\'-1\']), ' +
      'select:not([disabled]):not([tabindex=\'-1\']), ' +
      'textarea:not([disabled]):not([tabindex=\'-1\']), ' +
      'iframe, object, embed, ' +
      '*[tabindex]:not([tabindex=\'-1\']), ' +
      '*[contenteditable=true]';

    this.focussableElements = Array.prototype.filter.call(
      document.body.querySelectorAll(focussableElements),
      (element: any) => {
        return element.offsetWidth > 0 || element.offsetHeight > 0 || element === document.activeElement;
      });
    return this.focussableElements;
  }

  private isElementHiddenOrCovered(element: any): boolean {
    const style = window.getComputedStyle(element);
    return style.display === 'none' || style.visibility === 'hidden' ||
      (this.parentEl.contains(element) && !this.element.contains(element));
  }

  private isShift(event: Event): boolean {
    // Determine if shift+tab was used based on element order
    const elements = this.getFocussableElements().filter(elem => !this.isElementHiddenOrCovered(elem));

    const previousInd = elements.indexOf((event as any).relatedTarget);
    const currentInd = elements.indexOf(event.target as HTMLElement);

    return previousInd === currentInd + 1
      || (previousInd === 0 && currentInd === elements.length - 1)
      || (previousInd > currentInd)
      || !(event as any).relatedTarget;
  }
}
