import React, { useState, useEffect, useRef } from 'react';

interface RevealOnScrollProps {
  children: React.ReactNode;
  direction: 'left' | 'right' | 'up' | 'scale';
  delay?: number;
  className?: string;
}

export const RevealOnScroll: React.FC<RevealOnScrollProps> = ({ children, direction, delay = 0, className = "" }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { 
        threshold: 0.1, 
        rootMargin: '0px 0px -50px 0px' 
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal-base reveal-${direction} ${isVisible ? 'revealed' : ''} ${className}`}
      style={{ transitionDelay: isVisible ? `${delay}ms` : '0ms' }}
    >
      {children}
    </div>
  );
};
