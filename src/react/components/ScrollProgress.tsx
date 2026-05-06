import { useState, useEffect } from "react";

const ScrollProgress: React.FC = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const updateScrollProgress = () => {
      // Calculate how far the user has scrolled
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollProgress(scrollPercent);
    };

    // Add scroll event listener
    window.addEventListener("scroll", updateScrollProgress);

    // Clean up
    return () => window.removeEventListener("scroll", updateScrollProgress);
  }, []);

  return (
    <div className="w-full h-1 bg-gray-200/30">
      <div
        className="h-full bg-secondary transition-all duration-150 ease-out"
        style={{ width: `${scrollProgress}%` }}
      />
    </div>
  );
};

export default ScrollProgress;
