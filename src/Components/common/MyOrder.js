import axios from "axios";
import { useEffect, useState } from "react";
import Header from "./Header";

function MyOrder() {
  let [orders, setorder] = useState([]);
  let getmyorder = async () => {
   let user_email = localStorage.getItem("email");
   console.log(user_email);
    let url = `http://localhost:5008/api/my-order/${user_email}`;
    let { data } = await axios.get(url);
    setorder(data.my_order);
  };

  useEffect(() => {
    getmyorder();
  }, []);

  return (
    <>
    <Header bg="bg-danger"/>
    <div className="my-orders-container">
      <h2 className="my-orders-heading">My Orders</h2>
      <div className="order-list">
        {orders.map((order) => (
          <div key={order._id} className="order-item">
            <div className="order-details">
              <p className="order-name">{order.order_list[0].name}</p>
              <p className="order-name">{order.order_list[0].qty}</p>
              <p className="order-price">Total:₹{order.totalAmount}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
    </>
  );
}
export default MyOrder;
