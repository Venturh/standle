import { useQuery } from "@tanstack/vue-query";
import { EntryService } from "../services/entry";

export function useEntries() {
  const {
    data: entries,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["entries"],
    queryFn: EntryService.getAll,
    initialData: [],
  });

  return { entries, isLoading, isError };
}
