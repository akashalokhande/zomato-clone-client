import axios from "axios";
import { useEffect, useState } from "react";
import Header from "./Header";
import Loader from "./Loader";

function MyOrder() {
  let [orders, setorder] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  let getmyorder = async () => {
    let user_email = localStorage.getItem("email");
    let url = `https://zomato-web-clone.onrender.com/api/my-order/${user_email}`;
    let { data } = await axios.get(url);
    console.log(data.my_order);
    setIsLoading(false);
    setorder(data.my_order);
  };

  useEffect(() => {
    getmyorder();
  }, []);

  return (
    <>
      <div>
        <Header bg="bg-danger" />
        {isLoading ? (
          <div className="blur-background">
            <Loader />
          </div>
        ) : orders.length === 0 ? (
          <div
            className=" d-flex align-items-center justify-content-center"
            style={{ height: "80vh" }}
          >
            <div className="food-shadow p-4 mb-4 bg-light">
              Orders Not Found
            </div>
          </div>
        ) : (
          <>
            {orders.map((order) => (
              <div className="my-orders-container">
                <div className="my-3">
                  <div className="order-item bg-light">
                    {order.order_list.map((list) => (
                      <div className="order-details bg-info text-white rounded-3 p-3">
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
                    ))}
                    <div className="d-flex justify-content-center ">
                      <p className="order-name">total:₹{order.totalAmount}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </>
  );
}
export default MyOrder;
