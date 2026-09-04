interface CustomStyle {
  "--c": string;
  background: string;
  backgroundSize: string;
  backgroundRepeat: string;
  animation: string;
}
import { cn } from "@/lib/utils";

const DataLoader = ({ className }: { className?: string }) => {
  //   const sharedStyle: React.CSSProperties = {
  //     content: "",
  //     width: "100%",
  //     height: "100%",
  //     display: "block",
  //     border: "5.6px solid #3B9DF8",
  //     borderRadius: "50%",
  //     boxShadow: "0 -33.6px 0 -5.6px #3B9DF8",
  //     position: "absolute", // or 'relative', 'fixed', etc.
  //     animation: "spinner-rotate 1.25s infinite ease",
  //   };

  return (
           <div
      className={cn(
        "flex justify-center items-center min-h-[250px] lg:min-h-[500px]",
        className
      )}
    >

        <div
          className="w-[66px] h-[66px]"
          style={
            {
              "--c": "radial-gradient(farthest-side, #011C28 80%, transparent)",
              background: `
                var(--c) 50% 0,
                var(--c) 50% 100%,
                var(--c) 100% 50%,
                var(--c) 0 50%
            `,
              backgroundSize: "18px 18px",
              backgroundRepeat: "no-repeat",
              animation: "spinner-kh173p 1s infinite",
            } as CustomStyle
          }
        >
          <style>
            {`
        @keyframes spinner-kh173p {
          to {
            transform: rotate(0.5turn);
            }
          }
          `}
          </style>
        </div>
      </div>
  );
};

export default DataLoader;
