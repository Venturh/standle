<script setup lang="ts">
import { buttonVariants } from "./index";
import { cn } from "@/utils";

interface Props {
  variant?: NonNullable<Parameters<typeof buttonVariants>[0]>["variant"];
  size?: NonNullable<Parameters<typeof buttonVariants>[0]>["size"];
  as?: string;
  rounded?: boolean;
}

// eslint-disable-next-line vue/define-macros-order
withDefaults(defineProps<Props>(), {
  as: "button",
});
</script>

<template>
  <component
    :is="as"
    :class="
      cn(
        buttonVariants({ variant, size }),
        { '!rounded-full': rounded },
        $attrs.class ?? ''
      )
    "
  >
    <slot />
  </component>
</template>
