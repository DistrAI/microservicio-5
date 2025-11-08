import type { Metadata } from "next";
import { DashboardHydrator } from "./DashboardHydrator";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardHydrator>{children}</DashboardHydrator>;
}
