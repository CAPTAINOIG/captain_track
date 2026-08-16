import { Link } from "react-router-dom";
import {
  FaTwitter,
  FaInstagram,
  FaFacebookF,
  FaYoutube,
  FaLinkedinIn,
} from "react-icons/fa";

export const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="relative z-10 border-t border-white/[0.06] bg-[#0A0E1A]/60 backdrop-blur-md">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 bg-gradient-to-br from-[#FF6B00] to-[#E040FB] rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-orange-500/20">
                CT
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                Captain Track
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-5 max-w-sm">
              Track every run, push every limit, achieve every goal — GPS tracking,
              rich analytics, and a community of runners moving forward together.
            </p>
            <div className="flex items-center gap-3">
              {[
                { Icon: FaTwitter, label: "Twitter", href: "#" },
                { Icon: FaInstagram, label: "Instagram", href: "#" },
                { Icon: FaFacebookF, label: "Facebook", href: "#" },
                { Icon: FaYoutube, label: "YouTube", href: "#" },
                { Icon: FaLinkedinIn, label: "LinkedIn", href: "#" },
              ].map(({ Icon, label, href }, i) => (
                <a
                  key={i}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/10 text-slate-400 hover:text-white hover:bg-[#FF6B00]/15 hover:border-[#FF6B00]/40 transition-all duration-200 flex items-center justify-center"
                >
                  <Icon className="text-sm" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Product
            </h4>
            <ul className="space-y-3 text-sm">
              {[
                { label: "Features", to: "/#features" },
                { label: "Challenges", to: "/#challenges" },
                { label: "Segments", to: "/#segments" },
                { label: "Routes", to: "/#routes" },
                { label: "Mobile app", to: "/#app" },
              ].map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.to}
                    className="text-slate-400 hover:text-white transition-colors duration-200"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Company
            </h4>
            <ul className="space-y-3 text-sm">
              {[
                { label: "About", to: "/#about" },
                { label: "Careers", to: "/#careers" },
                { label: "Blog", to: "/#blog" },
                { label: "Press", to: "/#press" },
                { label: "Contact", to: "/#contact" },
              ].map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.to}
                    className="text-slate-400 hover:text-white transition-colors duration-200"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Support
            </h4>
            <ul className="space-y-3 text-sm">
              {[
                { label: "Help Center", to: "/#help" },
                { label: "Safety", to: "/#safety" },
                { label: "Privacy", to: "/#privacy" },
                { label: "Terms", to: "/#terms" },
                { label: "Accessibility", to: "/#a11y" },
              ].map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.to}
                    className="text-slate-400 hover:text-white transition-colors duration-200"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/[0.06] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">
            © {year} Captain Track. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <Link
              to="/#privacy"
              className="hover:text-white transition-colors duration-200"
            >
              Privacy Policy
            </Link>
            <Link
              to="/#terms"
              className="hover:text-white transition-colors duration-200"
            >
              Terms of Service
            </Link>
            <Link
              to="/#cookies"
              className="hover:text-white transition-colors duration-200"
            >
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
