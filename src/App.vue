<script setup lang="ts">
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { useEntries } from "./composables/entries";
import { EntryService } from "./services/entry";

const { entries } = useEntries();

const queryClient = useQueryClient();
const { mutate, isPending } = useMutation({
  mutationFn: EntryService.add,
  onError: (error) => {
    console.error(error);
  },
  onSuccess: () => {
    queryClient.invalidateQueries();
  },
});
</script>

<template>
  <div class="flex flex-col p-2">
    <pre>{{ entries }}</pre>
    <button
      type="button"
      @click="mutate({ note: 'Test', time_in_seconds: 60 })"
      :disabled="isPending"
    >
      Add Entry
    </button>
  </div>
</template>
