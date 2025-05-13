import React from "react";
import { Link } from "react-router-dom"; // Assuming you use React Router for navigation
import "./Breadcrumb.css";

const Breadcrumb = ({ crumbs }) => {
  return (
    <div className="breadcrumb">
      {crumbs.map((crumb, index) => (
        <span key={index}>
          {crumb.link ? (
            <Link to={crumb.link}>{crumb.label}</Link>
          ) : (
            <span>{crumb.label}</span>
          )}
          {index < crumbs.length - 1 && " > "} {/* Add the separator */}
        </span>
      ))}
    </div>
  );
};

export default Breadcrumb;
