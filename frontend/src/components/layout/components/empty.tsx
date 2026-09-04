import { cn } from "@/lib/utils";
// import { Empty } from "antd";

const NoDataComponent = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "min-h-[250px] lg:min-h-[400px] flex justify-center items-center",
        className,
      )}
    >
      empty
      {/* <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} /> */}
    </div>
  );
};

export default NoDataComponent;
