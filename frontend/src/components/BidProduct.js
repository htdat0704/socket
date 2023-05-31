import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";

const BidProduct = ({ socket }) => {
  const { id } = useParams();
  const [userInput, setUserInput] = useState();
  const navigate = useNavigate();
  const [error, setError] = useState(false);
  const [notification, setNotification] = useState("");
  const [product, setProduct] = useState({});

  useEffect(() => {
    if (!localStorage.getItem("userName")) {
      navigate("/");
    }

    socket.emit("getProduct", { id });
    socket.emit("join", { room: id, user: localStorage.getItem("userName") });
    socket.on("project updated", (data) => {
      console.log(data);
      setProduct(data);
      setNotification(
        `@${data.last_bidder} just bid for $${Number(
          data.price
        ).toLocaleString()}`
      );
    });
    socket.on("joined", (data) => {
      setNotification(data);
    });
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (userInput > Number(product.price)) {
      socket.emit("bidProduct", {
        id: product.id,
        amount: userInput,
        last_bidder: localStorage.getItem("userName"),
        name: product.name,
      });
      socket.on("project updated", (data) => {
        setProduct(data);
        setUserInput(data.price);
        setNotification(
          `@${data.last_bidder} just bid for $${Number(
            data.price
          ).toLocaleString()}`
        );
      });
    } else {
      setError(true);
    }
  };

  return (
    <div>
      <div className="bidproduct__container">
        <Link to="/products">Back</Link>
        <h2>Place a Bid</h2>
        <div>
          <p style={{ color: "red" }}>{notification}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Price</th>
              <th>Last Bidder</th>
              <th>Creator</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{product.name}</td>
              <td>{product.price}</td>
              <td>{product.last_bidder || "None"}</td>
              <td>{product.owner}</td>
            </tr>
          </tbody>
        </table>
        <form className="bidProduct__form" onSubmit={handleSubmit}>
          <h3 className="bidProduct__name">{product.name}</h3>

          <label htmlFor="amount">Bidding Amount</label>
          {/* The error message */}
          {error && (
            <p style={{ color: "red" }}>
              The bidding amount must be greater than {product.price}
            </p>
          )}

          <input
            type="number"
            name="amount"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            required
          />

          <button className="bidProduct__cta">SEND</button>
        </form>
      </div>
    </div>
  );
};

export default BidProduct;
