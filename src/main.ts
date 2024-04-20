import { createApp } from "vue";
import { VueQueryPlugin } from "@tanstack/vue-query";
import App from "./App.vue";

import "./assets/main.postcss";

createApp(App).use(VueQueryPlugin).mount("#app");
