<script setup lang="ts">
import { useEntries } from "@/composables/entries";
import { Entry } from "@/services/entry";
import { formatSeconds } from "@/utils";
import {
  StopIcon,
  PlayIcon,
  EllipsisVerticalIcon,
} from "@heroicons/vue/24/solid";

const props = defineProps<{
  entry: Entry;
}>();

const {
  currentEntry,
  toggleTimer,
  editEntry,
  editEntryPending,
  destroyEntry,
  destroyEntryPending,
} = useEntries();

const type = {
  sitting: "Sitting",
  standing: "Standing",
};

const trackedDateTime = computed(() =>
  new Date(props.entry.tracked_date).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  })
);
</script>

<template>
  <li class="py-2" :key="entry.id">
    <div class="flex justify-between items-center">
      <div>
        <span :title="trackedDateTime.toString()" class="text-base">
          {{ entry.note }}
        </span>
        <UiBadge class="ml-2" variant="outline">{{ type[entry.type] }}</UiBadge>
      </div>
      <div class="flex items-center">
        <p>
          {{
            formatSeconds(
              currentEntry?.id === entry.id
                ? currentEntry?.time_in_seconds
                : entry.time_in_seconds
            )
          }}
        </p>

        <UiButton
          class="ml-2"
          variant="ghost"
          size="icon-sm"
          @click="toggleTimer(entry)"
        >
          <component
            class="text-muted-foreground size-5"
            :is="entry.started_at ? StopIcon : PlayIcon"
          />
        </UiButton>
        <UiDropdownMenu>
          <UiDropdownMenuTrigger as-child>
            <UiButton variant="ghost" size="icon-sm">
              <EllipsisVerticalIcon class="size-5" />
            </UiButton>
          </UiDropdownMenuTrigger>
          <UiDropdownMenuContent class="w-56">
            <UiDropdownMenuGroup>
              <UiDropdownMenuItem
                :disabled="editEntryPending"
                @click="
                  editEntry({
                    note: 'lel',
                    started_at: entry.started_at,
                    id: entry.id,
                    time_in_seconds: 300,
                    type: 'sitting',
                  })
                "
              >
                Edit
              </UiDropdownMenuItem>
              <UiDropdownMenuItem
                @click="destroyEntry(entry.id!)"
                :disabled="destroyEntryPending"
              >
                Delete
              </UiDropdownMenuItem>
            </UiDropdownMenuGroup>
          </UiDropdownMenuContent>
        </UiDropdownMenu>
      </div>
    </div>
  </li>
</template>
