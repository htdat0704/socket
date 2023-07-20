import socketIO from "socket.io-client";
import { Route, Routes, BrowserRouter as Router } from "react-router-dom";
// import Home from "./components/Home";
import Nav from "./components/Nav";
// import Products from "./components/Products";
import AddProduct from "./components/AddProduct";
import BidProduct from "./components/BidProduct";
import Videos from "./components/testChrist/Videos";
import Home from "./components/testChrist/Home";
import CommentVideo from "./components/testChrist/CommentVideo";

const socket = socketIO.connect("http://localhost:4002");

function App() {
  return (
    <Router>
      <div>
        {/* Nav is available at the top of all the pages as a navigation bar */}
        <Nav socket={socket} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/videos" element={<Videos />} />
          <Route
            path="/products/add"
            element={<AddProduct socket={socket} />}
          />
          <Route
            path="/videos/view/:id"
            element={<CommentVideo socket={socket} />}
          />
        </Routes>
        {/* <Nav socket={socket} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route
            path="/products/add"
            element={<AddProduct socket={socket} />}
          />
          <Route
            path="/products/bid/:id"
            element={<BidProduct socket={socket} />}
          />
        </Routes> */}
      </div>
    </Router>
  );
}

export default App;
