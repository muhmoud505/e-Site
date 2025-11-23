const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-center md:text-right">
          <div>
            <h3 className="text-xl font-bold mb-4">متجر الأناقة</h3>
            <p className="text-gray-400">
              وجهتك الأولى للتسوق الإلكتروني بأفضل الأسعار والجودة العالية
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">روابط سريعة</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white">من نحن</a></li>
              <li><a href="#" className="hover:text-white">سياسة الإرجاع</a></li>
              <li><a href="#" className="hover:text-white">الشحن والتوصيل</a></li>
              <li><a href="#" className="hover:text-white">اتصل بنا</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">خدمة العملاء</h4>
            <ul className="space-y-2 text-gray-400">
              <li>الهاتف: +966 11 345 6789</li>
              <li>البريد: support@store.com</li>
              <li>الدعم: على مدار 24/7</li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">طرق الدفع</h4>
            <div className="flex gap-4">
              <div className="w-10 h-6 bg-blue-600 rounded flex items-center justify-center text-xs font-bold">VISA</div>
              <div className="w-10 h-6 bg-red-600 rounded flex items-center justify-center text-xs font-bold">MC</div>
              <div className="w-10 h-6 bg-green-600 rounded flex items-center justify-center text-xs font-bold">STC</div>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 متجر الأناقة. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;