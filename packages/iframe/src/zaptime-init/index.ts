// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./types/zoid.d.ts" />

import type {
  FloatingButtonOptions,
  PopupOptions,
  ZaptimeInstance,
} from "./types/options";
import type { ZaptimeConfig } from "@zaptime/core";
import { createFloatingButton } from "./components/FloatingButton";
import { createPopup } from "./components/Popup";
import { setZaptimeComponent } from "./components/Modal";
import { ZaptimePlugin } from "./plugin/ZaptimePlugin";

// Extend the window interface for global Zaptime and ZaptimePlugin
declare global {
  interface Window {
    Zaptime: ZoidComponent;
    ZaptimePlugin: typeof ZaptimePlugin;
  }
}

// Type for the Zoid component with extensions
interface ZoidComponent {
  (options: {
    type?: string;
    config: ZaptimeConfig;
    onEventChanged?: (event: unknown) => void;
  }): {
    render: (container: HTMLElement | string) => Promise<void>;
  };
  floatingButton?: (options: FloatingButtonOptions) => ZaptimeInstance;
  popup?: (options: PopupOptions) => ZaptimeInstance;
}

// Create the Zoid component
const Zaptime: ZoidComponent = zoid.create({
  tag: "zaptime-component",
  url: "https://iframe.zaptime.app",

  dimensions: {
    width: "100%",
    height: "100%",
  },

  autoResize: {
    width: false,
    height: true,
  },

  props: {
    type: {
      type: "string",
      required: false,
    },
    config: {
      type: "object",
      required: true,
    },
    onEventChanged: {
      type: "function",
      required: false,
    },
    position: {
      type: "string",
      required: false,
      default: function () {
        return "center";
      },
    },
  },
});

// Register the Zaptime component for Modal to use
setZaptimeComponent(Zaptime);

// Add floatingButton method
Zaptime.floatingButton = function (
  options: FloatingButtonOptions,
): ZaptimeInstance {
  return createFloatingButton(options);
};

// Add popup method
Zaptime.popup = function (options: PopupOptions): ZaptimeInstance {
  return createPopup(options);
};

// Export to window for script tag usage
window.Zaptime = Zaptime;
window.ZaptimePlugin = ZaptimePlugin;

// Export for potential module usage (though primarily used as IIFE)
export { Zaptime, ZaptimePlugin };
