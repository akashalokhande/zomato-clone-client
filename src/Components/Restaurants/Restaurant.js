import axios from "axios";
import { useEffect, useState, useRef } from "react";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from "react-responsive-carousel";
import { useParams } from "react-router-dom";
import Header from "../common/Header";
import jwtDecode from "jwt-decode";
import Swal from "sweetalert2";
import Loader from "../common/Loader";
import "../css/Restaurant.css";

function Restaurant() {
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
  const { id } = useParams();

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

  const [rDetails, setRDetails] = useState({ ...initRestaurant });
  const [menuList, setMenuList] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [menuLoading, setMenuLoading] = useState(true);

  const [showGallery, setShowGallery] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showUserDetails, setShowUserDetails] = useState(false);

  const [activeTab, setActiveTab] = useState("overview"); // for tabs (overview | contact)

  // refs for focus management
  const drawerRef = useRef(null);
  const galleryCloseRef = useRef(null);
  const userModalCloseRef = useRef(null);

  // fetch restaurant details
  const getRestaurantDetails = async () => {
    try {
      const url = `https://zomato-web-clone.onrender.com/api/get-restaurant-details-by-id/${id}`;
      const { data } = await axios.get(url);
      if (data.status === true) setRDetails({ ...data.restaurants });
      else setRDetails({ ...initRestaurant });
    } catch (err) {
      console.error(err);
      setRDetails({ ...initRestaurant });
    } finally {
      setIsLoading(false);
    }
  };

  // fetch menu items
  const getMenuItems = async () => {
    setMenuLoading(true);
    try {
      const url = `https://zomato-web-clone.onrender.com/api/get-menu-items/${id}`;
      const { data } = await axios.get(url);
      if (data.status === true) {
        const normalized = data.menu_items.map((m) => ({
          ...m,
          qty: m.qty || 0,
        }));
        setMenuList(normalized);
      } else setMenuList([]);
    } catch (err) {
      console.error(err);
      setMenuList([]);
    } finally {
      setTotalPrice(0);
      setMenuLoading(false);
    }
  };

  useEffect(() => {
    getRestaurantDetails();
  }, [id]);

  // keyboard: Escape to close open overlays
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") {
        if (showGallery) setShowGallery(false);
        else if (showUserDetails) setShowUserDetails(false);
        else if (showDrawer) setShowDrawer(false);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [showGallery, showDrawer, showUserDetails]);

  // focus drawer when it opens
  useEffect(() => {
    if (showDrawer && drawerRef.current) {
      // small delay to allow transition
      setTimeout(() => drawerRef.current.focus(), 150);
      // fetch menu when opening
    }
  }, [showDrawer]);

  // handlers
  const addItem = (index) => {
    const _menu = [...menuList];
    _menu[index].qty = (_menu[index].qty || 0) + 1;
    setMenuList(_menu);
    setTotalPrice((p) => p + Number(_menu[index].price));
  };

  const removeItem = (index) => {
    const _menu = [...menuList];
    if (!_menu[index].qty) return;
    _menu[index].qty -= 1;
    setMenuList(_menu);
    setTotalPrice((p) => p - Number(_menu[index].price));
  };

  const makePayment = async () => {
    const userOrder = menuList.filter((m) => m.qty > 0);
    if (userOrder.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "No items selected",
        text: "Please add items to your order.",
      });
      return;
    }
    if (!user) {
      Swal.fire({
        icon: "info",
        title: "Please login",
        text: "You must be logged in to place an order.",
      });
      return;
    }

    try {
      const url = "https://zomato-web-clone.onrender.com/api/gen-order-id";
      const { data } = await axios.post(url, { amount: totalPrice });
      if (!data.status) {
        Swal.fire({
          icon: "error",
          title: "Unable to generate order",
          text: "Try again later.",
        });
        return;
      }
      const { order } = data;

      const options = {
        key: "rzp_test_RSx7Q9g70RddsF",
        amount: order.amount,
        currency: order.currency,
        name: rDetails.name || "Zomato Order",
        description: "Order payment",
        image: "/images/" + rDetails.image,
        order_id: order.id,
        handler: async function (response) {
          const verifyData = {
            payment_id: response.razorpay_payment_id,
            order_id: response.razorpay_order_id,
            signature: response.razorpay_signature,
            name: user.name,
            mobile: user.mobile || "9999999999",
            email: user.email,
            order_list: userOrder,
            totalAmount: totalPrice,
          };
          try {
            const { data } = await axios.post(
              "https://zomato-web-clone.onrender.com/api/verify-payment",
              verifyData
            );
            if (data.status === true) {
              Swal.fire({
                position: "center",
                icon: "success",
                title: "Order Successful!",
                showConfirmButton: false,
                timer: 1800,
              }).then(() => window.location.assign("/"));
            } else {
              Swal.fire({
                icon: "error",
                title: "Payment verification failed",
              });
            }
          } catch (err) {
            console.error(err);
            Swal.fire({ icon: "error", title: "Payment verification error" });
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.mobile || "9999999999",
        },
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Payment error",
        text: "Could not start payment.",
      });
    }
  };

  const openOrderDrawer = async () => {
    await getMenuItems();
    setShowDrawer(true);
  };

  return (
    <>
      {isLoading ? (
        <div className="page-loader">
          <Loader />
        </div>
      ) : (
        <>
          <Header bg="solid-header" />

          <main className="restaurant-page">
            {/* Hero */}
            <section className="restaurant-hero">
              <img
                src={"/images/" + rDetails.image}
                alt={rDetails.name}
                className="hero-img"
              />
              <div className="hero-overlay">
                <div className="hero-info">
                  <h1 className="hero-title">{rDetails.name}</h1>
                  <p className="hero-sub">
                    {rDetails.locality}, {rDetails.city} •{" "}
                    {rDetails.rating_text} ({rDetails.aggregate_rating})
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

            {/* content area */}
            <section className="restaurant-content">
              <div className="tabs" role="tablist" aria-label="Restaurant tabs">
                <button
                  role="tab"
                  aria-selected={activeTab === "overview"}
                  className={`tab ${activeTab === "overview" ? "active" : ""}`}
                  onClick={() => setActiveTab("overview")}
                >
                  Overview
                </button>
                <button
                  role="tab"
                  aria-selected={activeTab === "contact"}
                  className={`tab ${activeTab === "contact" ? "active" : ""}`}
                  onClick={() => setActiveTab("contact")}
                >
                  Contact
                </button>
              </div>

              {/* Fade panels */}
              <div className="fade-panels">
                <article
                  className={`fade-panel ${
                    activeTab === "overview" ? "visible" : ""
                  }`}
                  role="tabpanel"
                  aria-hidden={activeTab !== "overview"}
                >
                  <h3>About this place</h3>
                  <div className="info-row">
                    <div>
                      <p className="label">Cuisine</p>
                      <p className="value">
                        {rDetails.cuisine.map((c) => c.name).join(", ")}
                      </p>
                    </div>
                    <div>
                      <p className="label">Average Cost</p>
                      <p className="value">
                        ₹{rDetails.min_price} for two people (approx.)
                      </p>
                    </div>
                  </div>
                </article>

                <article
                  className={`fade-panel ${
                    activeTab === "contact" ? "visible" : ""
                  }`}
                  role="tabpanel"
                  aria-hidden={activeTab !== "contact"}
                >
                  <div className="contact-card">
                    <p className="label">Phone</p>
                    <p className="value">+{rDetails.contact_number}</p>
                    <p className="label">Address</p>
                    <p className="value">
                      {rDetails.locality}, {rDetails.city}
                    </p>
                  </div>
                </article>
              </div>
            </section>

            {/* Gallery Modal */}
            {showGallery && (
              <div
                className="gallery-modal"
                onClick={() => setShowGallery(false)}
                role="dialog"
                aria-modal="true"
              >
                <div
                  className="gallery-card"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    ref={galleryCloseRef}
                    className="gallery-close"
                    onClick={() => setShowGallery(false)}
                  >
                    ×
                  </button>
                  <Carousel showThumbs={false} infiniteLoop>
                    {rDetails.thumb && rDetails.thumb.length ? (
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

            {/* Order Drawer */}
            <aside
              ref={drawerRef}
              tabIndex={-1}
              className={`order-drawer ${showDrawer ? "open" : ""}`}
              aria-hidden={!showDrawer}
              aria-label="Order panel"
            >
              <div className="drawer-header">
                <h3>{rDetails.name} — Order</h3>
                <button
                  className="drawer-close"
                  onClick={() => setShowDrawer(false)}
                >
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
                        menuList.map((menu, idx) => (
                          <div className="menu-row" key={menu._id}>
                            <div className="menu-left">
                              <p className="menu-name">{menu.name}</p>
                              <p className="menu-desc">{menu.description}</p>
                            </div>
                            <div className="menu-right">
                              <p className="menu-price">₹{menu.price}</p>
                              {menu.qty === 0 ? (
                                <button
                                  className="add-btn"
                                  onClick={() => addItem(idx)}
                                >
                                  Add
                                </button>
                              ) : (
                                <div className="qty-control">
                                  <button onClick={() => removeItem(idx)}>
                                    -
                                  </button>
                                  <span>{menu.qty}</span>
                                  <button onClick={() => addItem(idx)}>
                                    +
                                  </button>
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
                        <button
                          className="btn-outline"
                          onClick={() => setShowDrawer(false)}
                        >
                          Continue Shopping
                        </button>
                        <button
                          className="btn-primary"
                          onClick={() => {
                            if (!user) {
                              Swal.fire({
                                icon: "info",
                                title: "Login required",
                                text: "Please login to continue.",
                              });
                              return;
                            }
                            setShowUserDetails(true);
                          }}
                        >
                          Checkout
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </aside>

            {/* User Details Modal */}
            {showUserDetails && (
              <div
                className="user-modal"
                onClick={() => setShowUserDetails(false)}
              >
                <div className="user-card" onClick={(e) => e.stopPropagation()}>
                  <button
                    ref={userModalCloseRef}
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
                      Pay Now
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </>
      )}
    </>
  );
}

export default Restaurant;
