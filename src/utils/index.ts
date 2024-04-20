import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatSeconds(
  seconds = 0,
  part?: "hours" | "minutes" | null,
  seperator = ":"
) {
  const minutes = seconds / 60;

  const hourString = (minutes / 60).toString().split(".")[0];
  const minuteString = (Math.floor(Math.abs(minutes)) % 60)
    .toString()
    .padStart(2, "0");

  if (part === "hours") return hourString;
  if (part === "minutes") return minuteString;

  return `${hourString}${seperator}${minuteString}`;
}
