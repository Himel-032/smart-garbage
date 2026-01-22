export default function Footer() {
  return (
    <footer className="bg-white border-t border-emerald-100 py-4 px-6 mt-auto">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-emerald-700">
          © {new Date().getFullYear()}{" "}
          <span className="font-semibold">Smart Garbage Management System</span>
          . All rights reserved.
        </p>

        <div className="flex items-center gap-4 text-sm text-emerald-600">
          <a href="#" className="hover:text-emerald-800 transition">
            Privacy Policy
          </a>
          <span className="text-emerald-300">|</span>
          <a href="#" className="hover:text-emerald-800 transition">
            Terms of Service
          </a>
          <span className="text-emerald-300">|</span>
          <a href="#" className="hover:text-emerald-800 transition">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}
