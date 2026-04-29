import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Calendar, Car, DollarSign, User } from "lucide-react";
import { ApiRental, rentalsApi, toDateTimeLabel, toNumber } from "../api";
import Badge from "../components/Badge";

export default function RentalDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rental, setRental] = useState<ApiRental | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) {
      setError("Rental ID is missing.");
      return;
    }

    let ignore = false;

    async function loadRental() {
      try {
        setError("");
        const rentalData = await rentalsApi.get(Number(id));
        if (!ignore) {
          setRental(rentalData);
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Failed to load rental details.");
        }
      }
    }

    void loadRental();

    return () => {
      ignore = true;
    };
  }, [id]);

  if (!rental) {
    return (
      <div className="p-8">
        <button
          onClick={() => navigate("/rentals")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={20} />
          Back to Rentals
        </button>
        <p className="text-gray-600">{error || "Loading..."}</p>
      </div>
    );
  }

  const car = rental.car;
  const client = rental.client;
  const employee = rental.employee;
  const services = rental.rentalServices?.map((item) => item.service).filter(Boolean) ?? [];

  if (!car || !client) {
    return (
      <div className="p-8">
        <button
          onClick={() => navigate("/rentals")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={20} />
          Back to Rentals
        </button>
        <p className="text-gray-600">Rental relationships are incomplete.</p>
      </div>
    );
  }

  const startDate = new Date(rental.startDate);
  const endDate = new Date(rental.endDate);
  const durationMs = endDate.getTime() - startDate.getTime();
  const days = Math.max(1, Math.ceil(durationMs / (1000 * 60 * 60 * 24)));
  const carCost = toNumber(rental.totalPrice);
  const servicesCost = services.reduce((sum, service) => sum + toNumber(service?.price), 0);
  const totalCost = carCost + servicesCost;

  return (
    <div className="p-8">
      <button
        onClick={() => navigate("/rentals")}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft size={20} />
        Back to Rentals
      </button>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Rental Details</h1>
          <p className="text-gray-600">Rental ID: #{rental.id}</p>
        </div>
        <Badge status={rental.status} variant="rental" />
      </div>

      {error ? (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 p-2 rounded-lg">
              <User size={24} className="text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Client Information</h2>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="text-gray-900 font-medium">{client.firstName} {client.lastName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-gray-900">{client.email ?? "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="text-gray-900">{client.phone ?? "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Document</p>
              <p className="text-gray-900">{client.documentNumber ?? "N/A"}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-green-100 p-2 rounded-lg">
              <Car size={24} className="text-green-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Car Information</h2>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Vehicle</p>
              <p className="text-gray-900 font-medium">{car.brand} {car.model}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Year</p>
              <p className="text-gray-900">{car.manufactureYear}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Category</p>
              <p className="text-gray-900">{car.category?.name ?? "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Price per Day</p>
              <p className="text-gray-900">${toNumber(car.category?.pricePerDay).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Processed By</p>
              <p className="text-gray-900">
                {employee ? `${employee.firstName} ${employee.lastName}` : "N/A"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Calendar size={24} className="text-purple-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Rental Period</h2>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Start Date</p>
              <p className="text-gray-900 font-medium">{toDateTimeLabel(rental.startDate)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">End Date</p>
              <p className="text-gray-900 font-medium">{toDateTimeLabel(rental.endDate)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Duration</p>
              <p className="text-gray-900">{days} day{days !== 1 ? "s" : ""}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Start Mileage</p>
              <p className="text-gray-900">{rental.startMileage ?? "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">End Mileage</p>
              <p className="text-gray-900">{rental.endMileage ?? "N/A"}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-orange-100 p-2 rounded-lg">
            <DollarSign size={24} className="text-orange-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Cost Breakdown</h2>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center pb-4 border-b border-gray-200">
            <div>
              <p className="text-gray-900 font-medium">Car Rental</p>
              <p className="text-sm text-gray-500">
                {days} days x ${toNumber(car.category?.pricePerDay).toLocaleString()}/day
              </p>
            </div>
            <p className="text-gray-900 font-semibold">${carCost.toLocaleString()}</p>
          </div>

          {services.length > 0 && (
            <div className="pb-4 border-b border-gray-200">
              <p className="text-gray-900 font-medium mb-3">Additional Services</p>
              <div className="space-y-2">
                {services.map((service) => (
                  <div key={service?.id} className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">{service?.name}</p>
                    <p className="text-sm text-gray-900">${toNumber(service?.price).toLocaleString()}</p>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
                <p className="text-sm font-medium text-gray-700">Services Subtotal</p>
                <p className="text-sm font-semibold text-gray-900">${servicesCost.toLocaleString()}</p>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center pt-2">
            <p className="text-lg font-semibold text-gray-900">Total Cost</p>
            <p className="text-2xl font-bold text-blue-600">${totalCost.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
