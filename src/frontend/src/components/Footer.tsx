export default function Footer() {
  const year = new Date().getFullYear();
  const utm = encodeURIComponent(window.location.hostname);

  return (
    <footer className="bg-foreground text-white mt-16">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img
                src="/assets/uploads/IMG_20260318_185950_387-1.webp"
                alt="Easy Shopping A.R.S"
                className="h-12 w-auto max-w-[130px] object-contain block rounded-md"
              />
            </div>
            <p className="text-sm text-white/60">
              Your trusted online shopping destination. Quality products, fast
              delivery.
            </p>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold mb-3 text-white">Categories</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li>Electronics</li>
              <li>Fashion</li>
              <li>Home &amp; Garden</li>
              <li>Sports</li>
            </ul>
            <p
              className="text-xs font-semibold mt-4"
              style={{ color: "#000000" }}
            >
              Create By: Aaditya Kumar Kushwaha (A.R.K)
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-3 text-white">Contact Us</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li>
                <a
                  href="mailto:easyshoppinga.r.s1@gmail.com"
                  className="hover:text-white transition-colors"
                >
                  📧 easyshoppinga.r.s1@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+9779812231441"
                  className="hover:text-white transition-colors"
                >
                  📞 Support: +977 981-2231441
                </a>
              </li>
              <li>
                <a
                  href="tel:+9779820210361"
                  className="hover:text-white transition-colors"
                >
                  🏢 HEAD Office (A.R.K): +977 982-0210361
                </a>
              </li>
              <li>
                <a
                  href="tel:+9779706800854"
                  className="hover:text-white transition-colors"
                >
                  🏢 Ass. Head: +977 970-6800854
                </a>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="font-semibold mb-3 text-white">Follow Us</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li>
                <a
                  href="https://www.facebook.com/easyshoppinga.r.s1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-2"
                >
                  <span>📘</span> Facebook: easyshoppinga.r.s1
                </a>
              </li>
              <li>
                <a
                  href="https://www.tiktok.com/@easyshoppinga.r.s1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-2"
                >
                  <span>🎵</span> TikTok: easyshoppinga.r.s1
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/easyshoppinga.r.s1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-2"
                >
                  <span>📸</span> Instagram: easyshoppinga.r.s1
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-6 text-center text-sm text-white/50">
          © {year} Easy Shopping A.R.S. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${utm}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </div>
      </div>
    </footer>
  );
}
