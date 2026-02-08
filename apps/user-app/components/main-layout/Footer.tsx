"use client";

const Footer = () => {
  return (
    <footer className="border-t py-12 text-sm text-muted-foreground flex items-center justify-center">
      <p>
        © {new Date().getFullYear()} <span className="font-semibold text-gray-600">PixelPay</span>. All rights reserved.
      </p>
    </footer>
  )
}

export default Footer;