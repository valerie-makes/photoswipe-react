/**
 *
 * keyboard.js
 *
 * - Manages keyboard shortcuts.
 * - Heps trap focus within photoswipe.
 *
 */

import { specialKeyUsed } from './util/util.js';
import { createFocusTrap } from 'focus-trap';
import { getFocusTarget } from './use-lightbox.js';

class Keyboard {
  constructor(pswp) {
    this.pswp = pswp;
    let focusTrap;

    pswp.on('bindEvents', () => {
      focusTrap = createFocusTrap(this.pswp.template, {
        escapeDeactivates: false,
        returnFocusOnDeactivate: false,
        initialFocus: this.pswp.template,
      });

      focusTrap.activate();
      pswp.events.add(document, 'keydown', this._onKeyDown.bind(this));
    });

    pswp.on('destroy', () => {
      focusTrap.deactivate();
      getFocusTarget().focus();
    });
  }

  _onKeyDown(e) {
    const { pswp } = this;

    if (pswp.dispatch('keydown', { originalEvent: e }).defaultPrevented) {
      return;
    }

    if (specialKeyUsed(e)) {
      // don't do anything if special key pressed
      // to prevent from overriding default browser actions
      // for example, in Chrome on Mac cmd+arrow-left returns to previous page
      return;
    }

    let keydownAction;
    let axis;
    let isForward;

    switch (e.keyCode) {
      case 27: // esc
        if (pswp.options.escKey) {
          keydownAction = 'close';
        }
        break;
      case 90: // z key
        keydownAction = 'toggleZoom';
        break;
      case 37: // left
        axis = 'x';
        break;
      case 38: // top
        axis = 'y';
        break;
      case 39: // right
        axis = 'x';
        isForward = true;
        break;
      case 40: // bottom
        isForward = true;
        axis = 'y';
        break;
      default:
    }

    // if left/right/top/bottom key
    if (axis) {
      // prevent page scroll
      e.preventDefault();

      const { currSlide } = pswp;

      if (pswp.options.arrowKeys && axis === 'x' && pswp.getNumItems() > 1) {
        keydownAction = isForward ? 'next' : 'prev';
      } else if (
        currSlide &&
        currSlide.currZoomLevel > currSlide.zoomLevels.fit
      ) {
        // up/down arrow keys pan the image vertically
        // left/right arrow keys pan horizontally.
        // Unless there is only one image,
        // or arrowKeys option is disabled
        currSlide.pan[axis] += isForward ? -80 : 80;
        currSlide.panTo(currSlide.pan.x, currSlide.pan.y);
      }
    }

    if (keydownAction) {
      e.preventDefault();
      pswp[keydownAction]();
    }
  }
}

export default Keyboard;
