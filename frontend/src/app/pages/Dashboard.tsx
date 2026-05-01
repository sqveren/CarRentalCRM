import { BarChart3, Car, CreditCard, DollarSign, Download, FileText, Users } from "lucide-react";
import { useEffect, useState } from "react";
import {
  ApiCar,
  ApiClient,
  ApiFine,
  ApiPayment,
  ApiRental,
  finesApi,
  getAuthSession,
  carsApi,
  clientsApi,
  paymentsApi,
  rentalsApi,
  toDateTimeLabel,
  toNumber,
} from "../api";

export default function Dashboard() {
  const session = getAuthSession();
  const role = session?.employee.role ?? "operator";
  const [cars, setCars] = useState<ApiCar[]>([]);
  const [rentals, setRentals] = useState<ApiRental[]>([]);
  const [clients, setClients] = useState<ApiClient[]>([]);
  const [payments, setPayments] = useState<ApiPayment[]>([]);
  const [fines, setFines] = useState<ApiFine[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadData() {
      try {
        setError("");
        const rentalsPromise = rentalsApi.list();
        const carsPromise = role === "admin" ? carsApi.list() : Promise.resolve([]);
        const clientsPromise = role === "admin" || role === "manager" ? clientsApi.list() : Promise.resolve([]);
        const paymentsPromise = role === "admin" || role === "operator" ? paymentsApi.list() : Promise.resolve([]);
        const finesPromise = role === "admin" ? finesApi.list() : Promise.resolve([]);

        const [rentalsData, carsData, clientsData, paymentsData, finesData] = await Promise.all([
          rentalsPromise,
          carsPromise,
          clientsPromise,
          paymentsPromise,
          finesPromise,
        ]);

        if (!ignore) {
          setRentals(rentalsData);
          setCars(carsData);
          setClients(clientsData);
          setPayments(paymentsData);
          setFines(finesData);
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Failed to load dashboard data.");
        }
      }
    }

    void loadData();

    return () => {
      ignore = true;
    };
  }, [role]);

  const activeRentals = rentals.filter((rental) => rental.status === "active");
  const today = new Date().toISOString().slice(0, 10);
  const todayPayments = payments.filter((payment) => payment.paymentDate?.slice(0, 10) === today);
  const currentMonth = today.slice(0, 7);
  const monthPayments = payments.filter((payment) => payment.paymentDate?.slice(0, 7) === currentMonth);
  const totalRevenue = payments.reduce((sum, payment) => sum + toNumber(payment.amount), 0);
  const todayRevenue = todayPayments.reduce((sum, payment) => sum + toNumber(payment.amount), 0);
  const monthRevenue = monthPayments.reduce((sum, payment) => sum + toNumber(payment.amount), 0);
  const totalFines = fines.reduce((sum, fine) => sum + toNumber(fine.amount), 0);
  const completedRentals = rentals.filter((rental) => rental.status === "completed");
  const unavailableCars = cars.filter((car) => car.status !== "available").length;
  const fleetUtilization = cars.length ? Math.round((unavailableCars / cars.length) * 100) : 0;
  const topCars = Object.values(
    rentals.reduce<Record<number, { car: string; count: number; revenue: number }>>((acc, rental) => {
      const key = rental.carId;
      const carName = rental.car ? `${rental.car.brand} ${rental.car.model}` : `Car #${rental.carId}`;
      acc[key] ??= { car: carName, count: 0, revenue: 0 };
      acc[key].count += 1;
      acc[key].revenue += toNumber(rental.totalPrice);
      return acc;
    }, {}),
  )
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const stats =
    role === "admin"
      ? [
          { icon: Car, label: "Total Cars", value: cars.length, color: "bg-blue-500" },
          { icon: Car, label: "Available Cars", value: cars.filter((car) => car.status === "available").length, color: "bg-green-500" },
          { icon: FileText, label: "Active Rentals", value: activeRentals.length, color: "bg-orange-500" },
          { icon: DollarSign, label: "Month Revenue", value: `$${monthRevenue.toLocaleString()}`, color: "bg-purple-500" },
          { icon: CreditCard, label: "Total Revenue", value: `$${totalRevenue.toLocaleString()}`, color: "bg-emerald-500" },
          { icon: FileText, label: "Completed Rentals", value: completedRentals.length, color: "bg-indigo-500" },
          { icon: BarChart3, label: "Fleet Utilization", value: `${fleetUtilization}%`, color: "bg-slate-700" },
          { icon: DollarSign, label: "Total Fines", value: `$${totalFines.toLocaleString()}`, color: "bg-red-500" },
        ]
      : role === "manager"
        ? [
            { icon: FileText, label: "Active Rentals", value: activeRentals.length, color: "bg-orange-500" },
            { icon: Users, label: "Clients", value: clients.length, color: "bg-blue-500" },
          ]
        : [
            { icon: FileText, label: "Active Rentals", value: activeRentals.length, color: "bg-orange-500" },
            { icon: CreditCard, label: "Today's Payments", value: `$${todayRevenue.toLocaleString()}`, color: "bg-green-500" },
          ];

  const rentalsForTable = activeRentals.slice(0, 5);

  function downloadCsv(filename: string, rows: Array<Record<string, string | number | null | undefined>>) {
    if (!rows.length) {
      return;
    }

    const headers = Object.keys(rows[0]);
    const escapeCell = (value: string | number | null | undefined) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;
    const csv = [
      headers.join(","),
      ...rows.map((row) => headers.map((header) => escapeCell(row[header])).join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  function exportRentalsCsv() {
    downloadCsv(
      "rentals.csv",
      rentals.map((rental) => ({
        id: rental.id,
        client: rental.client ? `${rental.client.firstName} ${rental.client.lastName}` : "",
        car: rental.car ? `${rental.car.brand} ${rental.car.model}` : "",
        employee: rental.employee ? `${rental.employee.firstName} ${rental.employee.lastName}` : "",
        startDate: rental.startDate,
        endDate: rental.endDate,
        status: rental.status,
        totalPrice: toNumber(rental.totalPrice),
      })),
    );
  }

  function exportPaymentsCsv() {
    downloadCsv(
      "payments.csv",
      payments.map((payment) => ({
        id: payment.id,
        rentalId: payment.rentalId,
        client: payment.rental?.client ? `${payment.rental.client.firstName} ${payment.rental.client.lastName}` : "",
        car: payment.rental?.car ? `${payment.rental.car.brand} ${payment.rental.car.model}` : "",
        amount: toNumber(payment.amount),
        paymentDate: payment.paymentDate,
      })),
    );
  }

  function exportCarsCsv() {
    downloadCsv(
      "cars.csv",
      cars.map((car) => ({
        id: car.id,
        brand: car.brand,
        model: car.model,
        year: car.manufactureYear,
        mileage: car.mileage,
        status: car.status,
        category: car.category?.name,
        pricePerDay: toNumber(car.category?.pricePerDay),
        imageUrl: car.imageUrl,
      })),
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600 capitalize">{role} workspace overview</p>
          </div>
          {role === "admin" ? (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={exportRentalsCsv}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <Download size={16} />
                Export Rentals CSV
              </button>
              <button
                onClick={exportPaymentsCsv}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <Download size={16} />
                Export Payments CSV
              </button>
              <button
                onClick={exportCarsCsv}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <Download size={16} />
                Export Cars CSV
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {error ? (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-gray-600 text-sm">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {role === "admin" ? (
        <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm xl:col-span-2">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Top Cars by Rentals</h2>
                <p className="text-sm text-gray-500">Most frequently used fleet vehicles</p>
              </div>
              <BarChart3 className="text-blue-600" size={24} />
            </div>
            <div className="space-y-4">
              {topCars.length ? topCars.map((item) => (
                <div key={item.car}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-800">{item.car}</span>
                    <span className="text-gray-500">
                      {item.count} rentals / ${item.revenue.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100">
                    <div
                      className="h-2 rounded-full bg-blue-600"
                      style={{ width: `${Math.max(12, (item.count / Math.max(1, topCars[0].count)) * 100)}%` }}
                    />
                  </div>
                </div>
              )) : (
                <p className="text-sm text-gray-600">No rentals yet.</p>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-lg font-semibold text-gray-900">Fleet Status</h2>
            <div className="space-y-3">
              {["available", "rented", "maintenance", "cleaning", "damaged"].map((status) => {
                const count = cars.filter((car) => car.status === status).length;
                return (
                  <div key={status} className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
                    <span className="capitalize text-gray-700">{status}</span>
                    <span className="font-semibold text-gray-900">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {role === "manager" ? "Clients and Active Rentals" : "Active Rentals"}
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Car</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {rentalsForTable.map((rental) => (
                <tr key={rental.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {rental.client ? `${rental.client.firstName} ${rental.client.lastName}` : "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {rental.car ? `${rental.car.brand} ${rental.car.model}` : "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{toDateTimeLabel(rental.startDate)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{toDateTimeLabel(rental.endDate)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                      {rental.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${toNumber(rental.totalPrice).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
