import { Outlet, Link, useLocation, useNavigate } from "react-router";
import { LayoutDashboard, Car, Users, FileText, Wrench, CreditCard, AlertTriangle, LogOut, UserCog, Tags } from "lucide-react";
import { useEffect } from "react";
import { clearAuthSession, getAuthSession } from "../api";
import { canAccessPath } from "../access";

const navItems = [
  { path: "/", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/employees", icon: UserCog, label: "Employees" },
  { path: "/car-categories", icon: Tags, label: "Car Categories" },
  { path: "/cars", icon: Car, label: "Cars" },
  { path: "/clients", icon: Users, label: "Clients" },
  { path: "/rentals", icon: FileText, label: "Rentals" },
  { path: "/services", icon: Wrench, label: "Services" },
  { path: "/payments", icon: CreditCard, label: "Payments" },
  { path: "/fines", icon: AlertTriangle, label: "Fines" },
];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const session = getAuthSession();
  const role = session?.employee.role;

  useEffect(() => {
    if (!session) {
      navigate("/login");
      return;
    }

    if (!canAccessPath(session.employee.role, location.pathname)) {
      navigate("/");
    }
  }, [location.pathname, navigate, session]);

  const handleLogout = () => {
    clearAuthSession();
    navigate("/login");
  };

  if (!session || !role) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900">Car Rental Admin</h1>
          <p className="mt-1 text-sm capitalize text-gray-500">
            {session.employee.firstName} {session.employee.lastName} - {role}
          </p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {navItems.filter((item) => canAccessPath(role, item.path)).map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== "/" && location.pathname.startsWith(item.path));
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
