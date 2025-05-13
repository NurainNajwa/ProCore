import React, { useState } from "react";
import Sidebar from "./Sidebar";
import './Help.css';
import Breadcrumb from "./Breadcrumb";


const Help = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const breadcrumbs = [
    { label: "Home", link: "/projects" },
    { label: "Help", link: "/help" },
  ];

  return (
    <div className="help-page">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content */}
      <div className={`main-content ${isSidebarOpen ? "open" : "collapsed"}`}>
        <header className="help-header">
        <Breadcrumb crumbs={breadcrumbs} />
          <h1>Help</h1>
          <p>Find answers to your questions or get support here.</p>
        </header>

        <section className="faq-section">
          <div className="faq-item">
            <h3>How do I create a new project?</h3>
            <p>Click on the "New Project" button in the dashboard to create a new project. Fill in the required details and save.</p>
          </div>

          <div className="faq-item">
            <h3>How do I view project details?</h3>
            <p>Click on any project name in the project list to view detailed information about the project.</p>
          </div>

          <div className="faq-item">
            <h3>Can I edit project details?</h3>
            <p>Yes, click on the "Edit" button next to a project in the project list to modify its details.</p>
          </div>

          <div className="faq-item">
            <h3>How do I contact support?</h3>
            <p>If you need further assistance, click the "Contact Support" button at the bottom of the page to send an inquiry.</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Help;
