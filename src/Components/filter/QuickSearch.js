import Header from "../common/Header";
import FilterOption from "./FilterOption";
import RestaurantList from "./RestaurantList";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import "../css/QuickSearch.css";

function QuickSearch() {
  let { meal_id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [locationList, setLocationList] = useState([]);
  const [restaurantList, setRestaurantList] = useState([]);
  const [pagecount, setPagecount] = useState(0);
  const [filterData, setFilterData] = useState({
    mealtype: meal_id,
  });

  localStorage.setItem("meal_id", meal_id);

  // Fetch locations
  const getLocationList = async () => {
    try {
      let { data } = await axios.get(
        "https://zomato-web-clone.onrender.com/api/get-location-list"
      );
      setLocationList(data.location);
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch restaurants based on filter
  const filterRestaurants = async () => {
    setIsLoading(true);
    try {
      let { data } = await axios.post(
        "https://zomato-web-clone.onrender.com/api/filter",
        filterData
      );
      setRestaurantList(data.status ? data.result : []);
      

      setPagecount(data.pageCount || 0);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  // Handle filter changes
  const getFilterResult = (event, type) => {
    let value = event.target.value;
    let _filterData = { ...filterData };

    switch (type) {
      case "location":
        _filterData["location"] = Number(value); // Pass as number
        break;
      case "sort":
        _filterData["sort"] = Number(value);
        break;
      case "costForTwo":
        let [l, h] = value.split("-");
        _filterData["l_cost"] = Number(l);
        _filterData["h_cost"] = Number(h);
        break;
      case "cuisine":
        _filterData["cuisine"] = [Number(value)];
        break;
      case "page":
        _filterData["page"] = Number(value);
        break;
      default:
        break;
    }

    setFilterData(_filterData);
  };

  useEffect(() => {
    getLocationList();
  }, []);

  useEffect(() => {
    filterRestaurants();
  }, [filterData]);

  return (
    <>
      <Header bg="solid-header" />
     <div className="restaurant-page">
  <aside className="filter-container">
    <FilterOption
      locationList={locationList}
      getFilterResult={getFilterResult}
    />
  </aside>

  <main className="restaurant-list-container">
    <h2 className="restaurant-heading">Best Places in this Area</h2>
    <RestaurantList
      isLoading={isLoading}
      restaurantList={restaurantList}
      getFilterResult={getFilterResult}
      pagecount={pagecount}
    />
  </main>
</div>

    </>
  );
}

export default QuickSearch;
