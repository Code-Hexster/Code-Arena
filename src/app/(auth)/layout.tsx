import MagicalBackground from "@/components/ui/MagicalBackground";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden text-parchment">
      <MagicalBackground />
      <div className="relative z-10 w-full max-w-md px-4">{children}</div>
    </div>
  );
}
