import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Videos = () => {
  const [videos, setVideos] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleView = (video) => navigate(`/videos/view/${video._id}`);

  useEffect(() => {
    if (!localStorage.getItem("userName")) {
      navigate("/");
    }
    const fetchVideos = () => {
      fetch("http://localhost:4002/api/v1/video/all")
        .then((res) => res.json())
        .then((res) => {
          setVideos(res.data);
          setLoading(false);
        });
    };
    fetchVideos();
  }, []);

  return (
    <div>
      <div className="table__container">
        <table>
          <thead>
            <tr>
              <th>Video ID</th>
              <th>Episode ID</th>
              <th>Video Duration</th>
              <th>Video Type</th>
              <th>View</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td>Loading</td>
              </tr>
            ) : (
              videos.map((video) => (
                <tr key={video._id}>
                  <td>{video._id}</td>
                  <td>{video.episodeID}</td>
                  <td>{video.vdDuration}</td>
                  <td>{video.vdType || "None"}</td>
                  <td>
                    <button onClick={() => handleView(video)}>View</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Videos;
