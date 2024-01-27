import { Route, Routes } from "react-router-dom";
import Home from "./Components/home/Home";
import QuickSearch from "./Components/filter/QuickSearch";
import Restaurant from "./Components/Restaurants/Restaurant";
import LoginPage from "./Components/user/LoginPage";
import ProtectedRoutes from "./Components/utils/PrivateRoutes";

function APP() {
  return (
    <>
      <main className="container-fluid">
        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/quick-search/:meal_id" element={<QuickSearch />} />
          {/* <Route path="/quick-search" element={<SearchPage />} /> */}

          <Route element={<ProtectedRoutes />}>
            <Route path="/restaurant/:id" element={<Restaurant />} />
          </Route>
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </main>
    </>
  );
}

export default APP;
