import React from 'react';
import '../html/css/StoryComponent.css';

export default function StoryComponent () {
  return (
    <div className="story-container">
      {/* Left Section */}
      <div className="story-left">
        {/* Sector and Theme */}
        <div className="story-sector-theme">
          <p>Sector:</p>
          <p>Theme:</p>
        </div>
        {/* Story Title */}
        <div className="story-title">
          <h1>Story TITLE</h1>
        </div>
        {/* Story Content */}
        <div className="story-content">
          <ul>
            <li>Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum</li>
            <li>Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum</li>
            <li>Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum</li>
            <li>Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum</li>
            <li>Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum</li>
          </ul>
        </div>
      </div>

      {/* Right Section */}
      <div className="story-right">
        {/* Chart Heading */}
        <h2 className="chart-heading">CHART HEADING</h2>
        {/* Placeholder for Chart */}
        <div className="chart-placeholder">
          {/* Replace this div with your actual chart component */}
        </div>
      </div>
    </div>
  );
};

