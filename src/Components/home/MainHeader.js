import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../common/Header";

function MainHeader() {
  let navigate = useNavigate();
  let [locationList, setLocationList] = useState([]);
  let [locationId, setLocationId] = useState("");
  let [restaurantInputText, setRestaurantInputText] = useState("");
  let [searchList, setSearchList] = useState([]);


  let getLocationList = async () => {
    let url = "https://zomato-web-clone.onrender.com/api/get-location-list";
    let { data } = await axios.get(url);
    console.log(data.location);
    setLocationList(data.location);
    console.log(localStorage.getItem("auth_token"))
  };

  let getSelectValue = (event) => {
    let { value } = event.target;
    setLocationId(value);
  };
  let searchForRestaurant = async (e) => {
    let { value } = e.target;
    setRestaurantInputText(value);
    if (value !== "") {
      let url = "https://zomato-web-clone.onrender.com/api/search-restaurant";
      let { data } = await axios.post(url, {
        restaurant: value,
        loc_id: locationId,
      });
      setSearchList(data.result);
    }
  };

  useEffect(() => {
    setRestaurantInputText("");
    setSearchList([]);
  }, [locationId]);

  useEffect(() => {
    getLocationList();
  }, []);

  return (
    <>
      <section className="row main-section align-content-start">
       <Header/>
        <section className="col-12 d-flex flex-column align-items-center justify-content-center">
          <p className="brand-name fw-bold my-lg-2 mb-0">e!</p>
          <p className="h1 text-white my-3 text-center">
            Find the best restaurants, cafés, and bars
          </p>
          <div className="search w-50 d-flex mt-3">
            <select
              type="text"
              className="form-control mb-3 mb-lg-0 w-50 me-lg-3 py-2 px-3"
              placeholder="Please type a Location"
              onChange={getSelectValue}
            >
              <option>--- Select Location ---</option>
              {locationList.map((location, index) => {
                return (
                  <option key={index}  value={location.location_id}>
                    {location.name},{location.city}
                  </option>
                );
              })}
            </select>
            <div className="w-75 input-group relative">
              <span className="input-group-text bg-white">
                <i className="fa fa-search text-primary"></i>
              </span>
              <input
                type="text"
                className="form-control py-2 px-3"
                placeholder="Search for restaurants"
                value={restaurantInputText}
                disabled={locationId === "" ? true : false}
                onChange={searchForRestaurant}
              />
               <ul className="list-group absolute bottom-0 w-100">
                {searchList.map((restaurant) => {
                  return (
                    <li
                      key={restaurant._id}
                      className="list-group-item"
                      onClick={() => navigate("/restaurant/" + restaurant._id)}
                    >
                      {restaurant.name}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </section>
      </section>
    </>
  );
}

export default MainHeader;
