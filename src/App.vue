<script setup lang="ts">
import { format } from "date-fns";
import { useEntries } from "@/composables/entries";
import { formatSeconds } from "@/utils";
import { Entry } from "./services/entry";

const { entries } = useEntries();

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
  return entries.reduce((acc, entry) => acc + entry.time_in_seconds, 0);
}
</script>

<template>
  <div class="flex flex-col max-w-md mx-auto overflow-hidden h-screen">
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
