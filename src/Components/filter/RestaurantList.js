import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../common/Loader";
import "../css/RestaurantList.css";

function RestaurantList({ restaurantList, getFilterResult, pagecount, isLoading }) {
  const navigate = useNavigate();
  const [currentGroup, setCurrentGroup] = useState(0);
  const pagesPerGroup = 4;

  if (isLoading) {
    return (
      <div className="blur-background">
        <Loader />
      </div>
    );
  }

  if (restaurantList.length === 0) {
    return <div className="restaurant-empty"><p>No Restaurant Found</p></div>;
  }

  const totalGroups = Math.ceil(pagecount / pagesPerGroup);
  const startPage = currentGroup * pagesPerGroup + 1;
  const endPage = Math.min(startPage + pagesPerGroup - 1, pagecount);

  const handlePrevGroup = () => {
    if (currentGroup > 0) setCurrentGroup(currentGroup - 1);
  };

  const handleNextGroup = () => {
    if (currentGroup < totalGroups - 1) setCurrentGroup(currentGroup + 1);
  };

  return (
    <div className="restaurant-list">
      {restaurantList.map((restaurant) => (
        <div
          className="restaurant-card"
          onClick={() => navigate("/restaurant/" + restaurant._id)}
          key={restaurant._id}
        >
          <div className="restaurant-info">
            <img
              src={"/images/" + restaurant.image}
              alt={restaurant.name}
              className="restaurant-img"
            />
            <div className="restaurant-details">
              <h3 className="restaurant-name">{restaurant.name}</h3>
              <p className="restaurant-location">
                <i className="fa fa-map-marker text-danger"></i> {restaurant.locality},{" "}
                {restaurant.city}
              </p>
            </div>
          </div>

          <hr className="divider" />

          <div className="restaurant-meta">
            <div className="meta-labels">
              <p>CUISINES:</p>
              <p>COST FOR TWO:</p>
            </div>
            <div className="meta-values">
              <p className="cuisine">
                {restaurant.cuisine && restaurant.cuisine.map((c) => c.name).join(", ")}
              </p>
              <p className="price">₹{restaurant.min_price}</p>
            </div>
          </div>
        </div>
      ))}

      {/* Pagination */}
      <div className="pagination">
        {/* Only show Prev/Next if more than 4 pages */}
        {pagecount > pagesPerGroup && (
          <button
            className="pagination-btn"
            disabled={currentGroup === 0}
            onClick={handlePrevGroup}
          >
            Prev
          </button>
        )}

        {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map(
          (pageNum) => (
            <button
              className="pagination-btn"
              key={pageNum}
              onClick={(event) => getFilterResult(event, "page")}
              value={pageNum}
            >
              {pageNum}
            </button>
          )
        )}

        {pagecount > pagesPerGroup && (
          <button
            className="pagination-btn"
            disabled={currentGroup >= totalGroups - 1}
            onClick={handleNextGroup}
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}

export default RestaurantList;
