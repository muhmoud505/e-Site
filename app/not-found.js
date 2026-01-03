export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-4 text-center">
      <h2 className="text-2xl md:text-3xl font-bold mb-4">الصفحة غير موجودة</h2>
      <p className="text-gray-600 mb-4">عذراً، الصفحة التي تبحث عنها غير موجودة</p>
      <a 
        href="/" 
        className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
      >
        العودة للصفحة الرئيسية
      </a>
    </div>
  );
}