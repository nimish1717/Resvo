import Navbar from '../components/Navbar';
import ClientOnly from '../components/ClientOnly';

export default function PublicLayout({ children }) {
  return (
    <ClientOnly>
      <Navbar />
      {children}
    </ClientOnly>
  );
}
