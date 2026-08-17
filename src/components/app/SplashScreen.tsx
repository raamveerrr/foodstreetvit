import { useCatalog } from "@/lib/catalog-store";
import { useAuth } from "@/lib/auth-store";
import { motion, AnimatePresence } from "motion/react";
import { UtensilsCrossed } from "lucide-react";
import { useState, useEffect } from "react";

export function SplashScreen() {
    const { loading: catalogLoading } = useCatalog();
    const { ready: authReady } = useAuth();

    const [minTimeElapsed, setMinTimeElapsed] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setMinTimeElapsed(true);
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    // We want to show the splash screen while EITHER auth or catalog is still initializing,
    // or if the minimum 1.5s visual display time hasn't passed yet.
    const showSplash = !minTimeElapsed || catalogLoading || !authReady;

    return (
        <AnimatePresence>
            {showSplash && (
                <motion.div
                    key="splash"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.35, ease: "easeInOut" }}
                    className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-[#fff7f0] via-white to-[#ffe5cf]"
                >
                    <motion.div
                        initial={{ scale: 0.85, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
                        className="flex flex-col items-center"
                    >
                        <div className="flex h-24 w-24 items-center justify-center rounded-[2rem] bg-primary/10 shadow-sm border border-primary/20">
                            <UtensilsCrossed size={45} className="text-primary" strokeWidth={2.5} />
                        </div>

                        <h1 className="mt-6 text-xl font-medium tracking-tight text-foreground/90">
                            DigitalFoodStreet
                        </h1>

                        <div className="mt-6">
                            <motion.p
                                initial={{ scale: 0.5, y: 30, opacity: 0 }}
                                animate={{ scale: 1, y: 0, opacity: 1 }}
                                transition={{ type: "spring", bounce: 0.65, duration: 1, delay: 0.3 }}
                                className="text-4xl font-black italic tracking-tighter text-primary"
                                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                            >
                                Welcome Foodie's
                            </motion.p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
