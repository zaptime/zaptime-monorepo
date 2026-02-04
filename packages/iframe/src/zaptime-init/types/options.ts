/**
 * Configuration options for Zaptime components
 */

import { type ZaptimeConfig } from "@zaptime/core";

export interface ModalOptions {
  type?: "single" | "group";
  config: ZaptimeConfig;
  onEventChanged?: (event: unknown) => void;
  onOpen?: () => void;
  onClose?: () => void;
}

export interface FloatingButtonOptions extends ModalOptions {
  position?: "bottom-left" | "bottom-right";
  buttonColor?: string;
  buttonTextColor?: string;
  buttonText?: string;
}

export interface PopupOptions extends ModalOptions {
  selector?: string;
}

export interface ZaptimeInstance {
  id: string;
  open: () => void;
  close: () => void;
  destroy: () => void;
}

export type ButtonPosition = "bottom-left" | "bottom-right";
