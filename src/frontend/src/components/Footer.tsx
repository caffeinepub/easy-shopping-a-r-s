export default function Footer() {
  const year = new Date().getFullYear();
  const utm = encodeURIComponent(window.location.hostname);

  return (
    <footer className="bg-foreground text-white mt-16">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img
                src="/assets/uploads/17736178367692251771168483360120-1.jpg"
                alt="Easy Shopping A.R.S"
                className="h-12 w-auto max-w-[130px] object-contain block rounded-md"
              />
            </div>
            <p className="text-sm text-white/60">
              Your trusted online shopping destination. Quality products, fast
              delivery.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-white">Categories</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li>Electronics</li>
              <li>Fashion</li>
              <li>Home &amp; Garden</li>
              <li>Sports</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-white">Help</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li>Customer Support</li>
              <li>Returns &amp; Refunds</li>
              <li>Order Tracking</li>
              <li>FAQs</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-white">Contact</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li>support@easyshopping.ars</li>
              <li>0800-EASY-ARS</li>
              <li>Mon-Sat: 9AM - 6PM</li>
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
