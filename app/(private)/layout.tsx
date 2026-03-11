import Sidebar from "@/components/Sidebar";
import { ReactNode } from "react";

const PrivateLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="w-full flex h-full">
      <Sidebar />

      {children}
    </div>
  );
};

export default PrivateLayout;
