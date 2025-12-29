import AddressForm from '@/components/AddressForm';
import AddressList from '@/components/AddressList'; // Assuming AddressList.js exists as suggested
import { getAddresses } from './actions';

export const dynamic = 'force-dynamic';

export default async function AddressesPage() {
    // Fetch addresses on the server using the action
    const addresses = await getAddresses();

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">إضافة عنوان جديد</h2>
                <div className="p-6 bg-white rounded-lg shadow">
                    <AddressForm />
                </div>
            </div>

            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">عناويني المحفوظة</h2>
                <div className="p-6 bg-white rounded-lg shadow">
                    <AddressList addresses={addresses} />
                </div>
            </div>
        </div>
    );
}