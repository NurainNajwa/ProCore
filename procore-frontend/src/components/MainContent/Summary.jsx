import React, { useState } from "react";
import Sidebar from "./Sidebar";
import './Summary.css';
import Breadcrumb from "./Breadcrumb";

const Summary = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const breadcrumbs = [
    { label: "Home", link: "/projects" },
    { label: "Summary", link: "/summary" },
  ];

  return (
    <div className="summary-page">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content */}
      <div className={`main-content ${isSidebarOpen ? "open" : "collapsed"}`}>
        <header className="summary-header">
        <Breadcrumb crumbs={breadcrumbs} />
          <h1>Summary</h1>
          <p>A high-level overview of your project.</p>
        </header>

        <section className="summary-content">
          <div className="summary-item">
            <h2>Total Projects</h2>
            <p>56 Projects</p>
          </div>

          <div className="summary-item">
            <h2>Total Estimated Cost</h2>
            <p>RM 1,150,340</p>
          </div>

          <div className="summary-item">
            <h2>Average Estimated Days</h2>
            <p>50 days</p>
          </div>

          <div className="summary-item">
            <h2>Upcoming Deadlines</h2>
            <p>2 projects due in the next week</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Summary;
