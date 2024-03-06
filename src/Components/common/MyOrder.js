import axios from "axios";
import { useEffect, useState } from "react";
import Header from "./Header";

function MyOrder() {
  let [orders, setorder] = useState([]);
  let getmyorder = async () => {
    let user_email = localStorage.getItem("email");
    let url = `https://zomato-web-clone.onrender.com/api/my-order/${user_email}`;
    let { data } = await axios.get(url);
    console.log(data.my_order);
    setorder(data.my_order);
  };

  useEffect(() => {
    getmyorder();
  }, []);

  return (
    <>
      <div>
        <Header bg="bg-danger" />
        <div className="my-orders-container">
          {/* <h2 className="my-orders-heading">My Orders</h2> */}
          <div className="order-list my-3">
            {orders.map((order) => (
              <div key={order._id} className="order-item bg-success text-white">
                <div className="order-details">
                  {order.order_list.map((list) => (
                    <>
                      <div className="bg-secondary p-3 rounded-2 my-2">
                        <div className="d-flex justify-content-between">
                          <p className="order-name">{list.name}</p>
                          <img
                            src={"/images/" + list.image}
                            alt=""
                            className="order-image"
                          />
                        </div>
                        <p className="d-flex justify-content-between pt-2">
                          <span>Price:₹{list.price}</span>
                          <span className="pe-2">Qty:{list.qty}</span>
                        </p>
                      </div>
                    </>
                  ))}

                  <div className="d-flex justify-content-center ">
                    <p className="order-name">Total:₹{order.totalAmount}</p>{" "}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
export default MyOrder;
