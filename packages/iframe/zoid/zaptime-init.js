(function(exports) {

"use strict";

//#region src/zaptime-init/styles/tokens.ts
/**
* Design tokens for Zaptime components
* Extracts magic values for maintainability
*/
const TOKENS = {
	zIndex: {
		modal: "2147483647",
		button: "2147483646",
		closeButton: "10"
	},
	colors: {
		light: {
			backdrop: "rgba(0, 0, 0, 0.5)",
			modalBg: "#ffffff",
			closeButtonBg: "rgba(0, 0, 0, 0.05)",
			closeButtonHoverBg: "rgba(0, 0, 0, 0.1)",
			closeButtonColor: "#374151"
		},
		dark: {
			backdrop: "rgba(0, 0, 0, 0.7)",
			modalBg: "#1f2937",
			closeButtonBg: "rgba(255, 255, 255, 0.1)",
			closeButtonHoverBg: "rgba(255, 255, 255, 0.2)",
			closeButtonColor: "#e5e7eb"
		},
		buttonDefault: "#15B79E",
		white: "#ffffff"
	},
	timing: {
		fadeIn: "0.2s",
		hover: "0.15s"
	},
	easing: {
		default: "ease-in-out",
		hover: "ease"
	},
	borderRadius: {
		modal: "12px",
		button: "9999px",
		closeButton: "50%"
	},
	shadows: {
		modal: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
		button: "0 4px 14px rgba(0, 0, 0, 0.15)",
		buttonHover: "0 6px 20px rgba(0, 0, 0, 0.2)"
	},
	dimensions: {
		modalWidth: "90vw",
		modalMaxWidth: "900px",
		modalHeight: "90vh",
		modalMaxHeight: "850px",
		closeButtonSize: "32px",
		buttonPaddingY: "12px",
		buttonPaddingX: "24px",
		buttonGap: "8px",
		buttonBottom: "24px"
	},
	fonts: {
		family: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
		size: "14px",
		weight: "500"
	},
	transforms: {
		modalHidden: "scale(0.95)",
		modalVisible: "scale(1)",
		buttonHover: "translateY(-2px)"
	}
};

//#endregion
//#region src/zaptime-init/styles/button.ts
const floatingButtonStyles = {
	base: {
		position: "fixed",
		bottom: TOKENS.dimensions.buttonBottom,
		zIndex: TOKENS.zIndex.button,
		padding: `${TOKENS.dimensions.buttonPaddingY} ${TOKENS.dimensions.buttonPaddingX}`,
		border: "none",
		borderRadius: TOKENS.borderRadius.button,
		cursor: "pointer",
		display: "flex",
		alignItems: "center",
		gap: TOKENS.dimensions.buttonGap,
		boxShadow: TOKENS.shadows.button,
		transition: `transform ${TOKENS.timing.hover} ${TOKENS.easing.hover}, box-shadow ${TOKENS.timing.hover} ${TOKENS.easing.hover}`,
		fontFamily: TOKENS.fonts.family,
		fontSize: TOKENS.fonts.size,
		fontWeight: TOKENS.fonts.weight
	},
	hover: {
		transform: TOKENS.transforms.buttonHover,
		boxShadow: TOKENS.shadows.buttonHover
	},
	positionLeft: { left: TOKENS.dimensions.buttonBottom },
	positionRight: { right: TOKENS.dimensions.buttonBottom }
};

//#endregion
//#region src/zaptime-init/styles/utils.ts
/**
* Apply a style object to an HTML element
*/
function applyStyles(element, styles) {
	const styleKeys = Object.keys(styles);
	for (const key of styleKeys) {
		const value = styles[key];
		if (value !== void 0 && typeof value === "string") element.style[key] = value;
	}
}
/**
* Merge multiple style objects into one
*/
function mergeStyles(...styleObjects) {
	return Object.assign({}, ...styleObjects);
}

//#endregion
//#region src/zaptime-init/utils/dom.ts
/**
* Generate a unique ID for Zaptime components
*/
function generateUniqueId() {
	return "zaptime-" + Math.random().toString(36).substr(2, 9);
}

//#endregion
//#region src/zaptime-init/utils/icons.ts
/**
* Get the Zaptime logo SVG with the specified color
*/
function getZaptimeLogo(color = "#FFFFFF") {
	return "<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z\" fill=\"" + color + "\"/></svg>";
}
/**
* Get the close icon SVG
*/
function getCloseIcon() {
	return "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M18 6L6 18M6 6l12 12\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>";
}

//#endregion
//#region src/zaptime-init/styles/modal.ts
function createModalStyles(isDark) {
	const colors = isDark ? TOKENS.colors.dark : TOKENS.colors.light;
	return {
		backdrop: {
			position: "fixed",
			top: "0",
			left: "0",
			width: "100%",
			height: "100%",
			backgroundColor: colors.backdrop,
			zIndex: TOKENS.zIndex.modal,
			display: "flex",
			alignItems: "center",
			justifyContent: "center",
			opacity: "0",
			transition: `opacity ${TOKENS.timing.fadeIn} ${TOKENS.easing.default}`
		},
		backdropVisible: { opacity: "1" },
		container: {
			position: "relative",
			backgroundColor: colors.modalBg,
			borderRadius: TOKENS.borderRadius.modal,
			boxShadow: TOKENS.shadows.modal,
			width: TOKENS.dimensions.modalWidth,
			maxWidth: TOKENS.dimensions.modalMaxWidth,
			height: TOKENS.dimensions.modalHeight,
			maxHeight: TOKENS.dimensions.modalMaxHeight,
			overflow: "hidden",
			transform: TOKENS.transforms.modalHidden,
			transition: `transform ${TOKENS.timing.fadeIn} ${TOKENS.easing.default}, background-color ${TOKENS.timing.fadeIn} ${TOKENS.easing.default}`
		},
		containerVisible: { transform: TOKENS.transforms.modalVisible },
		closeButton: {
			position: "absolute",
			top: "12px",
			right: "12px",
			width: TOKENS.dimensions.closeButtonSize,
			height: TOKENS.dimensions.closeButtonSize,
			border: "none",
			backgroundColor: colors.closeButtonBg,
			color: colors.closeButtonColor,
			borderRadius: TOKENS.borderRadius.closeButton,
			cursor: "pointer",
			display: "flex",
			alignItems: "center",
			justifyContent: "center",
			zIndex: TOKENS.zIndex.closeButton,
			transition: `background-color ${TOKENS.timing.hover} ${TOKENS.easing.hover}`
		},
		closeButtonHover: { backgroundColor: colors.closeButtonHoverBg },
		content: {
			width: "100%",
			height: "100%",
			overflow: "auto",
			display: "flex",
			alignItems: "center",
			justifyContent: "center"
		}
	};
}
const modalStyles = createModalStyles(false);
const modalStylesDark = createModalStyles(true);

//#endregion
//#region src/zaptime-init/utils/darkMode.ts
/**
* Detect if the website prefers dark mode
* Checks common patterns: html.dark, body.dark, data-theme="dark", data-mode="dark"
*/
function isDarkMode() {
	if (typeof document === "undefined") return false;
	const html = document.documentElement;
	const body = document.body;
	if (html.classList.contains("dark") || body?.classList.contains("dark")) return true;
	const htmlTheme = html.getAttribute("data-theme");
	const bodyTheme = body?.getAttribute("data-theme");
	if (htmlTheme === "dark" || bodyTheme === "dark") return true;
	const htmlMode = html.getAttribute("data-mode");
	const bodyMode = body?.getAttribute("data-mode");
	if (htmlMode === "dark" || bodyMode === "dark") return true;
	const htmlColorScheme = getComputedStyle(html).colorScheme;
	if (htmlColorScheme === "dark") return true;
	return false;
}
/**
* Listen for website dark mode changes
* Uses MutationObserver to watch for class/attribute changes on html and body
*/
function onDarkModeChange(callback) {
	if (typeof document === "undefined" || typeof MutationObserver === "undefined") return () => {};
	let currentIsDark = isDarkMode();
	const checkAndNotify = () => {
		const newIsDark = isDarkMode();
		if (newIsDark !== currentIsDark) {
			currentIsDark = newIsDark;
			callback(newIsDark);
		}
	};
	const observer = new MutationObserver(checkAndNotify);
	observer.observe(document.documentElement, {
		attributes: true,
		attributeFilter: [
			"class",
			"data-theme",
			"data-mode",
			"style"
		]
	});
	if (document.body) observer.observe(document.body, {
		attributes: true,
		attributeFilter: [
			"class",
			"data-theme",
			"data-mode",
			"style"
		]
	});
	return () => observer.disconnect();
}

//#endregion
//#region src/zaptime-init/components/Modal.ts
let ZaptimeComponent = null;
function setZaptimeComponent(component) {
	ZaptimeComponent = component;
}
var ZaptimeModal = class {
	id;
	options;
	isOpen = false;
	isDark = false;
	styles;
	backdrop = null;
	container = null;
	closeButton = null;
	zoidInstance = null;
	originalBodyOverflow = null;
	handleKeyDown = null;
	removeDarkModeListener = null;
	constructor(options) {
		this.id = generateUniqueId();
		this.options = options;
		this.isDark = isDarkMode();
		this.styles = createModalStyles(this.isDark);
	}
	updateStyles() {
		this.styles = createModalStyles(this.isDark);
		if (this.backdrop) {
			applyStyles(this.backdrop, this.styles.backdrop);
			if (this.isOpen) applyStyles(this.backdrop, this.styles.backdropVisible);
		}
		if (this.container) {
			applyStyles(this.container, this.styles.container);
			if (this.isOpen) applyStyles(this.container, this.styles.containerVisible);
		}
		if (this.closeButton) applyStyles(this.closeButton, this.styles.closeButton);
	}
	create() {
		this.backdrop = document.createElement("div");
		this.backdrop.id = `${this.id}-backdrop`;
		applyStyles(this.backdrop, this.styles.backdrop);
		this.container = document.createElement("div");
		this.container.id = `${this.id}-container`;
		applyStyles(this.container, this.styles.container);
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
		const content = document.createElement("div");
		content.id = `${this.id}-content`;
		applyStyles(content, this.styles.content);
		this.container.appendChild(this.closeButton);
		this.container.appendChild(content);
		this.backdrop.appendChild(this.container);
		this.backdrop.addEventListener("click", (e) => {
			if (e.target === this.backdrop) this.close();
		});
		this.handleKeyDown = (e) => {
			if (e.key === "Escape" && this.isOpen) this.close();
		};
		document.addEventListener("keydown", this.handleKeyDown);
		this.removeDarkModeListener = onDarkModeChange((isDark) => {
			this.isDark = isDark;
			this.updateStyles();
		});
		document.body.appendChild(this.backdrop);
		if (ZaptimeComponent) {
			this.zoidInstance = ZaptimeComponent({
				type: this.options.type,
				config: this.options.config,
				onEventChanged: this.options.onEventChanged
			});
			this.zoidInstance.render(content);
		}
	}
	open() {
		if (this.isOpen) return;
		if (!this.backdrop) this.create();
		this.originalBodyOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		if (this.backdrop) this.backdrop.style.display = "flex";
		requestAnimationFrame(() => {
			if (this.backdrop && this.container) {
				applyStyles(this.backdrop, this.styles.backdropVisible);
				applyStyles(this.container, this.styles.containerVisible);
			}
		});
		this.isOpen = true;
		if (typeof this.options.onOpen === "function") this.options.onOpen();
	}
	close() {
		if (!this.isOpen) return;
		if (this.backdrop) this.backdrop.style.opacity = "0";
		if (this.container) this.container.style.transform = "scale(0.95)";
		setTimeout(() => {
			if (this.backdrop) this.backdrop.style.display = "none";
			document.body.style.overflow = this.originalBodyOverflow || "";
			this.isOpen = false;
			if (typeof this.options.onClose === "function") this.options.onClose();
		}, 200);
	}
	destroy() {
		if (this.backdrop) {
			if (this.handleKeyDown) document.removeEventListener("keydown", this.handleKeyDown);
			if (this.removeDarkModeListener) this.removeDarkModeListener();
			if (this.backdrop.parentNode) this.backdrop.parentNode.removeChild(this.backdrop);
			this.backdrop = null;
			this.container = null;
			this.closeButton = null;
			this.zoidInstance = null;
		}
		if (this.isOpen) {
			document.body.style.overflow = this.originalBodyOverflow || "";
			this.isOpen = false;
		}
	}
};

//#endregion
//#region src/zaptime-init/components/FloatingButton.ts
function createFloatingButton(options = {}) {
	const position = options.position || "bottom-right";
	const buttonColor = options.buttonColor || TOKENS.colors.buttonDefault;
	const buttonTextColor = options.buttonTextColor || TOKENS.colors.white;
	const buttonText = options.buttonText || "Book a Meeting";
	const branding = options.branding !== false;
	const id = generateUniqueId();
	let button = null;
	let modal = null;
	function create() {
		button = document.createElement("button");
		button.id = `${id}-button`;
		button.type = "button";
		const positionStyles = position === "bottom-left" ? floatingButtonStyles.positionLeft : floatingButtonStyles.positionRight;
		const buttonStyles = mergeStyles(floatingButtonStyles.base, positionStyles, {
			backgroundColor: buttonColor,
			color: buttonTextColor
		});
		applyStyles(button, buttonStyles);
		if (branding) button.innerHTML = getZaptimeLogo(buttonTextColor) + "<span>Zaptime</span>";
		else button.innerHTML = "<span>" + buttonText + "</span>";
		button.addEventListener("mouseenter", () => {
			if (button) applyStyles(button, floatingButtonStyles.hover);
		});
		button.addEventListener("mouseleave", () => {
			if (button) {
				button.style.transform = "";
				button.style.boxShadow = TOKENS.shadows.button;
			}
		});
		button.addEventListener("click", () => {
			if (!modal) modal = new ZaptimeModal({
				type: options.type,
				config: options.config,
				onEventChanged: options.onEventChanged,
				onOpen: options.onOpen,
				onClose: options.onClose
			});
			modal.open();
		});
		document.body.appendChild(button);
	}
	function open() {
		if (!modal) modal = new ZaptimeModal({
			type: options.type,
			config: options.config,
			onEventChanged: options.onEventChanged,
			onOpen: options.onOpen,
			onClose: options.onClose
		});
		modal.open();
	}
	function close() {
		if (modal) modal.close();
	}
	function destroy() {
		if (button && button.parentNode) {
			button.parentNode.removeChild(button);
			button = null;
		}
		if (modal) {
			modal.destroy();
			modal = null;
		}
	}
	create();
	return {
		id,
		open,
		close,
		destroy
	};
}

//#endregion
//#region src/zaptime-init/components/Popup.ts
function createPopup(options = {}) {
	const selector = options.selector || "[data-zaptime-link]";
	const id = generateUniqueId();
	let modal = null;
	let observer = null;
	let boundElements = [];
	function getModal() {
		if (!modal) modal = new ZaptimeModal({
			type: options.type,
			config: options.config,
			onEventChanged: options.onEventChanged,
			onOpen: options.onOpen,
			onClose: options.onClose
		});
		return modal;
	}
	function handleClick(e) {
		e.preventDefault();
		getModal().open();
	}
	function bindElement(element) {
		if (boundElements.indexOf(element) === -1) {
			element.addEventListener("click", handleClick);
			boundElements.push(element);
		}
	}
	function bindElements() {
		const elements = document.querySelectorAll(selector);
		for (let i = 0; i < elements.length; i++) bindElement(elements[i]);
	}
	function setupObserver() {
		if (typeof MutationObserver === "undefined") return;
		observer = new MutationObserver((mutations) => {
			for (let i = 0; i < mutations.length; i++) {
				const mutation = mutations[i];
				if (mutation.type === "childList" && mutation.addedNodes.length > 0) for (let j = 0; j < mutation.addedNodes.length; j++) {
					const node = mutation.addedNodes[j];
					if (node.nodeType === 1) {
						const element = node;
						if (element.matches && element.matches(selector)) bindElement(element);
						if (element.querySelectorAll) {
							const descendants = element.querySelectorAll(selector);
							for (let k = 0; k < descendants.length; k++) bindElement(descendants[k]);
						}
					}
				}
			}
		});
		observer.observe(document.body, {
			childList: true,
			subtree: true
		});
	}
	function open() {
		getModal().open();
	}
	function close() {
		if (modal) modal.close();
	}
	function destroy() {
		for (let i = 0; i < boundElements.length; i++) boundElements[i].removeEventListener("click", handleClick);
		boundElements = [];
		if (observer) {
			observer.disconnect();
			observer = null;
		}
		if (modal) {
			modal.destroy();
			modal = null;
		}
	}
	bindElements();
	setupObserver();
	return {
		id,
		open,
		close,
		destroy
	};
}

//#endregion
//#region src/zaptime-init/plugin/ZaptimePlugin.ts
const ZaptimePlugin = {
	postMessage(action, data) {
		const iframe = document.querySelector(".zoid-visible");
		if (iframe && iframe.contentWindow) iframe.contentWindow.postMessage({
			action,
			data
		}, "*");
	},
	book(payload) {
		this.postMessage("book", payload);
	},
	reserve(payload) {
		this.postMessage("reserve", payload);
	},
	confirm(payload) {
		this.postMessage("confirm", payload);
	},
	cancel(payload) {
		this.postMessage("cancel", payload);
	}
};

//#endregion
//#region src/zaptime-init/index.ts
const Zaptime = zoid.create({
	tag: "zaptime-component",
	url: "https://iframe.zaptime.app",
	dimensions: {
		width: "100%",
		height: "100%"
	},
	autoResize: {
		width: false,
		height: true
	},
	props: {
		type: {
			type: "string",
			required: false
		},
		config: {
			type: "object",
			required: true
		},
		onEventChanged: {
			type: "function",
			required: false
		},
		position: {
			type: "string",
			required: false,
			default: function() {
				return "center";
			}
		}
	}
});
setZaptimeComponent(Zaptime);
Zaptime.floatingButton = function(options) {
	return createFloatingButton(options);
};
Zaptime.popup = function(options) {
	return createPopup(options);
};
window.Zaptime = Zaptime;
window.ZaptimePlugin = ZaptimePlugin;

//#endregion
exports.Zaptime = Zaptime
exports.ZaptimePlugin = ZaptimePlugin
return exports;
})({});