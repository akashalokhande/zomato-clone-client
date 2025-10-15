import axios from "axios";
import { useEffect, useState } from "react";
import Header from "./Header";
import Loader from "./Loader";
import "../css/MyOrder.css";

function MyOrder() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const getMyOrder = async () => {
    try {
      const user_email = localStorage.getItem("email");

      if (!user_email) {
        setError("User email not found. Please log in again.");
        setIsLoading(false);
        return;
      }

      const url = `https://zomato-web-clone.onrender.com/api/my-order/${user_email}`;
      const { data } = await axios.get(url);
      setOrders(data.orders || []);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Something went wrong while fetching your orders.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getMyOrder();
  }, []);

  if (isLoading) {
    return (
      <>
        <Header bg="solid-header" />
        <div className="blur-background">
          <Loader />
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header bg="solid-header" />
        <div className="center-container">
          <div className="info-card error">{error}</div>
        </div>
      </>
    );
  }

  if (orders.length === 0) {
    return (
      <>
        <Header bg="solid-header" />
        <div className="center-container">
          <div className="info-card empty">You haven't placed any orders yet 🍽️</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header bg="solid-header" />
      <div className="my-orders-container">
        <h2 className="my-orders-heading">My Orders</h2>
        <div className="order-grid">
          {orders.map((order, orderIndex) => (
            <div key={order._id || orderIndex} className="order-card">
              <div className="order-header">
                <p className="order-id">Order #{orderIndex + 1}</p>
                {order.date && (
                  <p className="order-date">
                    {new Date(order.date).toLocaleString()}
                  </p>
                )}
              </div>

              <div className="order-items">
                {order.order_list.map((item, itemIndex) => (
                  <div
                    key={item.id || itemIndex || item.name}
                    className="order-item"
                  >
                    <div className="order-item-left">
                      <img
                        src={`/images/${item.image}`}
                        alt={item.name}
                        className="order-image"
                      />
                      <div>
                        <p className="order-item-name">{item.name}</p>
                        <p className="order-item-qty">Qty: {item.qty}</p>
                      </div>
                    </div>
                    <p className="order-item-price">₹{item.price}</p>
                  </div>
                ))}
              </div>

              <div className="order-footer">
                <p className="order-total">Total: ₹{order.totalAmount}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default MyOrder;
