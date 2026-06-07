import { useMutation } from "@tanstack/react-query";
import { generatePrepPlan } from "./api";

export function useGeneratePrepMutation() {
  return useMutation({
    mutationFn: (jobRole: string) => generatePrepPlan(jobRole),
  });
}
