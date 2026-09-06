import React from 'react';
import { Database, Code2, Layers, GitFork, BrainCircuit } from 'lucide-react';

export default function ProjectOverview() {
  const technologies = [
    { name: 'CICIDS2017', icon: Layers },
    { name: 'Python', icon: Code2 },
    { name: 'MySQL', icon: Database },
    { name: 'Star Schema', icon: Layers },
    { name: 'OLAP', icon: GitFork },
    { name: 'Random Forest', icon: BrainCircuit },
  ];

  return (
    <div className="overview-card">
      {/* Left: Academic Overview Text */}
      <div className="overview-text-wrap">
        <h4 className="overview-title">Project Overview</h4>
        <p className="overview-body">
          This project applies Data Warehousing and Data Mining techniques to network traffic data from CICIDS2017. The data is cleaned and transformed through ETL, stored in a MySQL star-schema data warehouse, analyzed using OLAP techniques, and classified using a Random Forest data mining model.
        </p>
      </div>

      {/* Right: Simple Monochrome Technology Strip */}
      <div className="tech-pills-wrap">
        {technologies.map((tech, idx) => {
          const Icon = tech.icon;
          return (
            <React.Fragment key={tech.name}>
              <div className="tech-pill">
                <Icon size={12} color="#A0A0A0" />
                <span>{tech.name}</span>
              </div>
              {idx < technologies.length - 1 && (
                <span style={{ color: '#333333', fontSize: '0.8rem', userSelect: 'none' }}>|</span>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
