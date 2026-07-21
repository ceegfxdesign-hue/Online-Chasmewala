import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

/** Renders children into a detached DOM node appended to <body>. */
export function Portal({ children }) {
  const [container] = useState(() => {
    if (typeof document === 'undefined') return null;
    const el = document.createElement('div');
    el.setAttribute('data-portal', '');
    return el;
  });

  useEffect(() => {
    if (!container) return undefined;
    document.body.appendChild(container);
    return () => {
      document.body.removeChild(container);
    };
  }, [container]);

  return container ? createPortal(children, container) : null;
}

export default Portal;
