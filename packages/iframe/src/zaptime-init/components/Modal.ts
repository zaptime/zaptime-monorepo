import type { ModalOptions } from "../types/options";
import { createModalStyles, type ModalStyleSet } from "../styles/modal";
import { applyStyles } from "../styles/utils";
import { generateUniqueId } from "../utils/dom";
import { getCloseIcon } from "../utils/icons";
import { isDarkMode, onDarkModeChange } from "../utils/darkMode";
import { type ZaptimeConfig } from "@zaptime/core";

export type ZaptimeComponentFn = (options: {
  type?: string;
  config: ZaptimeConfig;
  onEventChanged?: (event: unknown) => void;
}) => { render: (container: HTMLElement) => void };

// Zaptime component reference - set by index.ts after zoid.create()
let ZaptimeComponent: ZaptimeComponentFn | null = null;

export function setZaptimeComponent(component: ZaptimeComponentFn): void {
  ZaptimeComponent = component;
}

export function getZaptimeComponent(): ZaptimeComponentFn | null {
  return ZaptimeComponent;
}

export class ZaptimeModal {
  public readonly id: string;
  private options: ModalOptions;
  private isOpen = false;
  private isDark = false;
  private styles: ModalStyleSet;
  private backdrop: HTMLDivElement | null = null;
  private container: HTMLDivElement | null = null;
  private closeButton: HTMLButtonElement | null = null;
  private zoidInstance: ReturnType<ZaptimeComponentFn> | null = null;
  private originalBodyOverflow: string | null = null;
  private handleKeyDown: ((e: KeyboardEvent) => void) | null = null;
  private removeDarkModeListener: (() => void) | null = null;

  constructor(options: ModalOptions) {
    this.id = generateUniqueId();
    this.options = options;
    this.isDark = isDarkMode();
    this.styles = createModalStyles(this.isDark);
  }

  private updateStyles(): void {
    this.styles = createModalStyles(this.isDark);

    if (this.backdrop) {
      applyStyles(this.backdrop, this.styles.backdrop);
      if (this.isOpen) {
        applyStyles(this.backdrop, this.styles.backdropVisible);
      }
    }

    if (this.container) {
      applyStyles(this.container, this.styles.container);
      if (this.isOpen) {
        applyStyles(this.container, this.styles.containerVisible);
      }
    }

    if (this.closeButton) {
      applyStyles(this.closeButton, this.styles.closeButton);
    }
  }

  private create(): void {
    // Create backdrop
    this.backdrop = document.createElement("div");
    this.backdrop.id = `${this.id}-backdrop`;
    applyStyles(this.backdrop, this.styles.backdrop);

    // Create container
    this.container = document.createElement("div");
    this.container.id = `${this.id}-container`;
    applyStyles(this.container, this.styles.container);

    // Create close button
    this.closeButton = document.createElement("button");
    this.closeButton.type = "button";
    this.closeButton.setAttribute("aria-label", "Close");
    applyStyles(this.closeButton, this.styles.closeButton);
    this.closeButton.innerHTML = getCloseIcon();

    const closeButton = this.closeButton;
    closeButton.addEventListener("mouseenter", () => {
      applyStyles(closeButton, this.styles.closeButtonHover);
    });
    closeButton.addEventListener("mouseleave", () => {
      applyStyles(closeButton, this.styles.closeButton);
    });
    closeButton.addEventListener("click", (e) => {
      e.stopPropagation();
      this.close();
    });

    // Create content area for zoid
    const content = document.createElement("div");
    content.id = `${this.id}-content`;
    applyStyles(content, this.styles.content);

    this.container.appendChild(this.closeButton);
    this.container.appendChild(content);
    this.backdrop.appendChild(this.container);

    // Click outside to close
    this.backdrop.addEventListener("click", (e) => {
      if (e.target === this.backdrop) {
        this.close();
      }
    });

    // Escape key to close
    this.handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && this.isOpen) {
        this.close();
      }
    };
    document.addEventListener("keydown", this.handleKeyDown);

    // Listen for dark mode changes
    this.removeDarkModeListener = onDarkModeChange((isDark) => {
      this.isDark = isDark;
      this.updateStyles();
    });

    document.body.appendChild(this.backdrop);

    // Render zoid component
    if (ZaptimeComponent) {
      this.zoidInstance = ZaptimeComponent({
        type: this.options.type,
        config: this.options.config,
        onEventChanged: this.options.onEventChanged,
      });
      this.zoidInstance.render(content);
    }
  }

  public open(): void {
    if (this.isOpen) return;

    if (!this.backdrop) {
      this.create();
    }

    // Lock body scroll
    this.originalBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    if (this.backdrop) {
      this.backdrop.style.display = "flex";
    }

    // Trigger animation
    requestAnimationFrame(() => {
      if (this.backdrop && this.container) {
        applyStyles(this.backdrop, this.styles.backdropVisible);
        applyStyles(this.container, this.styles.containerVisible);
      }
    });

    this.isOpen = true;

    if (typeof this.options.onOpen === "function") {
      this.options.onOpen();
    }
  }

  public close(): void {
    if (!this.isOpen) return;

    // Reset styles for animation
    if (this.backdrop) {
      this.backdrop.style.opacity = "0";
    }
    if (this.container) {
      this.container.style.transform = "scale(0.95)";
    }

    setTimeout(() => {
      if (this.backdrop) {
        this.backdrop.style.display = "none";
      }

      // Restore body scroll
      document.body.style.overflow = this.originalBodyOverflow || "";

      this.isOpen = false;

      if (typeof this.options.onClose === "function") {
        this.options.onClose();
      }
    }, 200);
  }

  public destroy(): void {
    if (this.backdrop) {
      if (this.handleKeyDown) {
        document.removeEventListener("keydown", this.handleKeyDown);
      }
      if (this.removeDarkModeListener) {
        this.removeDarkModeListener();
      }
      if (this.backdrop.parentNode) {
        this.backdrop.parentNode.removeChild(this.backdrop);
      }
      this.backdrop = null;
      this.container = null;
      this.closeButton = null;
      this.zoidInstance = null;
    }

    // Restore body scroll if still locked
    if (this.isOpen) {
      document.body.style.overflow = this.originalBodyOverflow || "";
      this.isOpen = false;
    }
  }
}
