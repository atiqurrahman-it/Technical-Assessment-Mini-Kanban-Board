'use client';
import { cn } from "@/lib/utils"

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface TabItem {
  value: string;
  label: string | React.ReactNode;
  content: React.ReactNode;
}

interface ReusableTabsProps {
  tabs: TabItem[];
  defaultValue?: string;
  tabsStyle?: string;
  triggerStyle?: string;
  setCategory?: (category: string) => void;
}

const ReusableTabs = ({
  tabs,
  defaultValue,
  tabsStyle,
  triggerStyle,
  setCategory,
}: ReusableTabsProps) => {
  return (
    <Tabs
      onValueChange={(value) => {
        setCategory?.(value);
      }}
      defaultValue={defaultValue ?? tabs[0]?.value}
      className={tabsStyle}
    >
      <div className="w-full overflow-x-auto scrollbar-hide">
        <TabsList
          className={cn(
            "flex w-max min-w-full bg-[#F1F5F9] rounded-md min-h-15",
            triggerStyle
          )}
        >
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="min-h-10 p-2 rounded-md whitespace-nowrap"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value}>
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default ReusableTabs;