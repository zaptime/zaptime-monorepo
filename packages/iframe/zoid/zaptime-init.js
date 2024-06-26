var Zaptime = zoid.create({
  tag: "zaptime-component",
  url: "https://iframe.zaptime.app",

  dimensions: {
    width: "100%",
    height: "100%",
  },

  autoResize:{
    width: false,
    height: true
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
      default: function() {
        return "center";
      }
    }
  },
});

window.ZaptimePugin = {
  postMessage(action, data) {
    var iframe = document.querySelector(".zoid-visible");

    if (iframe) {
      iframe.contentWindow.postMessage(
        {
          action,
          data,
        },
        "*"
      );
    }
  },

  book: function (payload) {
    this.postMessage("book", payload);
  },
  reserve: function (payload) {
    this.postMessage("reserve", payload);
  },
  confirm: function (payload) {
    this.postMessage("confirm", payload);
  },
  cancel: function (payload) {
    this.postMessage("cancel", payload);
  },
};
