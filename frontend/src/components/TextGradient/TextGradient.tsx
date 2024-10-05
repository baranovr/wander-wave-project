/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useRef, useState} from 'react';
import './TextGradient.scss';

interface TextGradientCounterProps {
  countTo: number;
  duration?: number;
}

export const TextGradient: React.FC<TextGradientCounterProps> = ({
  countTo,
  duration = 3000,
}) => {
  const [count, setCount] = useState(0);
  const countRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            startCounting();
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 },
    );

    if (countRef.current) {
      observer.observe(countRef.current);
    }

    return () => {
      if (countRef.current) {
        observer.unobserve(countRef.current);
      }
    };
  }, []);

  const startCounting = () => {
    let start = 0;
    const end = countTo;
    const increment = end / ((duration / 1000) * 60);
    const stepTime = Math.abs(Math.floor(duration / (end / increment)));

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        clearInterval(timer);
        start = end;
      }
      setCount(Math.round(start));
    }, stepTime);

    return () => {
      clearInterval(timer);
    };
  };

  return (
    <h1 className="text-gradient text-primary">
      <span ref={countRef} id="state1">
        {count}+
      </span>
    </h1>
  );
};
