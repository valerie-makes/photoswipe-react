import { useEffect, useState } from 'react';
import Lightbox from './lightbox/lightbox.js';
import PhotoSwipe from './photoswipe.js';

let restoreFocusTarget = null;

/**
 * @param {HTMLElement} value
 */
export function restoreFocusTo(value) {
  restoreFocusTarget = value;
}

export function getFocusTarget() {
  return restoreFocusTarget;
}

/**
 * @param {string} gallery
 * @param {string} children
 */
export default function useLightbox(gallery, children) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const pswpModule = PhotoSwipe;
    const lightbox = new Lightbox({ gallery, children, pswpModule });

    lightbox.init();
    lightbox.on('open', () => setIsOpen(true));
    lightbox.on('close', () => setIsOpen(false));

    return () => lightbox.destroy();
  }, [gallery, children]);

  useEffect(() => {
    const rootElement = document.querySelector('#__next');
    const routeAnnouncer = document.querySelector('next-route-announcer');

    if (isOpen) {
      setupHandlers();
      rootElement?.setAttribute('aria-hidden', 'true');
      routeAnnouncer?.setAttribute('aria-hidden', 'true');
    } else {
      rootElement?.removeAttribute('aria-hidden');
      routeAnnouncer?.removeAttribute('aria-hidden');
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.background = '#000000';

    const themeColor = document.createElement('meta');
    themeColor.name = 'theme-color';
    themeColor.content = '#000000';

    // hack to make iOS safari apply color to bottom bar
    setTimeout(() => document.head.appendChild(themeColor), 10);

    return () => {
      document.body.style.background = '';
      document.head.removeChild(themeColor);
    };
  }, [isOpen]);
}

function setupHandlers() {
  pswp.on('bindEvents', () => setAriaAttributes(pswp));
  pswp.on('change', () => setAriaAttributes(pswp));
}

/**
 * @param {PhotoSwipe} pswp
 */
function setAriaAttributes(pswp) {
  const { itemHolders } = pswp.mainScroll;

  for (const item of itemHolders) {
    if (item.slide.isActive) {
      item.el.removeAttribute('aria-hidden');
    } else {
      item.el.setAttribute('aria-hidden', 'true');
    }
  }
}
