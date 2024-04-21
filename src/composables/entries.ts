import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { createGlobalState } from "@vueuse/core";
import { Entry, EntryService } from "@/services/entry";
import { format } from "date-fns";

export const useEntries = createGlobalState(() => {
  const selectedMonth = ref(format(new Date(), "yyyy-MM"));

  const date = computed(() => format(selectedMonth.value, "MM-yyyy"));

  const { data: entries, isLoading } = useQuery({
    queryKey: ["entries", date],
    //@ts-expect-error later
    queryFn: EntryService.getAllByDate,
    initialData: [],
  });

  const queryClient = useQueryClient();

  const currentEntry = ref<Entry>();
  let intervalId: NodeJS.Timeout | null = null;

  const { mutate: addEntry, isPending: addEntryPending } = useMutation({
    mutationFn: EntryService.add,
    onError: (error) => {
      console.error(error);
    },
    onSuccess: (entry) => {
      console.log("entry", entry);
      startTimer(entry, false);
      queryClient.invalidateQueries();
    },
  });

  const { mutate: editEntry, isPending: editEntryPending } = useMutation({
    mutationFn: EntryService.update,
    onError: (error) => {
      console.error(error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });

  const { mutate: destroyEntry, isPending: destroyEntryPending } = useMutation({
    mutationFn: EntryService.destroy,
    onError: (error) => {
      console.error(error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });

  const totalSeconds = computed(() => {
    let total =
      entries.value
        ?.filter((entry) => entry.id !== currentEntry.value?.id)
        .reduce((acc, entry) => acc + entry.time_in_seconds, 0) ?? 0;
    if (currentEntry.value?.time_in_seconds) {
      total += currentEntry.value.time_in_seconds;
    }
    return total;
  });

  function startTimer(entry: Entry, commit = false) {
    if (currentEntry.value) {
      stopTimer(currentEntry.value);
    }

    const startedAt = new Date().toISOString();
    if (commit) {
      editEntry({
        ...entry,
        started_at: startedAt,
      });
    }

    currentEntry.value = { ...entry, started_at: startedAt };

    intervalId = setInterval(() => {
      if (currentEntry.value) {
        const isDevelopment = process.env.NODE_ENV === "development";
        currentEntry.value.time_in_seconds += isDevelopment ? 30 : 1;
      }
    }, 1000);
  }

  function stopTimer(entry: Entry) {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }

    editEntry({
      ...entry,
      time_in_seconds: currentEntry.value!.time_in_seconds,
      started_at: null,
    });

    currentEntry.value = undefined;
  }

  function toggleTimer(entry: Entry) {
    if (entry.started_at) {
      stopTimer(entry);
    } else {
      startTimer(entry, true);
    }
  }

  watch(
    () => entries.value,
    () => {
      const runningEntry = entries.value?.find((entry) => entry.started_at);
      if (currentEntry.value && currentEntry.value.id !== runningEntry?.id) {
        stopTimer(currentEntry.value);
      }
      if (!currentEntry.value && runningEntry) {
        currentEntry.value = runningEntry;
        startTimer(currentEntry.value);
      }
    }
  );

  onUnmounted(() => {
    if (currentEntry.value) {
      stopTimer(currentEntry.value);
    }
  });

  return {
    entries,
    isLoading,
    currentEntry,
    totalSeconds,
    toggleTimer,
    stopTimer,
    startTimer,
    addEntry,
    addEntryPending,
    editEntry,
    editEntryPending,
    destroyEntry,
    destroyEntryPending,
    selectedMonth,
  };
});
