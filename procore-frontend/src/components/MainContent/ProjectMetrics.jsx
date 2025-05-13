import React from "react";
import "./ProjectMetrics.css";

const ProjectMetrics = ({ metrics }) => {
  // console.log('Metrics in ProjectMetrics:', metrics);

  const totalProjects = metrics.totalProjects || 0;
  const totalEstimatedCost = metrics.totalEstimatedCost || 0;
  const lastEditedProjectName = metrics.lastEditedProjectName || 'N/A';
  const lastEditedBy = metrics.lastEditedBy || 'Unknown';

  return (
    <div className="project-metrics">
      <div className="metric-card">
        <h3>Total Projects</h3>
        <p>{totalProjects}</p>
      </div>
      <div className="metric-card">
        <h3>Total Estimated Cost</h3>
        <p>RM {totalEstimatedCost.toFixed(2)}</p>
      </div>
      <div className="metric-card">
        <h3>Last Edited Project</h3>
        <p><strong>{lastEditedProjectName}</strong></p>
        <p>Edited by: {lastEditedBy}</p>
      </div>
    </div>
  );
};

export default ProjectMetrics;
