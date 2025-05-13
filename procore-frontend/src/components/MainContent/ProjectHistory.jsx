import React, { useEffect, useState } from "react";
import axios from "axios";

function ProjectHistory({ projectId }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      const response = await axios.get(`/api/projects/${projectId}/history`);
      setHistory(response.data);
    };

    fetchHistory();
  }, [projectId]);

  return (
    <div>
      <h3>Project History</h3>
      <ul>
        {history.map((entry) => (
          <li key={entry.id}>
            <p><strong>Updated By:</strong> {entry.updatedBy}</p>
            <p><strong>Changes:</strong> {JSON.stringify(entry.changes)}</p>
            <p><strong>Updated At:</strong> {new Date(entry.updatedAt).toLocaleString()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ProjectHistory;
