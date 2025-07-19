import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

function HomeLayout() {
  return (
    <>
      <Navbar />
      <div style={{ padding: '20px' }}>
        <Outlet />
      </div>
    </>
  );
}

export default HomeLayout;