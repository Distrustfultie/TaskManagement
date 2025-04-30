import { Toaster } from 'react-hot-toast';

export default function ToastNotifications() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: '#FFA896',
          color: '#38000A',
          border: '1px solid #9B1313'
        }
      }}
    />
  );
}