<script setup lang="ts">
//@ts-expect-error ok
import ApexChart from "vue3-apexcharts";
import type { ApexOptions } from "apexcharts";
import { useEntries } from "@/composables/entries";
import { Entry } from "@/services/entry";
import { format, isBefore } from "date-fns";
import { formatSeconds } from "@/utils";

const isDark = useDark();
const { entries } = useEntries();

const data = computed(() => {
  return entries.value?.reduce((acc, entry) => {
    const day = format(new Date(entry.tracked_date), "yyyy-MM-dd");
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(entry);
    return acc;
  }, {} as Record<string, Entry[]>);
});

const categories = computed(() =>
  Object.keys(data.value ?? {}).sort((a, b) =>
    isBefore(new Date(a), new Date(b)) ? -1 : 1
  )
);

const borderColor = computed(() => (isDark.value ? "#3f3f46" : "#e4e4e7"));
const backgroundColor = computed(() => (isDark.value ? "#18181b" : "#fff"));

const series = computed(() => {
  return [
    {
      name: "Standing",
      data: categories.value.map((category) =>
        data.value?.[category].reduce(
          (acc, entry) =>
            acc + (entry.type === "standing" ? entry.time_in_seconds : 0),
          0
        )
      ),
    },
    {
      name: "Sitting",
      data: categories.value.map((category) =>
        data.value?.[category].reduce(
          (acc, entry) =>
            acc + (entry.type === "sitting" ? entry.time_in_seconds : 0),
          0
        )
      ),
    },
  ];
});

const chartOptions: ApexOptions = {
  chart: {
    type: "bar",
    background: backgroundColor.value,
    height: 350,
    stacked: true,
    toolbar: {
      show: false,
    },
    zoom: {
      enabled: false,
    },
  },
  noData: {
    text: "No data",
  },
  plotOptions: {
    bar: {
      horizontal: false,
    },
  },
  dataLabels: {
    enabled: false,
  },
  tooltip: {
    y: {
      formatter: (value) => {
        console.log(value);
        return formatSeconds(value);
      },
    },
  },
  xaxis: {
    labels: {
      formatter: (value) => {
        return format(new Date(value), "ccc dd.MM");
      },
    },
    type: "category",
    axisBorder: {
      color: borderColor.value,
    },
    axisTicks: {
      show: false,
    },
    categories: categories.value,
  },
  legend: {
    position: "bottom",
    offsetX: -10,
    offsetY: 0,
  },
  fill: {
    opacity: 1,
  },
  theme: {
    mode: isDark.value ? "dark" : "light",
    palette: "palette1",
  },
  grid: {
    borderColor: borderColor.value,
  },
};
</script>

<template>
  <ApexChart width="100%" :options="chartOptions" :series="series" />
</template>
