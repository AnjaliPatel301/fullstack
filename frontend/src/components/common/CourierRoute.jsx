import { Navigate } from 'react-router-dom';
import { useCourierStore } from '../../store/courierStore';

export default function CourierRoute({ children }) {
  const { isCourierAuth } = useCourierStore();
  return isCourierAuth ? children : <Navigate to="/courier/login" replace />;
}
