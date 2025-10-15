import "../css/FilterOption.css";

function FilterOption({ locationList, getFilterResult }) {
  return (
    <div className="filter-container">
      <div className="filter-header">
        <h4>Filter</h4>
      </div>

      {/* Location Filter */}
      <div className="filter-section">
        <label className="filter-label">Select Location</label>
        <select
          className="filter-select"
          onChange={(event) => getFilterResult(event, "location")}
        >
          <option value="">Select</option>
          {locationList &&
            locationList.map((location) => (
              <option key={location.location_id} value={location.location_id}>
                {location.name}, {location.city}
              </option>
            ))}
        </select>
      </div>

      {/* Cuisine Filter */}
      <div className="filter-section">
        <p className="filter-title">Cuisine</p>
        {[
          { id: 1, name: "North Indian" },
          { id: 2, name: "South Indian" },
          { id: 3, name: "Chinese" },
          { id: 4, name: "Fast Food" },
          { id: 5, name: "Street Food" },
        ].map((item) => (
          <label key={item.id} className="filter-option">
            <input
              type="checkbox"
              value={item.id}
              onChange={(event) => getFilterResult(event, "cuisine")}
            />
            {item.name}
          </label>
        ))}
      </div>

      {/* Cost for Two */}
      <div className="filter-section">
        <p className="filter-title">Cost for Two</p>
        {[
          { value: "0-500", label: "Less than 500" },
          { value: "500-1000", label: "500 to 1000" },
          { value: "1000-1500", label: "1000 to 1500" },
          { value: "1500-2000", label: "1500 to 2000" },
          { value: "2000-9999999", label: "2000+" },
        ].map((item) => (
          <label key={item.value} className="filter-option">
            <input
              type="radio"
              name="cost"
              value={item.value}
              onChange={(event) => getFilterResult(event, "costForTwo")}
            />
            {item.label}
          </label>
        ))}
      </div>

      {/* Sort Filter */}
      <div className="filter-section">
        <p className="filter-title">Sort</p>
        <label className="filter-option">
          <input
            type="radio"
            name="sort"
            value="1"
            onChange={(event) => getFilterResult(event, "sort")}
          />
          Price low to high
        </label>
        <label className="filter-option">
          <input
            type="radio"
            name="sort"
            value="-1"
            onChange={(event) => getFilterResult(event, "sort")}
          />
          Price high to low
        </label>
      </div>
    </div>
  );
}

export default FilterOption;
