"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut } from "lucide-react";
import GameButton from "@/components/ui/GameButton";

export default function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const supabase = createClient();

  const handleLogout = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <>
      <GameButton 
        variant="ghost" 
        size="sm" 
        className="hover:!text-danger-400 hover:!bg-danger-500/10 transition-colors"
        onClick={() => setShowConfirm(true)} 
      >
        Log Out
      </GameButton>

      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isLoading && setShowConfirm(false)}
              className="absolute inset-0 bg-void/80 backdrop-blur-sm"
            />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-sm bg-shadow border border-danger-500/30 rounded-card p-6 shadow-glow-sm overflow-hidden"
            >
              {/* Decorative top border glow */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-danger-500/0 via-danger-500 to-danger-500/0 opacity-50" />
              
              <h3 className="font-display text-xl text-parchment mb-2 flex items-center gap-2">
                <LogOut className="w-6 h-6 text-danger-400" /> Leave the Arena?
              </h3>
              
              <p className="text-mist text-sm mb-6 leading-relaxed">
                Are you sure you want to log out? You will need to re-authenticate with Google to cast spells again.
              </p>
              
              <div className="flex items-center justify-end gap-3">
                <GameButton 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowConfirm(false)}
                  disabled={isLoading}
                >
                  Stay
                </GameButton>
                <GameButton 
                  variant="danger" 
                  size="sm" 
                  onClick={handleLogout}
                  isLoading={isLoading}
                >
                  Log Out
                </GameButton>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
