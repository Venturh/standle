<script setup lang="ts">
import { addMonths, format, subMonths } from "date-fns";
import { useEntries } from "@/composables/entries";
import { formatSeconds } from "@/utils";
import { Entry } from "./services/entry";

const { entries, currentEntry, selectedMonth } = useEntries();

const entriesByTrackedDate = computed(() => {
  const data = entries.value?.reduce((acc, entry) => {
    const isCurrentYear =
      new Date(entry.tracked_date).getFullYear() === new Date().getFullYear();
    const formatString = isCurrentYear ? "EEEE, dd.MM" : "EEEE, dd.MM, yyyy";
    const day = format(new Date(entry.tracked_date), formatString);
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(entry);
    return acc;
  }, {} as Record<string, Entry[]>);

  return Object.entries(data ?? {});
});

function totalSecondsForEntries(entries: Entry[]) {
  return entries.reduce(
    (acc, entry) =>
      acc +
      (entry.id === currentEntry.value?.id
        ? currentEntry.value!.time_in_seconds
        : entry.time_in_seconds),
    0
  );
}

function showPreviousMonth() {
  selectedMonth.value = format(
    subMonths(new Date(selectedMonth.value), 1),
    "yyyy-MM"
  );
}
function showNextMonth() {
  selectedMonth.value = format(
    addMonths(new Date(selectedMonth.value), 1),
    "yyyy-MM"
  );
}

const isDev = process.env.NODE_ENV === "development";
</script>

<template>
  <div class="flex flex-col max-w-md mx-auto overflow-hidden h-screen">
    <span v-if="isDev" class="text-lg absolute bottom-1 left-1"> Dev </span>

    <div class="flex items-center justify-center">
      <span class="isolate inline-flex rounded-md shadow-sm">
        <UiButton
          type="button"
          class="!rounded-l-md !rounded-none"
          variant="outline"
          @click="showPreviousMonth"
        >
          Previous
        </UiButton>
        <div
          class="relative -ml-px inline-flex items-center px-3 text-sm font-medium border border-input"
        >
          {{ format(new Date(selectedMonth), "MMMM yyyy") }}
        </div>
        <UiButton
          type="button"
          class="!rounded-r-md !rounded-none"
          variant="outline"
          @click="showNextMonth"
        >
          Next
        </UiButton>
      </span>
    </div>

    <Timer class="sticky top-0 px-4" />
    <div class="w-full h-0.5 bg-border my-6" />
    <div class="overflow-y-auto hide-scrollbar h-full px-4">
      <div v-if="Object.keys(entriesByTrackedDate).length > 0">
        <UiAccordion
          type="multiple"
          class="w-full"
          collapsible
          :default-value="[entriesByTrackedDate[0][0]]"
        >
          <UiAccordionItem
            v-for="[date, entries] in entriesByTrackedDate"
            :key="date"
            :value="date"
          >
            <UiAccordionTrigger class="text-base">
              {{ date }}
              <template #trigger>
                <span>
                  {{ formatSeconds(totalSecondsForEntries(entries)) }}
                </span>
              </template>
            </UiAccordionTrigger>
            <UiAccordionContent>
              <ul class="divide-y">
                <EntryCard
                  v-for="entry in entries"
                  :entry="entry"
                  :key="entry.id"
                />
              </ul>
            </UiAccordionContent>
          </UiAccordionItem>
        </UiAccordion>
      </div>
    </div>
  </div>
</template>
