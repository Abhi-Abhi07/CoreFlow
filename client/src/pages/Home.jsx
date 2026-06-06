import React from 'react';
import Hero from '../components/Hero';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-background transition-colors duration-300">
      <Hero />
    </div>
  );
}