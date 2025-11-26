import React, { useEffect, useState } from "react";

const LoadingOverlay = ({ progress, isVisible }) => {
    const [animatedProgress, setAnimatedProgress] = useState(0);
    const [isDisplayed, setIsDisplayed] = useState(false);

    // Handle visibility start
    useEffect(() => {
        if (isVisible) {
            setIsDisplayed(true);
        }
    }, [isVisible]);

    // Handle animation
    useEffect(() => {
        let animationFrame;
        const update = () => {
            setAnimatedProgress((prev) => {
                // If loading is done (!isVisible), target is always 100 to finish the animation
                const target = isVisible ? progress : 100;

                // RESET: If target is significantly lower than prev, it means a new loading session started.
                // Snap immediately to the new target (usually 0).
                if (target < prev && isVisible) {
                    return target;
                }

                if (prev >= target) {
                    return prev;
                }

                const diff = target - prev;
                // Smooth easing: slower as it gets closer, but minimum speed to ensure it finishes
                const step = Math.max(0.5, diff * 0.08);
                return Math.min(prev + step, 100);
            });
            animationFrame = requestAnimationFrame(update);
        };

        update();
        return () => cancelAnimationFrame(animationFrame);
    }, [progress, isVisible]);

    // Handle hiding when done
    useEffect(() => {
        if (!isVisible && animatedProgress >= 100) {
            // Small delay to ensure the user sees the 100% completion
            const timer = setTimeout(() => {
                setIsDisplayed(false);
                setAnimatedProgress(0);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [isVisible, animatedProgress]);

    if (!isDisplayed) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-indigo-50 transition-all duration-500">
            {/* Animated Background Blobs */}
            <div className="absolute top-[-20%] left-[-10%] w-[40rem] h-[40rem] bg-purple-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
            <div
                className="absolute top-[-20%] right-[-10%] w-[40rem] h-[40rem] bg-indigo-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"
                style={{ animationDelay: "2s" }}
            ></div>
            <div
                className="absolute -bottom-32 left-[20%] w-[40rem] h-[40rem] bg-pink-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"
                style={{ animationDelay: "4s" }}
            ></div>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center gap-4 p-12">
                {/* Text Progress Bar */}
                <div className="relative">
                    {/* Reflection/Glow effect behind */}
                    <h1
                        className="absolute inset-0 text-3xl md:text-4xl font-bold uppercase tracking-[0.5em] select-none pl-[0.5em] blur-lg opacity-50"
                        style={{
                            backgroundImage: `linear-gradient(to right, #4f46e5 ${animatedProgress}%, transparent ${animatedProgress}%)`,
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                            color: "transparent",
                        }}
                    >
                        Eduverse
                    </h1>

                    <h1
                        className="relative text-3xl md:text-4xl font-bold uppercase tracking-[0.5em] transition-all duration-100 ease-out select-none pl-[0.5em]"
                        style={{
                            backgroundImage: `linear-gradient(to right, #4f46e5 ${animatedProgress}%, #cbd5e1 ${animatedProgress}%)`,
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                            color: "transparent",
                            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
                        }}
                    >
                        Eduverse
                    </h1>
                </div>

                {/* Percentage */}
                <p className="text-md font-medium text-slate-400 font-mono tracking-widest">
                    {Math.round(animatedProgress)}%
                </p>
            </div>
        </div>
    );
};

export default LoadingOverlay;
