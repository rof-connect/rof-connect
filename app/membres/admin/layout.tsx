import { NavDirection } from "@/components/admin/NavDirection";

export default function DirectionLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavDirection />
      {children}
    </>
  );
}
