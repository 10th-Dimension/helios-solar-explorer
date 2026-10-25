'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/** Native modal semantics: focus containment, inert background and return focus. */
export function AccessibleDialog({ label, className, onClose, children }: {
  label: string; className: string; onClose: () => void; children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = ref.current;
    dialog?.showModal();
    return () => {
      dialog?.close();
      if (previous?.isConnected) previous.focus();
    };
  }, []);
  return <dialog ref={ref} className={className} aria-label={label}
    onCancel={event => { event.preventDefault(); onClose(); }}
    onKeyDown={event => {
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); onClose(); }
    }}>{children}</dialog>;
}
