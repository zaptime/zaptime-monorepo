# Zaptime Embedding Modes

Zaptime can be embedded on your website in three different ways: **Inline**, **Floating Button**, and **Popup**. Each mode serves different use cases.

## Quick Start

Add the Zaptime script to your page:

```html
<script src="https://iframe.zaptime.app/zaptime.js"></script>
```

## 1. Inline Mode

Renders the calendar directly inside a container element on your page.

### Basic Usage

```html
<div id="calendar-container"></div>

<script>
Zaptime({
  type: 'single',
  config: {
    token: 'YOUR_TOKEN'
  }
}).render('#calendar-container');
</script>
```

### Options

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `type` | `'single'` \| `'group'` | No | Event type. Use `'single'` for single event types, `'group'` for grouped events. |
| `config` | `object` | Yes | Configuration object containing at minimum the `token`. |
| `config.token` | `string` | Yes | Your Zaptime calendar token. |
| `onEventChanged` | `function` | No | Callback fired when the selected event changes. |

---

## 2. Floating Button Mode

Displays a floating button fixed to the bottom of the screen. Clicking it opens the calendar in a modal.

### Basic Usage

```html
<script>
var floatingCalendar = Zaptime.floatingButton({
  type: 'single',
  config: {
    token: 'YOUR_TOKEN'
  }
});
</script>
```

### Customization

```html
<script>
var floatingCalendar = Zaptime.floatingButton({
  type: 'single',
  config: {
    token: 'YOUR_TOKEN'
  },

  // Position: 'bottom-right' (default) or 'bottom-left'
  position: 'bottom-left',

  // Button appearance (PRO feature - free tier shows Zaptime branding)
  buttonText: 'Schedule a Call',    // Custom text
  buttonColor: '#6366f1',           // Background color
  buttonTextColor: '#ffffff',       // Text color

  // Event callbacks
  onOpen: function() {
    console.log('Modal opened');
  },
  onClose: function() {
    console.log('Modal closed');
  }
});
</script>
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `type` | `'single'` \| `'group'` | - | Event type. |
| `config` | `object` | - | Configuration object with `token`. |
| `position` | `'bottom-right'` \| `'bottom-left'` | `'bottom-right'` | Button position on screen. |
| `buttonText` | `string` | `'Book a Meeting'` | Button label (PRO feature). |
| `buttonColor` | `string` | `'#15B79E'` | Button background color (PRO feature). |
| `buttonTextColor` | `string` | `'#FFFFFF'` | Button text color (PRO feature). |
| `onOpen` | `function` | - | Callback when modal opens. |
| `onClose` | `function` | - | Callback when modal closes. |
| `onEventChanged` | `function` | - | Callback when selected event changes. |

### Programmatic Control

```javascript
// Open the modal programmatically
floatingCalendar.open();

// Close the modal
floatingCalendar.close();

// Remove the floating button and modal from the page
floatingCalendar.destroy();

// Get the instance ID
console.log(floatingCalendar.id);
```

---

## 3. Popup Mode

Binds click handlers to existing elements on your page. When clicked, they open the calendar in a modal.

### Basic Usage

```html
<!-- Add data-zaptime-link to any element -->
<a href="#" data-zaptime-link>Book a meeting</a>
<button data-zaptime-link>Schedule now</button>

<script>
var popup = Zaptime.popup({
  type: 'single',
  config: {
    token: 'YOUR_TOKEN'
  }
});
</script>
```

### Custom Selector

```html
<button class="booking-trigger">Book Now</button>
<a class="booking-trigger" href="#">Schedule a Call</a>

<script>
var popup = Zaptime.popup({
  type: 'single',
  config: {
    token: 'YOUR_TOKEN'
  },
  selector: '.booking-trigger',
  onOpen: function() {
    console.log('Popup opened');
  },
  onClose: function() {
    console.log('Popup closed');
  }
});
</script>
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `type` | `'single'` \| `'group'` | - | Event type. |
| `config` | `object` | - | Configuration object with `token`. |
| `selector` | `string` | `'[data-zaptime-link]'` | CSS selector for trigger elements. |
| `onOpen` | `function` | - | Callback when modal opens. |
| `onClose` | `function` | - | Callback when modal closes. |
| `onEventChanged` | `function` | - | Callback when selected event changes. |

### Programmatic Control

```javascript
// Open the modal programmatically
popup.open();

// Close the modal
popup.close();

// Remove all bindings and the modal
popup.destroy();
```

### Dynamic Elements

Popup mode automatically binds to dynamically added elements using MutationObserver. Any element matching the selector that's added to the DOM after initialization will automatically work.

```javascript
// Initialize popup mode
var popup = Zaptime.popup({
  type: 'single',
  config: { token: 'YOUR_TOKEN' }
});

// Later, dynamically add a link - it will automatically work
var link = document.createElement('a');
link.setAttribute('data-zaptime-link', '');
link.textContent = 'Book now';
document.body.appendChild(link);
// ^ This link will open the calendar when clicked
```

---

## Modal Behavior

Both **Floating Button** and **Popup** modes use the same modal component with these features:

- **Click outside to close**: Clicking the backdrop closes the modal
- **Escape key**: Press `Escape` to close the modal
- **Close button**: X button in the top-right corner
- **Scroll lock**: Page scrolling is disabled while modal is open
- **Smooth animations**: Fade and scale transitions

---

## ZaptimePlugin API

For advanced integrations, you can programmatically trigger booking actions:

```javascript
// Book a time slot
ZaptimePlugin.book({
  // booking payload
});

// Reserve a time slot
ZaptimePlugin.reserve({
  // reservation payload
});

// Confirm a reservation
ZaptimePlugin.confirm({
  // confirmation payload
});

// Cancel a booking
ZaptimePlugin.cancel({
  // cancellation payload
});
```

---

## Complete Example

```html
<!DOCTYPE html>
<html>
<head>
  <title>Zaptime Demo</title>
</head>
<body>
  <h1>Book a Meeting</h1>

  <!-- Inline calendar -->
  <div id="calendar"></div>

  <!-- Popup triggers -->
  <p>
    Or <a href="#" data-zaptime-link>click here</a> to open in a modal.
  </p>

  <script src="https://iframe.zaptime.app/zaptime.js"></script>
  <script>
    var config = { token: 'YOUR_TOKEN' };

    // Inline mode
    Zaptime({
      type: 'single',
      config: config
    }).render('#calendar');

    // Floating button
    var floating = Zaptime.floatingButton({
      type: 'single',
      config: config,
      position: 'bottom-right'
    });

    // Popup mode for data-zaptime-link elements
    var popup = Zaptime.popup({
      type: 'single',
      config: config
    });
  </script>
</body>
</html>
```
