import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../common/Header";
import "../css/MainHeader.css";

function MainHeader() {
  const navigate = useNavigate();
  const [locationList, setLocationList] = useState([]);
  const [locationId, setLocationId] = useState("");
  const [restaurantInputText, setRestaurantInputText] = useState("");
  const [searchList, setSearchList] = useState([]);

  const searchBoxRef = useRef(null); // 👈 reference for outside click

  const getLocationList = async () => {
    try {
      const url = "https://zomato-web-clone.onrender.com/api/get-location-list";
      const { data } = await axios.get(url);
      setLocationList(data.location);
    } catch (err) {
      console.log(err);
    }
  };

  const getSelectValue = (event) => {
    setLocationId(event.target.value);
  };

  const searchForRestaurant = async (e) => {
    const { value } = e.target;
    setRestaurantInputText(value);
    if (value !== "") {
      const url = "https://zomato-web-clone.onrender.com/api/search-restaurant";
      const { data } = await axios.post(url, {
        restaurant: value,
        loc_id: locationId,
      });
      setSearchList(data.result);
    } else {
      setSearchList([]); // ✅ close dropdown when cleared
    }
  };

  // ✅ Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchBoxRef.current && !searchBoxRef.current.contains(event.target)) {
        setSearchList([]); // close dropdown
      }
    }

    function handleEsc(event) {
      if (event.key === "Escape") {
        setSearchList([]); // close dropdown
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  useEffect(() => {
    getLocationList();
  }, []);

  useEffect(() => {
    setRestaurantInputText("");
    setSearchList([]);
  }, [locationId]);

  return (
    <>
      <section className="main-header-container">
        <Header type="transparent" />
        <div className="main-hero fade-in">
          <p className="brand-name pop-in">a!</p>
          <h1 className="hero-heading slide-up">
            Discover the best restaurants, cafés & bars
          </h1>

          <div className="search-box-container fade-up" ref={searchBoxRef}>
            {/* Location Dropdown */}
            <div className="select-wrapper">
              <select
                className="form-select fixed-select"
                onChange={getSelectValue}
              >
                <option value="">Select Location</option>
                {locationList.map((location, index) => (
                  <option key={index} value={location.location_id}>
                    {location.name}, {location.city}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Box */}
            <div className="search-wrapper">
              <i className="fa fa-search search-icon text-danger"></i>
              <input
                type="text"
                className="form-control search-input"
                placeholder="Search for restaurants, cuisines or dishes"
                value={restaurantInputText}
                disabled={!locationId}
                onChange={searchForRestaurant}
              />
              {searchList.length > 0 && (
                <ul className="list-group search-suggestions fade-in">
                  {searchList.map((restaurant) => (
                    <li
                      key={restaurant._id}
                      className="list-group-item"
                      onClick={() => navigate("/restaurant/" + restaurant._id)}
                    >
                      {restaurant.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default MainHeader;
