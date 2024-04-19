//@ts-expect-error ok
import { devtools } from "@vue/devtools";
import { createApp } from "vue";
import { VueQueryPlugin } from "@tanstack/vue-query";
import App from "./App.vue";

import "./assets/main.postcss";

if (process.env.NODE_ENV === "development") {
  devtools.connect("http://localhost", 8098);
}

createApp(App).use(VueQueryPlugin).mount("#app");
