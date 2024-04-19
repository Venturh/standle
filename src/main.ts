//@ts-expect-error ok
import { devtools } from "@vue/devtools";
import { createApp } from "vue";
import App from "./App.vue";

import "./assets/main.postcss";

console.log("NODE_ENV", process.env.NODE_ENV);
if (process.env.NODE_ENV === "development") {
  devtools.connect("http://localhost", 8098);
}

createApp(App).mount("#app");
