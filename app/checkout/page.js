import CheckoutClient from "@/components/CheckoutClient";
import { getAddresses } from "@/app/dashboard/addresses/actions";

 export default async function CheckoutPage() {
   const addresses = await getAddresses();
   return (
     <div className="container mx-auto px-4 py-12">
      <CheckoutClient addresses={addresses} />
     </div>
   );
 }