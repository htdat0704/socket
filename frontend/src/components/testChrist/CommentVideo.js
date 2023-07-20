import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";

const CommentVideo = ({ socket }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [comment, setComment] = useState({
    cmContent: "",
    cmTimestamp: 0,
  });
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  const updateCommentList = () => {
    socket.on("comments updated", (data) => {
      setComments(
        data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      );
      setLoading(false);
    });
  };
  useEffect(() => {
    if (!localStorage.getItem("userName")) {
      navigate("/");
    }

    socket.emit("getComments", { videoID: id });
    socket.emit("join", { room: id, user: localStorage.getItem("userName") });
    updateCommentList();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    socket.emit("comment", {
      ...comment,
      username: localStorage.getItem("userName"),
      videoID: id,
    });

    updateCommentList();
  };

  const handleReact = (commentID) => {
    socket.emit("reactToComment", {
      commentID,
      videoID: id,
    });

    updateCommentList();
  };

  const handleOnChange = (e) => {
    if (e.target.name === "content") {
      setComment((prev) => {
        return { ...prev, cmContent: e.target.value };
      });
    }
    if (e.target.name === "timestamp") {
      setComment((prev) => {
        return { ...prev, cmTimestamp: e.target.value };
      });
    }
  };

  return (
    <div>
      <div className="bidproduct__container">
        <Link to="/videos">Back</Link>
        <h2>Comment a Video</h2>
        <form className="bidProduct__form" onSubmit={handleSubmit}>
          Title:
          <input
            type="text"
            name="content"
            value={comment.cmContent}
            onChange={handleOnChange}
            required
          />
          Timestamp:
          <input
            type="number"
            name="timestamp"
            value={comment.cmTimestamp}
            onChange={handleOnChange}
            required
          />
          <button className="bidProduct__cta">SEND</button>
        </form>
        <table>
          <thead>
            <tr>
              <th>UserName</th>
              <th>Comment</th>
              <th>Timestamp</th>
              <th>React Count</th>
              <th>React</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td>Loading</td>
              </tr>
            ) : (
              comments.map((comment) => (
                <tr key={comment._id}>
                  <td>{comment.username}</td>
                  <td>{comment.cmContent}</td>
                  <td>{comment.cmTimestamp}</td>
                  <td>{comment.cmReactCount}</td>
                  <td>
                    <button onClick={() => handleReact(comment._id)}>
                      React
                    </button>
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

export default CommentVideo;
