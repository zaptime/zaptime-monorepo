const shared = require("../../shared/calendar-ui/tailwind.config.cjs");
module.exports = { ...shared, plugins: [require("@tailwindcss/forms")({ strategy: "class" })] };
