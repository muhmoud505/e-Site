export default function ReturnPolicyPage() {
  return (
    <div className="bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-4xl font-bold text-gray-800 mb-6 text-center">
            سياسة الإرجاع
          </h1>
          <div className="text-right text-gray-700 space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">شروط الإرجاع</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>يجب أن تتم عملية الإرجاع في غضون 14 يومًا من تاريخ استلام الطلب.</li>
                <li>يجب أن يكون المنتج في حالته الأصلية، غير مستخدم، مع جميع البطاقات والملصقات الأصلية.</li>
                <li>المنتجات المخفضة أو التي تم شراؤها خلال عروض التصفية غير قابلة للإرجاع.</li>
              </ul>
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-2">كيفية الإرجاع</h2>
              <p>
                للبدء في عملية الإرجاع، يرجى التواصل مع فريق خدمة العملاء لدينا عبر البريد الإلكتروني أو الهاتف مع توفير رقم طلبك وتفاصيل المنتج الذي ترغب في إرجاعه.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

