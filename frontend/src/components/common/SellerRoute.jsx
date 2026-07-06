import { Navigate } from 'react-router-dom';
import { useSellerStore } from '../../store/sellerStore';

export default function SellerRoute({ children }) {
  const { isSellerAuthenticated } = useSellerStore();
  if (!isSellerAuthenticated) return <Navigate to="/seller/login" replace />;
  return children;
}
