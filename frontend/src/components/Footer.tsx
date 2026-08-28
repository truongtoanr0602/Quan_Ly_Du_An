import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-surface-dim border-t border-outline-variant w-full mt-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-4 sm:px-6 lg:px-8 py-16 w-full max-w-7xl mx-auto">
        <div className="col-span-1">
          <div className="text-xl font-bold text-primary mb-4">ElectroTech</div>
          <p className="text-base text-secondary">
            © 2024 ElectroTech Inc. Precision Engineering for Tech Enthusiasts.
          </p>
        </div>
        <div className="col-span-1 md:col-span-3 flex flex-wrap gap-x-12 gap-y-4 md:justify-end">
          <Link to="#" className="text-base text-secondary hover:text-primary underline transition-all">About Us</Link>
          <Link to="#" className="text-base text-secondary hover:text-primary underline transition-all">Privacy Policy</Link>
          <Link to="#" className="text-base text-secondary hover:text-primary underline transition-all">Terms of Service</Link>
          <Link to="#" className="text-base text-secondary hover:text-primary underline transition-all">Shipping Info</Link>
          <Link to="#" className="text-base text-secondary hover:text-primary underline transition-all">Contact Support</Link>
        </div>
      </div>
    </footer>
  );
}
