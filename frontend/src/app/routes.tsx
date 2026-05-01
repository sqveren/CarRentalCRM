import { createBrowserRouter } from "react-router";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Cars from "./pages/Cars";
import Clients from "./pages/Clients";
import Rentals from "./pages/Rentals";
import RentalDetails from "./pages/RentalDetails";
import Services from "./pages/Services";
import Employees from "./pages/Employees";
import CarCategories from "./pages/CarCategories";
import Payments from "./pages/Payments";
import Fines from "./pages/Fines";
import Login from "./pages/Login";
import Register from "./pages/Register";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/register",
    Component: Register,
  },
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "employees", Component: Employees },
      { path: "car-categories", Component: CarCategories },
      { path: "cars", Component: Cars },
      { path: "clients", Component: Clients },
      { path: "rentals", Component: Rentals },
      { path: "rentals/:id", Component: RentalDetails },
      { path: "services", Component: Services },
      { path: "payments", Component: Payments },
      { path: "fines", Component: Fines },
    ],
  },
]);
