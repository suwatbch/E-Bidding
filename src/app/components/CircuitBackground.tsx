'use client';

import React from 'react';

const CircuitBackground: React.FC = () => {
  return (
    <>
      <style jsx global>{`
        @keyframes circuit-flow {
          0% { opacity: 0.05; }
          50% { opacity: 0.2; }
          100% { opacity: 0.05; }
        }
        .circuit-animate {
          animation: circuit-flow 4s infinite;
        }
      `}</style>

      {/* Bottom Circuit Patterns - Left */}
      <div className="fixed left-0 bottom-0 h-96 w-96 opacity-5">
        <div className="absolute left-12 bottom-16 h-48 w-[2px] bg-blue-600"></div>
        <div className="absolute left-12 bottom-16 h-[2px] w-32 bg-blue-600"></div>
        <div className="absolute left-44 bottom-16 h-32 w-[2px] bg-blue-600"></div>
        
        <div className="absolute left-8 bottom-32 h-64 w-[2px] bg-blue-600"></div>
        <div className="absolute left-8 bottom-32 h-[2px] w-24 bg-blue-600"></div>
        <div className="absolute left-32 bottom-32 h-40 w-[2px] bg-blue-600"></div>
        
        {/* Circuit nodes with glow */}
        <div className="absolute left-12 bottom-16 h-4 w-4 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.5)]"></div>
        <div className="absolute left-44 bottom-16 h-4 w-4 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.5)]"></div>
        <div className="absolute left-8 bottom-32 h-4 w-4 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.5)]"></div>
        <div className="absolute left-32 bottom-32 h-4 w-4 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.5)]"></div>
      </div>

      {/* Bottom Circuit Patterns - Right */}
      <div className="fixed right-0 bottom-0 h-96 w-96 opacity-5">
        <div className="absolute right-12 bottom-16 h-48 w-[2px] bg-blue-600"></div>
        <div className="absolute right-12 bottom-16 h-[2px] w-32 bg-blue-600"></div>
        <div className="absolute right-44 bottom-16 h-32 w-[2px] bg-blue-600"></div>
        
        <div className="absolute right-8 bottom-32 h-64 w-[2px] bg-blue-600"></div>
        <div className="absolute right-8 bottom-32 h-[2px] w-24 bg-blue-600"></div>
        <div className="absolute right-32 bottom-32 h-40 w-[2px] bg-blue-600"></div>
        
        {/* Circuit nodes with glow */}
        <div className="absolute right-12 bottom-16 h-4 w-4 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.5)]"></div>
        <div className="absolute right-44 bottom-16 h-4 w-4 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.5)]"></div>
        <div className="absolute right-8 bottom-32 h-4 w-4 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.5)]"></div>
        <div className="absolute right-32 bottom-32 h-4 w-4 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.5)]"></div>
      </div>

      {/* Bottom Glowing Lines */}
      <div className="fixed inset-x-0 bottom-0 h-64 pointer-events-none">
        <div className="absolute bottom-24 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-600/30 to-transparent"></div>
        <div className="absolute bottom-48 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-600/30 to-transparent"></div>
        
        <div className="absolute left-1/3 bottom-0 h-full w-[1px] bg-gradient-to-t from-blue-600/30 via-blue-600/20 to-transparent"></div>
        <div className="absolute right-1/3 bottom-0 h-full w-[1px] bg-gradient-to-t from-blue-600/30 via-blue-600/20 to-transparent"></div>
      </div>
    </>
  );
};

export default CircuitBackground; 