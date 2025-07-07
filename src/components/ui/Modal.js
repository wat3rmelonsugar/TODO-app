import React from "react";
import { createPortal } from "react-dom";

export default function Modal({ isOpen, children }) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="modal-content">{children}</div>
    </div>,
    document.body
  );
}
