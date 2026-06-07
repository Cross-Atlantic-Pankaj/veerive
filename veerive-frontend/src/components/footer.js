'use client';

import React from 'react';

const Footer = () => {
  const infoLinks = ["Privacy Policy", "Terms of Service"];

  const socialIcons = [
    {
      href: "https://x.com",
      icon: "M20.5 3h-3l-4.5 6-4-6H3l6.5 9-6.5 9h3l4.5-6 4 6h3l-6.5-9L20.5 3z"
    },
    {
      href: "https://linkedin.com",
      icon: "M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.25 6.5 1.75 1.75 0 016.5 8.25zM19 19h-3v-4.74c0-1.42-.6-2.73-2.23-2.73a2.57 2.57 0 00-2.43 2.74V19h-3v-9h3v1.37a3.94 3.94 0 013.53-2.08C17.87 9.29 19 11 19 12.76z"
    }
  ];

  return (
    <footer className="bg-black text-white px-4 md:px-8 lg:px-12 py-12">
      <div className="w-full mx-auto px-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          <div>
            <h3 className="text-cyan-400 font-semibold mb-4">Insights</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <a href='/pulse-today' className="hover:underline">Pulse Today</a>
              </li>
              <li>
                <a href='/analyzer/trend-analyzer' className="hover:underline">Trend Analyzer</a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-cyan-400 font-semibold mb-4">THINK TANK</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <a href="/influencer-comment/expert-opinion" className="hover:underline">Expert Opinion</a>
              </li>
              <li>
                <a href='/influencer-comment/market-statistics' className="hover:underline">Market Statistics</a>
              </li>
              <li>
                <a href='/influencer-comment/interview' className="hover:underline">Interview</a>
              </li>
              <li>
                <a href='/influencer-comment/news' className="hover:underline">News</a>
              </li>
              <li>
                <a href='/influencer-comment/research-report' className="hover:underline">Research Report</a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-cyan-400 font-semibold mb-4">OUR INFORMATION</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              {infoLinks.map((item, i) => (
                <li key={`info-${i}`}>
                  <a href={`/${item.toLowerCase().replace(/ /g, "-")}`} className="hover:underline">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-cyan-400 font-semibold mb-2">SOCIAL STREAM</h3>
            <div className="flex gap-4 flex-wrap sm:justify-start justify-center">
              {socialIcons.map((item, i) => (
                <a key={`icon-${i}`} href={item.href} target="_blank" rel="noreferrer"
                  className="bg-[#1e1e1e] p-3 rounded-full hover:bg-gray-700">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d={item.icon} />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-gray-500 mt-4 border-t border-gray-700 pt-6">
          © Copyright 2025 Veerive, All Rights Reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;