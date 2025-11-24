import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { loadingManager } from "@/helper/loadingManager";
import LoadingOverlay from "@/components/ui/LoadingOverlay";

const LoadingContext = createContext(null);

export const LoadingProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const location = useLocation();

  // Refs to track state without triggering re-renders
  const apiCount = useRef(0);
  const minTimePromise = useRef(null);
  const progressInterval = useRef(null);
  const loadingId = useRef(0);

  const startLoading = () => {
    loadingId.current += 1;
    setIsLoading(true);
    setProgress(0);

    // Create a promise that resolves after 300ms
    minTimePromise.current = new Promise((resolve) => setTimeout(resolve, 300));

    // Start fake progress
    if (progressInterval.current) clearInterval(progressInterval.current);
    progressInterval.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        // Decelerating curve
        const remaining = 90 - prev;
        return prev + remaining * 0.1; // 10% of remaining distance
      });
    }, 100);
  };

  const stopLoading = async () => {
    const currentId = loadingId.current;

    // Wait for minimum time
    if (minTimePromise.current) {
      await minTimePromise.current;
    }

    // If a new loading session started, abort this stop
    if (currentId !== loadingId.current) return;

    // Check if any other requests started while we were waiting
    if (apiCount.current > 0) return;

    // Finish
    if (progressInterval.current) clearInterval(progressInterval.current);
    setProgress(100);

    // Small delay to show 100%
    setTimeout(() => {
      if (currentId === loadingId.current) {
        setIsLoading(false);
        setProgress(0);
      }
    }, 200);
  };

  // Listen to API events
  useEffect(() => {
    const unsubscribe = loadingManager.subscribe((event) => {
      if (event.type === "START") {
        // Only start if not already loading
        if (apiCount.current === 0 && !isLoading) {
          startLoading();
        }
        apiCount.current++;
      } else if (event.type === "STOP") {
        apiCount.current--;
        if (apiCount.current <= 0) {
          apiCount.current = 0;
          stopLoading();
        }
      }
    });
    return unsubscribe;
  }, [isLoading]);

  // Listen to Route changes
  useEffect(() => {
    // Avoid double triggering if already loading from API or other source
    if (isLoading && apiCount.current > 0) return;

    startLoading();

    // Check if API calls started shortly after navigation
    const checkTimer = setTimeout(() => {
      // If no API calls started, stop loading
      if (apiCount.current === 0) {
        stopLoading();
      }
    }, 400); // Increased grace period to 400ms to catch delayed API calls in heavy components

    return () => clearTimeout(checkTimer);
  }, [location.pathname, location.search]);

  return (
    <LoadingContext.Provider value={{ isLoading, progress }}>
      {children}
      <LoadingOverlay isVisible={isLoading} progress={progress} />
    </LoadingContext.Provider>
  );
};

export const useLoading = () => useContext(LoadingContext);
