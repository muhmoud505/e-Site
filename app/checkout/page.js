import CheckoutClient from "@/components/CheckoutClient";

 export default function CheckoutPage() {
   return (
     <div className="container mx-auto px-4 py-12">
-      <div className="bg-white p-8 rounded-lg shadow-md text-center">
-        <h1 className="text-4xl font-bold text-gray-800 mb-4">
-          صفحة الدفع
-        </h1>
-        <p className="text-gray-600">هنا سيتم عرض محتويات سلة التسوق واستكمال عملية الشراء.</p>
-      </div>
+      <CheckoutClient />
     </div>
   );
 }