"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="flex items-center gap-2 text-mist hover:text-white transition-colors mb-6 group"
    >
      <div className="p-2 rounded-lg bg-void border border-storm/30 group-hover:border-arcane-500/50 transition-colors">
        <ArrowLeft className="w-4 h-4" />
      </div>
      <span className="font-bold text-sm uppercase tracking-wider">Go Back</span>
    </button>
  );
}
