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
			modalBg: "#262626",
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
		modalMaxWidth: "1050px",
		modalHeight: "90vh",
		modalMaxHeight: "850px",
		contentMaxWidth: "1050px",
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
const inlineButtonStyles = {
	base: {
		display: "inline-flex",
		alignItems: "center",
		gap: TOKENS.dimensions.buttonGap,
		padding: `${TOKENS.dimensions.buttonPaddingY} ${TOKENS.dimensions.buttonPaddingX}`,
		border: "none",
		borderRadius: TOKENS.borderRadius.button,
		cursor: "pointer",
		boxShadow: TOKENS.shadows.button,
		transition: `transform ${TOKENS.timing.hover} ${TOKENS.easing.hover}, box-shadow ${TOKENS.timing.hover} ${TOKENS.easing.hover}`,
		fontFamily: TOKENS.fonts.family,
		fontSize: TOKENS.fonts.size,
		fontWeight: TOKENS.fonts.weight
	},
	hover: {
		transform: TOKENS.transforms.buttonHover,
		boxShadow: TOKENS.shadows.buttonHover
	}
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
* Get the close icon SVG
*/
function getCloseIcon() {
	return "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M18 6L6 18M6 6l12 12\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>";
}
/**
* Get the Zaptime logo SVG for free accounts (white with transparent Z cutout)
*/
function getZaptimeFreeLogo() {
	return "<svg width=\"24\" height=\"24\" viewBox=\"0 0 700 700\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M527.831 15.0602C488.343 6.0241 423.434 0 350.12 0C276.807 0 211.837 6.0241 172.41 15.0602C133.772 23.212 98.3333 42.4102 70.4001 70.322C42.4669 98.2338 23.2416 133.658 15.0602 172.289C6.0241 211.777 0 276.687 0 350C0 423.313 6.0241 488.283 15.0602 527.711C23.2328 566.327 42.4402 601.739 70.3505 629.65C98.2608 657.56 133.673 676.767 172.289 684.94C211.777 693.976 276.687 700 350 700C423.313 700 488.283 693.976 527.711 684.94C566.327 676.767 601.739 657.56 629.65 629.65C657.56 601.739 676.767 566.327 684.94 527.711C693.976 488.223 700 423.313 700 350C700 276.687 693.976 211.717 684.94 172.289C676.776 133.689 657.586 98.2878 629.699 70.379C601.812 42.4703 566.425 23.2537 527.831 15.0602ZM162.552 597.087C148.345 597.087 134.108 591.651 123.265 580.808C101.578 559.122 101.578 523.92 123.265 502.234L497.874 127.624C519.56 105.938 554.762 105.938 576.448 127.624C598.134 149.31 598.134 184.512 576.448 206.198L201.839 580.808C190.996 591.651 176.759 597.087 162.552 597.087ZM437.552 597.087C423.345 597.087 409.108 591.651 398.265 580.808C376.578 559.092 376.578 523.92 398.265 502.234L498.134 402.364C519.82 380.678 555.023 380.648 576.709 402.364C598.395 424.08 598.395 459.252 576.709 480.938L476.839 580.808C465.996 591.651 451.759 597.087 437.552 597.087ZM123.265 316.25C134.108 327.093 148.345 332.53 162.552 332.53C176.759 332.53 190.996 327.093 201.839 316.25L311.891 206.198C333.577 184.512 333.577 149.31 311.891 127.624C290.205 105.938 255.003 105.938 233.317 127.624L123.265 237.676C101.578 259.362 101.578 294.564 123.265 316.25Z\" fill=\"white\"/></svg>";
}

//#endregion
//#region src/zaptime-init/utils/accountStatus.ts
const accountStatusMap = new Map();
const pendingCallbacks = new Map();
const fetchingTokens = new Set();
const API_BASE_URL = "https://api.zaptime.app";
/**
* Fetch account status from API
*/
async function fetchAccountStatus(token) {
	const cached = accountStatusMap.get(token);
	if (cached) return cached;
	if (fetchingTokens.has(token)) return new Promise((resolve) => {
		onAccountStatus(token, resolve);
	});
	fetchingTokens.add(token);
	try {
		const response = await fetch(`${API_BASE_URL}/event-types/init`, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
				Accept: "application/json"
			}
		});
		if (!response.ok) {
			console.warn(`[Zaptime] Failed to fetch account status: ${response.status}`);
			fetchingTokens.delete(token);
			return null;
		}
		const data = await response.json();
		const status = {
			isSubscribed: Boolean(data.data?.isSubscribed),
			disabled: Boolean(data.data?.disabled),
			token
		};
		accountStatusMap.set(token, status);
		fetchingTokens.delete(token);
		const callbacks = pendingCallbacks.get(token);
		if (callbacks) {
			callbacks.forEach((cb) => cb(status));
			pendingCallbacks.delete(token);
		}
		return status;
	} catch (error) {
		console.warn("[Zaptime] Error fetching account status:", error);
		fetchingTokens.delete(token);
		return null;
	}
}
/**
* Register a callback to be called when account status is received
*/
function onAccountStatus(token, callback) {
	const cached = accountStatusMap.get(token);
	if (cached) {
		callback(cached);
		return;
	}
	const existing = pendingCallbacks.get(token) || [];
	existing.push(callback);
	pendingCallbacks.set(token, existing);
}

//#endregion
//#region src/zaptime-init/styles/modal.ts
function createModalStyles(isDark) {
	const colors = isDark ? TOKENS.colors.dark : TOKENS.colors.light;
	return {
		backdrop: {
			position: "fixed",
			inset: "0",
			backgroundColor: colors.backdrop,
			zIndex: TOKENS.zIndex.modal,
			opacity: "0",
			transition: `opacity ${TOKENS.timing.fadeIn} ${TOKENS.easing.default}`
		},
		backdropVisible: { opacity: "1" },
		container: {
			position: "absolute",
			inset: "0",
			margin: "auto",
			backgroundColor: colors.modalBg,
			borderRadius: TOKENS.borderRadius.modal,
			boxShadow: TOKENS.shadows.modal,
			width: TOKENS.dimensions.modalWidth,
			maxWidth: TOKENS.dimensions.modalMaxWidth,
			height: TOKENS.dimensions.modalHeight,
			maxHeight: TOKENS.dimensions.modalMaxHeight,
			overflow: "hidden",
			transform: "scale(0.95)",
			transition: `transform ${TOKENS.timing.fadeIn} ${TOKENS.easing.default}, background-color ${TOKENS.timing.fadeIn} ${TOKENS.easing.default}`,
			display: "flex",
			alignItems: "center",
			justifyContent: "center"
		},
		containerVisible: { transform: "scale(1)" },
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
		this.isDark = this.options.config?.theme?.mode === "dark" || isDarkMode();
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
		if (!this.options.config?.theme?.mode) this.removeDarkModeListener = onDarkModeChange((isDark) => {
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
		if (this.backdrop) this.backdrop.style.display = "block";
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
	const customButtonColor = options.buttonColor || TOKENS.colors.buttonDefault;
	const customButtonTextColor = options.buttonTextColor || TOKENS.colors.white;
	const customButtonText = options.buttonText || "Book a Meeting";
	const id = generateUniqueId();
	let button = null;
	let modal = null;
	let isSubscribed = false;
	const token = options.config?.token;
	/**
	* Apply button styling based on subscription status
	* - If subscribed: use custom options provided by user
	* - If not subscribed: force Zaptime branding
	*/
	function applyButtonStyling() {
		if (!button) return;
		const positionStyles = position === "bottom-left" ? floatingButtonStyles.positionLeft : floatingButtonStyles.positionRight;
		if (isSubscribed) {
			const buttonStyles = mergeStyles(floatingButtonStyles.base, positionStyles, {
				backgroundColor: customButtonColor,
				color: customButtonTextColor
			});
			applyStyles(button, buttonStyles);
			button.innerHTML = "<span>" + customButtonText + "</span>";
		} else {
			const buttonStyles = mergeStyles(floatingButtonStyles.base, positionStyles, {
				background: "linear-gradient(134.86deg, #ff8d47, #ff7447 14.76%, #ff4247 45.41%, #e92a5b 63.69%, #dd1c67 74.04%, #d31071 84.3%, #cf0283)",
				boxShadow: "0 6px 10px rgba(9, 15, 35, 0.05)",
				color: TOKENS.colors.white,
				borderRadius: "0.5rem",
				padding: "12px 24px 12px 18px"
			});
			applyStyles(button, buttonStyles);
			button.innerHTML = getZaptimeFreeLogo() + "<span>Zaptime</span>";
		}
	}
	function createButton() {
		button = document.createElement("button");
		button.id = `${id}-button`;
		button.type = "button";
		applyButtonStyling();
		button.addEventListener("mouseenter", () => {
			if (button) {
				applyStyles(button, floatingButtonStyles.hover);
				if (!isSubscribed) button.style.background = "linear-gradient(100deg, #ff8d47, #ff7447 14.76%, #ff4247 45.41%, #e92a5b 63.69%, #dd1c67 74.04%, #d31071 84.3%, #cf0283)";
			}
		});
		button.addEventListener("mouseleave", () => {
			if (button) {
				button.style.transform = "";
				if (!isSubscribed) {
					button.style.boxShadow = "0 6px 10px rgba(9, 15, 35, 0.05)";
					button.style.background = "linear-gradient(134.86deg, #ff8d47, #ff7447 14.76%, #ff4247 45.41%, #e92a5b 63.69%, #dd1c67 74.04%, #d31071 84.3%, #cf0283)";
				} else button.style.boxShadow = TOKENS.shadows.button;
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
	function init() {
		if (token) fetchAccountStatus(token).then((status) => {
			if (status?.disabled) return;
			if (status) isSubscribed = status.isSubscribed;
			createButton();
		});
		else createButton();
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
	init();
	return {
		id,
		open,
		close,
		destroy
	};
}

//#endregion
//#region src/zaptime-init/components/InlineButton.ts
function createInlineButton(options) {
	const selector = options.selector;
	const customButtonColor = options.buttonColor || TOKENS.colors.buttonDefault;
	const customButtonTextColor = options.buttonTextColor || TOKENS.colors.white;
	const customButtonText = options.buttonText || "Book a Meeting";
	const id = generateUniqueId();
	let buttons = [];
	let modal = null;
	const token = options.config?.token;
	/**
	* Apply button styling with custom options
	* Only called for subscribed accounts (free accounts don't render InlineButton)
	*/
	function applyButtonStyling(button) {
		const buttonStyles = mergeStyles(inlineButtonStyles.base, {
			backgroundColor: customButtonColor,
			color: customButtonTextColor
		});
		applyStyles(button, buttonStyles);
		button.innerHTML = "<span>" + customButtonText + "</span>";
	}
	function createButtons() {
		const containers = document.querySelectorAll(selector);
		if (containers.length === 0) {
			console.warn(`Zaptime: No containers found for selector "${selector}"`);
			return;
		}
		containers.forEach((container, index) => {
			const button = document.createElement("button");
			button.id = `${id}-button-${index}`;
			button.type = "button";
			applyButtonStyling(button);
			button.addEventListener("mouseenter", () => {
				applyStyles(button, inlineButtonStyles.hover);
			});
			button.addEventListener("mouseleave", () => {
				button.style.transform = "";
				button.style.boxShadow = TOKENS.shadows.button;
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
			container.appendChild(button);
			buttons.push(button);
		});
	}
	function init() {
		if (!token) return;
		fetchAccountStatus(token).then((status) => {
			if (status?.disabled) return;
			if (!status?.isSubscribed) return;
			createButtons();
		});
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
		buttons.forEach((button) => {
			if (button.parentNode) button.parentNode.removeChild(button);
		});
		buttons = [];
		if (modal) {
			modal.destroy();
			modal = null;
		}
	}
	init();
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
Zaptime.inlineButton = function(options) {
	return createInlineButton(options);
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