import { useState, useCallback } from "react";
import type { UseTabNavigationOptions } from "@/components/widgets/config/base/types";

export const useTabNavigation = (options: UseTabNavigationOptions = {}) => {
  const { defaultTab = "data", onTabChange } = options;
  const [activeTab, setActiveTab] = useState(defaultTab);

  const handleTabChange = useCallback(
    (tabId: string) => {
      setActiveTab(tabId);
      onTabChange?.(tabId);
    },
    [onTabChange]
  );

  return {
    activeTab,
    setActiveTab: handleTabChange,
  };
};
