<script setup lang="ts">
import { type HTMLAttributes, computed } from "vue";
import {
  AccordionItem,
  type AccordionItemProps,
  useForwardProps,
} from "radix-vue";
import { cn } from "@/utils";

const props = defineProps<
  AccordionItemProps & { class?: HTMLAttributes["class"] }
>();

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props;

  return delegated;
});

const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
  <AccordionItem
    v-bind="forwardedProps"
    :class="cn('bg-muted rounded-lg border-2 border-border  mt-3', props.class)"
  >
    <slot />
  </AccordionItem>
</template>
