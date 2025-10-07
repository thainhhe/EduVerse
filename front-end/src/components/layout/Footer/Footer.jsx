import { Link } from "react-router-dom";
import { FaTwitter, FaFacebook, FaLinkedin, FaYoutube } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-5 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-4">Eduvers</h3>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/features"
                  className="hover:underline opacity-90 hover:opacity-100"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  to="/pricing"
                  className="hover:underline opacity-90 hover:opacity-100"
                >
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/blog"
                  className="hover:underline opacity-90 hover:opacity-100"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  to="/guides"
                  className="hover:underline opacity-90 hover:opacity-100"
                >
                  User guides
                </Link>
              </li>
              <li>
                <Link
                  to="/webinars"
                  className="hover:underline opacity-90 hover:opacity-100"
                >
                  Webinars
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/about"
                  className="hover:underline opacity-90 hover:opacity-100"
                >
                  About us
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="hover:underline opacity-90 hover:opacity-100"
                >
                  Join us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Subscribe to our newsletter</h4>
            <p className="text-sm opacity-90 mb-4">
              For product announcements and exclusive insights
            </p>
            <form className="flex gap-2">
              <Input
                type="email"
                placeholder="Input your email"
                className="bg-white/20 border-white/30 text-white placeholder:text-white/60"
              />
              <Button type="submit" variant="secondary">
                Subscribe
              </Button>
            </form>
          </div>
        </div>
      </div>

      <div className="border-t border-white/20">
        <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm opacity-90">
            &copy; 2022 Brand, Inc. · Privacy · Terms · Sitemap
          </p>
          <div className="flex gap-4">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80"
            >
              <FaTwitter className="text-xl" />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80"
            >
              <FaFacebook className="text-xl" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80"
            >
              <FaLinkedin className="text-xl" />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80"
            >
              <FaYoutube className="text-xl" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
