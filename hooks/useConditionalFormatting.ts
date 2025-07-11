import { useMemo } from "react";
import type { ConditionalFormatRule } from "@/types/widget";

export const useConditionalFormatting = (
  conditionalFormats: ConditionalFormatRule[] = []
) => {
  const getConditionalStyle = useMemo(
    () =>
      (columnId: string, value: unknown): React.CSSProperties => {
        let finalStyle: React.CSSProperties = {};

        if (conditionalFormats.length === 0) {
          return finalStyle;
        }

        for (const format of conditionalFormats) {
          if (!format.isEnabled || format.columnId !== columnId) {
            continue;
          }

          const numericValue = Number(value);
          const numericRuleValue = Number(format.value);
          let conditionMet = false;

          switch (format.condition) {
            case "greater_than":
              if (!isNaN(numericValue) && !isNaN(numericRuleValue)) {
                conditionMet = numericValue > numericRuleValue;
              }
              break;
            case "less_than":
              if (!isNaN(numericValue) && !isNaN(numericRuleValue)) {
                conditionMet = numericValue < numericRuleValue;
              }
              break;
            case "equals":
              // eslint-disable-next-line eqeqeq
              conditionMet = value == format.value;
              break;
            case "contains":
              conditionMet = String(value)
                .toLowerCase()
                .includes(String(format.value).toLowerCase());
              break;
          }

          if (conditionMet) {
            finalStyle = {
              backgroundColor: format.style.backgroundColor,
              color: format.style.textColor,
              fontWeight: format.style.fontWeight,
              fontStyle: format.style.fontStyle,
            };
            // Break after applying the first matching format
            break;
          }
        }

        return finalStyle;
      },
    [conditionalFormats]
  );

  return { getConditionalStyle };
};
