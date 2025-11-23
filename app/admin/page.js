import { DollarSign, Package, ShoppingCart, Users } from 'lucide-react';

const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
    <div className={`p-3 rounded-full mr-4 ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  </div>
);

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">نظرة عامة</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="إجمالي الإيرادات" 
          value="١٢,٥٠٠ ر.س" 
          icon={<DollarSign className="text-white" />}
          color="bg-green-500"
        />
        <StatCard 
          title="إجمالي الطلبات" 
          value="٣٥٠" 
          icon={<ShoppingCart className="text-white" />}
          color="bg-blue-500"
        />
        <StatCard 
          title="إجمالي المنتجات" 
          value="٨٩" 
          icon={<Package className="text-white" />}
          color="bg-yellow-500"
        />
      </div>
    </div>
  );
}