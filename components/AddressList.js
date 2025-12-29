'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { toast } from 'react-hot-toast';
import { deleteAddress, setDefaultAddress } from '@/app/dashboard/addresses/actions';
import { Trash2, Star, Home } from 'lucide-react';
import ConfirmationModal from './ConfirmationModal';

function ActionButton({ children, ...props }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} {...props}>
      {pending ? 'جاري...' : children}
    </button>
  );
}

export default function AddressList({ addresses }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);

  const handleDeleteClick = (addressId) => {
    setAddressToDelete(addressId);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (addressToDelete) {
      const toastId = toast.loading('جاري حذف العنوان...');
      try {
        const result = await deleteAddress(addressToDelete);
        if (result.status === 'success') {
          toast.success(result.message, { id: toastId });
        } else {
          toast.error(result.message, { id: toastId });
        }
      } catch (error) {
        console.error('Failed to delete address:', error);
        toast.error('فشل حذف العنوان.', { id: toastId });
      } finally {
        setIsModalOpen(false);
        setAddressToDelete(null);
      }
    }
  };

  if (!addresses || addresses.length === 0) {
    return (
      <div className="text-center p-8 border-2 border-dashed rounded-lg mt-8">
        <Home className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد عناوين محفوظة</h3>
        <p className="mt-1 text-sm text-gray-500">ابدأ بإضافة عنوان جديد باستخدام النموذج أعلاه.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4 mt-8">
        {addresses.map((address) => (
          <div key={address.id} className={`p-4 border rounded-lg flex justify-between items-start ${address.is_default ? 'border-purple-500 bg-purple-50' : 'border-gray-200'}`}>
            <div>
              {address.is_default && (
                <div className="flex items-center gap-2 text-sm font-semibold text-purple-700 mb-2">
                  <Star className="w-4 h-4 fill-current" />
                  <span>العنوان الإفتراضي</span>
                </div>
              )}
              <p className="font-semibold text-gray-800">{`${address.street}, ${address.building_number}`}</p>
              <p className="text-gray-600">{`${address.city}, ${address.country}`}</p>
            </div>
            <div className="flex gap-2 flex-shrink-0 ml-4">
              {!address.is_default && (
                <form action={setDefaultAddress.bind(null, address.id)}>
                  <ActionButton
                    className="p-2 text-gray-500 hover:text-purple-600"
                    title="تعيين كافتراضي"
                  >
                    <Star className="w-5 h-5" />
                  </ActionButton>
                </form>
              )}
              <button
                onClick={() => handleDeleteClick(address.id)}
                className="p-2 text-gray-500 hover:text-red-600"
                title="حذف العنوان"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="تأكيد الحذف"
        message="هل أنت متأكد أنك تريد حذف هذا العنوان؟ لا يمكن التراجع عن هذا الإجراء."
      />
    </>
  );
}