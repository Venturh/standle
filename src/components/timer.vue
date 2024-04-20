<script setup lang="ts">
import { useEntries } from "@/composables/entries";
import { formatSeconds } from "@/utils";

import { Entry } from "@/services/entry";
import { StopIcon, PlayIcon } from "@heroicons/vue/24/solid";

const { currentEntry, toggleTimer, addEntry, addEntryPending } = useEntries();

const newEntry = reactive<Pick<Entry, "note" | "time_in_seconds" | "type">>({
  note: "",
  time_in_seconds: 0,
  type: "standing",
});

const isSubmitDisabled = computed(
  () => addEntryPending.value || (!currentEntry.value && !newEntry.note)
);

function onNoteChange(note: string | number) {
  newEntry.note = note as string;
}

function onSubmit() {
  if (currentEntry.value) return toggleTimer(currentEntry.value);
  addEntry(
    {
      ...newEntry,
      started_at: new Date().toISOString(),
    },
    {
      onSuccess: () => {
        newEntry.note = "";
        newEntry.time_in_seconds = 0;
      },
    }
  );
}
</script>

<template>
  <div class="pt-4">
    <form class="flex items-center space-x-2" @submit.prevent="onSubmit">
      <UiInput
        placeholder="Notiz"
        :modelValue="currentEntry?.note ?? newEntry.note ?? undefined"
        @update:modelValue="onNoteChange"
        :disabled="currentEntry"
      />

      <UiButton
        class="shrink-0"
        type="submit"
        :disabled="isSubmitDisabled"
        variant="default"
      >
        {{ currentEntry ? "Stop" : "Start" }}
        <component
          class="size-4 ml-2"
          :is="currentEntry ? StopIcon : PlayIcon"
        />
      </UiButton>
    </form>
    <div>
      <p class="text-5xl text-center mt-6">
        <span class="tabular-nums">
          {{ formatSeconds(currentEntry?.time_in_seconds, "hours") }}
          <span
            class="transition-opacity"
            :class="{
              'animate-[blink_2s_linear_infinite]': currentEntry?.started_at,
            }"
          >
            : </span
          >{{ formatSeconds(currentEntry?.time_in_seconds, "minutes") }}</span
        >
      </p>
    </div>
  </div>
</template>
