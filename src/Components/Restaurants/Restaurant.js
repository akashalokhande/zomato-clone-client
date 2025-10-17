import axios from "axios";
import { useEffect, useState, useRef } from "react";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from "react-responsive-carousel";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../common/Header";
import jwtDecode from "jwt-decode";
import Swal from "sweetalert2";
import Loader from "../common/Loader";
import "../css/Restaurant.css";

function Restaurant() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Decode user token
  const getUserLoginData = () => {
    const token = localStorage.getItem("auth_token");
    if (!token) return false;
    try {
      return jwtDecode(token);
    } catch {
      localStorage.removeItem("auth_token");
      return false;
    }
  };

  const [user, setUser] = useState(getUserLoginData());

  const initRestaurant = {
    aggregate_rating: "",
    city: "",
    city_id: 0,
    contact_number: "",
    cuisine: [],
    cuisine_id: [],
    image: "retaurent-background.png",
    locality: "",
    location_id: 0,
    mealtype_id: 0,
    min_price: 0,
    name: "",
    rating_text: "",
    thumb: [],
    _id: "",
  };

  // STATES
  const [rDetails, setRDetails] = useState({ ...initRestaurant });
  const [menuList, setMenuList] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [menuLoading, setMenuLoading] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  // UI STATES
  const [showGallery, setShowGallery] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const drawerRef = useRef(null);

  // Fetch restaurant details
  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const url = `https://zomato-web-clone.onrender.com/api/get-restaurant-details-by-id/${id}`;
        const { data } = await axios.get(url);
        if (data.status) setRDetails({ ...data.restaurants });
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRestaurant();
  }, [id]);

  // Fetch menu items
  const getMenuItems = async () => {
    setMenuLoading(true);
    try {
      const url = `https://zomato-web-clone.onrender.com/api/get-menu-items/${id}`;
      const { data } = await axios.get(url);
      if (data.status) {
        const items = data.menu_items.map((m) => ({ ...m, qty: m.qty || 0 }));
        setMenuList(items);
      } else setMenuList([]);
    } catch (err) {
      console.error(err);
      setMenuList([]);
    } finally {
      setTotalPrice(0);
      setMenuLoading(false);
    }
  };

  // Drawer controls
  const openOrderDrawer = async () => {
    await getMenuItems();
    setShowDrawer(true);
  };
  const closeDrawer = () => setShowDrawer(false);

  // Menu item controls
  const addItem = (i) => {
    const _m = [...menuList];
    _m[i].qty += 1;
    setMenuList(_m);
    setTotalPrice((p) => p + Number(_m[i].price));
  };
  const removeItem = (i) => {
    const _m = [...menuList];
    if (_m[i].qty > 0) {
      _m[i].qty -= 1;
      setMenuList(_m);
      setTotalPrice((p) => p - Number(_m[i].price));
    }
  };

  // Payment flow
  const makePayment = async () => {
    const selected = menuList.filter((m) => m.qty > 0);
    if (selected.length === 0) {
      return Swal.fire(
        "No items selected",
        "Please add items first.",
        "warning"
      );
    }
    if (!user) {
      return Swal.fire("Login required", "Please login to continue.", "info");
    }

    setIsPaying(true);

    try {
      const { data } = await axios.post(
        "https://zomato-web-clone.onrender.com/api/gen-order-id",
        { amount: totalPrice }
      );

      if (!data.status) {
        setIsPaying(false);
        return Swal.fire("Error", "Unable to start payment.", "error");
      }

      const { order } = data;
      const options = {
        key: "rzp_test_RSx7Q9g70RddsF",
        amount: order.amount,
        currency: order.currency,
        name: rDetails.name,
        description: "Order Payment",
        image: "/images/" + rDetails.image,
        order_id: order.id,
        handler: async (response) => {
          try {
            const verifyData = {
              payment_id: response.razorpay_payment_id,
              order_id: response.razorpay_order_id,
              signature: response.razorpay_signature,
              name: user.name,
              email: user.email,
              order_list: selected,
              totalAmount: totalPrice,
            };
            const verifyRes = await axios.post(
              "https://zomato-web-clone.onrender.com/api/verify-payment",
              verifyData
            );

            if (verifyRes.data.status) {
              Swal.fire({
                icon: "success",
                title: "Payment successful!",
                showConfirmButton: false,
                timer: 1800,
              });
              setMenuList([]);
              setTotalPrice(0);
              setShowUserDetails(false);
              closeDrawer();
              setTimeout(() => navigate("/"), 1800);
            } else {
              Swal.fire("Error", "Payment verification failed.", "error");
            }
          } catch (err) {
            Swal.fire("Error", "Verification error.", "error");
          } finally {
            setIsPaying(false);
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.mobile || "9999999999",
        },
        modal: {
          ondismiss: () => {
            setIsPaying(false);
            setShowUserDetails(false);
            setTimeout(() => setShowDrawer(true), 150);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      setShowUserDetails(false);
      setTimeout(() => {
        rzp.open();
        setIsPaying(false);
      }, 200);
    } catch (err) {
      setIsPaying(false);
      Swal.fire("Error", "Unable to open payment gateway.", "error");
    }
  };

  if (isLoading) {
    return (
      <div className="page-loader">
        <Loader />
      </div>
    );
  }

  return (
    <>
      <Header bg="solid-header" />
      <main>
        {/* ===== Hero ===== */}
        <section className="restaurant-hero">
          <img
            src={"/images/" + rDetails.image}
            alt={rDetails.name}
            className="hero-img"
          />
          <div className="hero-overlay">
            <div className="hero-info">
              <h1>{rDetails.name}</h1>
              <p>
                {rDetails.locality}, {rDetails.city} • {rDetails.rating_text} (
                {rDetails.aggregate_rating})
              </p>
            </div>
            <div className="hero-actions">
              <button
                className="btn-outline"
                onClick={() => setShowGallery(true)}
              >
                View Gallery
              </button>
              <button className="btn-primary" onClick={openOrderDrawer}>
                Order Online
              </button>
            </div>
          </div>
        </section>

        {/* ===== Tabs ===== */}
        <section className="restaurant-content">
          <div className="tabs">
            <button
              className={`tab ${activeTab === "overview" ? "active" : ""}`}
              onClick={() => setActiveTab("overview")}
            >
              Overview
            </button>
            <button
              className={`tab ${activeTab === "contact" ? "active" : ""}`}
              onClick={() => setActiveTab("contact")}
            >
              Contact
            </button>
          </div>

          <div className="fade-panels">
            {activeTab === "overview" && (
              <div className="fade-panel visible">
                <h3>About this place</h3>
                <p>
                  <strong>Cuisine:</strong>{" "}
                  {rDetails.cuisine.map((c) => c.name).join(", ")}
                </p>
                <p>
                  <strong>Average cost:</strong> ₹{rDetails.min_price} for two
                </p>
              </div>
            )}
            {activeTab === "contact" && (
              <div className="fade-panel visible">
                <p>
                  <strong>Phone:</strong> +{rDetails.contact_number}
                </p>
                <p>
                  <strong>Address:</strong> {rDetails.locality}, {rDetails.city}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ===== Gallery Modal ===== */}
        {showGallery && (
          <div className="gallery-modal" onClick={() => setShowGallery(false)}>
            <div className="gallery-card" onClick={(e) => e.stopPropagation()}>
              <button
                className="gallery-close"
                onClick={() => setShowGallery(false)}
              >
                ×
              </button>
              <Carousel showThumbs={false} infiniteLoop>
                {rDetails.thumb.length > 0 ? (
                  rDetails.thumb.map((t, i) => (
                    <div key={i}>
                      <img src={"/images/" + t} alt={`thumb-${i}`} />
                    </div>
                  ))
                ) : (
                  <div>
                    <img src={"/images/" + rDetails.image} alt="hero" />
                  </div>
                )}
              </Carousel>
            </div>
          </div>
        )}

        {/* ===== Order Drawer ===== */}
        {showDrawer && (
          <div className="drawer-overlay show" onClick={closeDrawer} />
        )}
        <aside
          ref={drawerRef}
          className={`order-drawer ${showDrawer ? "open" : ""}`}
        >
          <div className="drawer-header">
            <h3>{rDetails.name} — Order</h3>
            <button className="drawer-close" onClick={closeDrawer}>
              ✕
            </button>
          </div>
          <div className="drawer-body">
            {menuLoading ? (
              <div className="drawer-loader">
                <Loader />
              </div>
            ) : (
              <>
                <div className="menu-list">
                  {menuList.length === 0 ? (
                    <p className="empty">No menu items available.</p>
                  ) : (
                    menuList.map((m, i) => (
                      <div className="menu-row" key={m._id || i}>
                        <div className="menu-left">
                          <p className="menu-name">{m.name}</p>
                          <p className="menu-desc">{m.description}</p>
                        </div>
                        <div className="menu-right">
                          <p className="menu-price">₹{m.price}</p>
                          {m.qty === 0 ? (
                            <button
                              className="add-btn"
                              onClick={() => addItem(i)}
                            >
                              Add
                            </button>
                          ) : (
                            <div className="qty-control">
                              <button onClick={() => removeItem(i)}>-</button>
                              <span>{m.qty}</span>
                              <button onClick={() => addItem(i)}>+</button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="drawer-footer">
                  <div className="total">
                    <p>Total</p>
                    <h3>₹{totalPrice}</h3>
                  </div>
                  <div className="drawer-actions">
                    <button className="btn-outline" onClick={closeDrawer}>
                      Explore More
                    </button>
                    <button
                      className="btn-primary"
                      onClick={() => {
                        const selected = menuList.filter((m) => m.qty > 0);

                        if (selected.length === 0) {
                          Swal.fire(
                            "No items selected",
                            "Please add at least one item to your order.",
                            "warning"
                          );
                          return;
                        }

                        if (!user) {
                          Swal.fire(
                            "Login required",
                            "Please login to continue.",
                            "info"
                          );
                          return;
                        }

                        setShowUserDetails(true);
                      }}
                    >
                      Place Order
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </aside>

        {/* ===== User Modal ===== */}
        {showUserDetails && (
          <div className="user-modal" onClick={() => setShowUserDetails(false)}>
            <div className="user-card" onClick={(e) => e.stopPropagation()}>
              <button
                className="user-close"
                onClick={() => setShowUserDetails(false)}
              >
                ×
              </button>
              <h3>Confirm Details</h3>
              <div className="form-row">
                <label>Name</label>
                <input type="text" value={user.name} disabled />
              </div>
              <div className="form-row">
                <label>Email</label>
                <input type="email" value={user.email} disabled />
              </div>
              <div className="form-row">
                <label>Address</label>
                <textarea defaultValue="Enter delivery address" />
              </div>
              <div className="user-actions">
                <button
                  className="btn-outline"
                  onClick={() => setShowUserDetails(false)}
                >
                  Back
                </button>
                <button className="btn-primary" onClick={makePayment}>
                  {isPaying ? "Processing..." : "Pay Now"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===== Payment Loader ===== */}
        {isPaying && (
          <div className="payment-loader-overlay">
            <div className="payment-loader-box">
              <Loader />
            </div>
          </div>
        )}
      </main>
    </>
  );
}

export default Restaurant;
