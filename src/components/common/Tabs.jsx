import React from 'react';

export default function Tabs({ tabs, activeTab, onChange, variant, className = '' }) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`
flex-1 py-2 px-4 text-sm font-semibold rounded-xl transition-all duration-300 backdrop-blur-lg
${
activeTab === tab.value
? variant === "leaderboard"
  ? "bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 text-white shadow-lg shadow-purple-500/40 scale-[1.03]"
  : "bg-gradient-to-r from-primary-500 to-purple-500 text-white shadow-lg"
: "bg-[#12182b] text-gray-400 border border-white/5 hover:bg-[#1a2238]"
}
`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
