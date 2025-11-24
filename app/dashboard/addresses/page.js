import { getSession } from '@/lib/session';
import db from '@/lib/db';
import { MapPin, Trash2, CheckCircle } from 'lucide-react';
import AddressForm from '@/components/AddressForm';
import { deleteAddress, setDefaultAddress } from './actions';

function DeleteButton({ addressId }) {
    const deleteAddressWithId = deleteAddress.bind(null, addressId);
    return (
        <form action={deleteAddressWithId}>
            <button type="submit" className="text-gray-400 hover:text-red-500 transition-colors">
                <Trash2 size={18} />
            </button>
        </form>
    );
}

function SetDefaultButton({ addressId, isDefault }) {
    if (isDefault) {
        return (
            <div className="flex items-center gap-1 text-green-600 font-semibold">
                <CheckCircle size={18} />
                <span>الإفتراضي</span>
            </div>
        );
    }
    const setDefaultAddressWithId = setDefaultAddress.bind(null, addressId);
    return (
        <form action={setDefaultAddressWithId}>
            <button type="submit" className="text-sm text-purple-600 hover:text-purple-800 font-semibold">
                تعيين كإفتراضي
            </button>
        </form>
    );
}

export default async function AddressesPage() {
    const session = await getSession();

    const [addresses] = await db.query(
        'SELECT id, country, city, street, building_number, is_default FROM user_addresses WHERE user_id = ? ORDER BY created_at DESC',
        [session.id]
    );

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">إدارة العناوين</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Add New Address Form */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold mb-4">إضافة عنوان جديد</h2>
                    <AddressForm />
                </div>

                {/* Existing Addresses */}
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold mb-4">عناويني المحفوظة</h2>
                    {addresses.length > 0 ? (
                        addresses.map((address) => (
                            <div key={address.id} className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-3">
                                        <MapPin className="text-purple-500 mt-1 flex-shrink-0" size={20} />
                                        <div>
                                            <p className="font-semibold text-gray-800">
                                                {address.street}, {address.building_number}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {address.city}, {address.country}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 flex-shrink-0">
                                        <SetDefaultButton addressId={address.id} isDefault={address.is_default} />
                                        <DeleteButton addressId={address.id} />
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10 bg-gray-50 rounded-lg">
                            <p className="text-gray-500">لا يوجد عناوين محفوظة بعد.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}