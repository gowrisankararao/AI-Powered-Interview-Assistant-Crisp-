export default function Footer() {
  return (
    <footer className="mt-10 bg-white/10 backdrop-blur-md border-t border-white/20 shadow-xl">
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between">
        <h2 className="text-lg font-semibold text-white drop-shadow">
          Swipe Interview Assistant
        </h2>
        <p className="text-sm text-gray-200/80 mt-2 sm:mt-0">
          © {new Date().getFullYear()} All rights reserved.
        </p>
      </div>
    </footer>
  );
}
