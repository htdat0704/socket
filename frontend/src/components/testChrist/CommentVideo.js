import React, { useEffect, useState, useCallback } from "react";
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
  const [page, setPage] = useState(1);
  const [watchingCount, setWatchingCount] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [cmTimeRangeStartInSecond, setTimeRangeStartInSecond] = useState(0);

  useEffect(() => {
    if (!localStorage.getItem("userName")) {
      navigate("/");
    }

    socket.emit("getComments", {
      videoID: id,
      queryParams: {
        page,
        pageSize,
      },
      searchOptions: {
        cmTimeRangeStartInSecond,
      },
    });
    socket.emit("join", {
      roomID: id,
      userID: localStorage.getItem("userName"),
      socketID: socket.id,
    });
    socket.on("comments updated", (data) => {
      setComments(data.result.items);
      setLoading(false);
    });

    socket.on("comment created", (data) => {
      setComments((prev) => [data, ...prev]);
    });

    socket.on("comment reacted", (data) => {
      setComments((prev) =>
        prev.map((comment) => (comment._id === data._id ? data : comment))
      );
    });

    socket.on("watching count", (data) => {
      setWatchingCount(data);
    });

    socket.on("disconnect");

    return () => {
      socket.off("comments updated");
      socket.off("comment created");
      socket.off("comment reacted");
      socket.off("disconnect");
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    socket.emit("comment", {
      ...comment,
      username: localStorage.getItem("userName"),
      videoID: id,
    });
  };

  const handleMore = () => {
    fetch(
      `http://localhost:4002/api/v1/comment/${id}?` +
        new URLSearchParams({
          page: page + 1,
          pageSize,
          cmTimeRangeStartInSecond,
        })
    )
      .then((res) => res.json())
      .then((res) => {
        setComments((prev) => [
          ...prev,
          ...res.data.result.items.filter(
            (comment) =>
              !prev.some((commentPrev) => commentPrev._id === comment._id)
          ),
        ]);
        setLoading(false);
      });

    setPage(page + 1);
  };

  const handleReact = (commentID) => {
    socket.emit("reactToComment", {
      commentID,
      videoID: id,
    });
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

  const handleBack = () => {
    socket.emit("disconnectRoom");
    navigate("/videos");
  };

  return (
    <div>
      <div className="bidproduct__container">
        <button onClick={() => handleBack()}>Back</button>
        <h2>Watching Now : {watchingCount}</h2>
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
      <button className="bidProduct__cta" onClick={() => handleMore()}>
        More
      </button>
    </div>
  );
};

export default CommentVideo;
