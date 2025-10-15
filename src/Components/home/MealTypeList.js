import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../common/Loader";
import "../css/MealTypeList.css";

function MealTypeList() {
  const [mealList, setMealList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const getMenuListFromServer = async () => {
    try {
      const url = "https://zomato-web-clone.onrender.com/api/get-meal-types-list";
      const { data } = await axios.get(url);
      setMealList(data.meal_types);
    } catch (err) {
      console.log("Error fetching meal types:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getMenuListFromServer();
  }, []);

  if (isLoading) {
    return (
      <div className="blur-background">
        <Loader />
      </div>
    );
  }

  return (
    <section className="mealtype-container">
      <div className="mealtype-header">
        <h3>Quick Searches</h3>
        <p>Discover restaurants by type of meal</p>
      </div>

      <div className="mealtype-grid">
        {mealList.map((meal) => (
          <div
            key={meal._id}
            className="mealtype-card"
            onClick={() => navigate("/quick-search/" + meal.meal_type)}
          >
            <img
              src={"/images/" + meal.image}
              alt={meal.name}
              className="mealtype-img"
            />
            <div className="mealtype-info">
              <h4>{meal.name}</h4>
              <p>{meal.content}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default MealTypeList;
