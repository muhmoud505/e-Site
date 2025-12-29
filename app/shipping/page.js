export default function ShippingPage() {
  return (
    <div className="bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-4xl font-bold text-gray-800 mb-6 text-center">
            الشحن والتوصيل
          </h1>
          <div className="text-right text-gray-700 space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">خيارات الشحن</h2>
              <p>
                نحن نقدم خدمة الشحن السريع والموثوق لجميع مدن المملكة. يتم معالجة الطلبات في غضون 1-2 أيام عمل.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-2">مدة التوصيل</h2>
              <ul className="list-disc list-inside space-y-2">
                <li><strong>الشحن العادي:</strong> يستغرق من 3 إلى 5 أيام عمل.</li>
                <li><strong>الشحن السريع:</strong> يستغرق من 1 إلى 2 أيام عمل.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

