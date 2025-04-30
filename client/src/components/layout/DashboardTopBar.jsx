import NotificationBell from '../notifications/NotificationBell';
import SearchBar from '../SearchBar';
import useAuth from '../../hooks/useAuth';

export default function DashboardTopBar() {
  const { user, loading } = useAuth();

  return (
    <header className="flex items-center justify-between p-4 bg-primary text-white">
      <div className="flex-1 max-w-xl">
        <SearchBar onSearch={(filters) => console.log(filters)} />
      </div>
      <div className="flex items-center gap-4">
        <NotificationBell />
        <div className="flex items-center gap-2">
          {!loading && user ? (
            <span className="text-white font-medium">
              {user.username || user.email}
            </span>
          ) : (
            <span className="text-gray-300">Loading...</span>
          )}
          <div className="w-8 h-8 rounded-full bg-secondary"></div>
        </div>
      </div>
    </header>
  );
}
