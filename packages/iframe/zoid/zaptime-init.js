var Zaptime = zoid.create({
  tag: "zaptime-component",
  url: "https://iframe.zaptime.app",
  dimensions: {
    width: "880px",
    height: "570px",
  },

  props: {
    config: {
      type: "object",
      required: true,
    },
    onEventChanged: {
      type: "function",
      required: false,
    },
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
