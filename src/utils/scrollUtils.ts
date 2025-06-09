import { AnimationOptions } from 'framer-motion';

export const scrollTo = (
  elementId: string,
  options: {
    offset?: number;
    duration?: number;
    ease?: AnimationOptions['ease'];
  } = {}
): void => {
  const {
    offset = 0,
    // We only use offset in the native implementation but keep the API consistent
    // for potential future enhancements with framer-motion
  } = options;

  const element = document.getElementById(elementId);
  if (!element) return;

  const elementPosition = element.getBoundingClientRect().top;
  const offsetPosition = elementPosition + window.scrollY - offset;

  window.scrollTo({
    top: offsetPosition,
    behavior: 'smooth'
  });
};

// Add scroll restoration functionality
export const setupScrollRestoration = (): void => {
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
};

// Disable body scroll
export const disableBodyScroll = (): void => {
  document.body.style.overflow = 'hidden';
  document.body.style.touchAction = 'none';
};

// Enable body scroll
export const enableBodyScroll = (): void => {
  document.body.style.overflow = '';
  document.body.style.touchAction = '';
};

// Get scroll progress (0 to 1)
export const getScrollProgress = (): number => {
  const scrollTop = window.scrollY;
  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
  return scrollTop / scrollHeight;
}; 