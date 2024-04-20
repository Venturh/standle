<script setup lang="ts">
import { type HTMLAttributes, computed } from "vue";
import {
  AccordionHeader,
  AccordionTrigger,
  type AccordionTriggerProps,
} from "radix-vue";
import { ChevronDownIcon } from "@radix-icons/vue";
import { cn } from "@/utils";

const props = defineProps<
  AccordionTriggerProps & { class?: HTMLAttributes["class"] }
>();

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props;

  return delegated;
});
</script>

<template>
  <AccordionHeader class="flex">
    <AccordionTrigger
      v-bind="delegatedProps"
      :class="
        cn(
          'flex flex-1 px-4 items-center  justify-between py-4 text-sm font-medium transition-all [&[data-state=open]>svg]:rotate-180 data-[state=open]:border-b-2 data-[state=open]:border-border',
          props.class
        )
      "
    >
      <slot />
      <slot name="icon">
        <div class="flex items-center space-x-4">
          <slot name="trigger" />
          <ChevronDownIcon
            class="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200"
          />
        </div>
      </slot>
    </AccordionTrigger>
  </AccordionHeader>
</template>
