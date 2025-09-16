"use client"

import Link from "next/link"
import Image from "next/image"
import { Facebook, Instagram, Mail, Phone, MapPin } from "lucide-react"
import ScrollAnimation from "@/components/scroll-animation"

const TikTokIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
    {...props}
  >
    <path d="M9 3v12.6a3.4 3.4 0 1 1-3.4-3.4" />
    <path d="M15 3a6 6 0 0 0 6 6" />
    <path d="M15 3v13a6 6 0 1 1-6-6" />
  </svg>
)

const Footer = () => {
  const treatmentCategories = [
    {
      id: "aesthetic-dermatology",
      name: "Aesthetic Dermatology",
    },
    {
      id: "laser-treatments",
      name: "Laser Treatments",
    },
    {
      id: "body-contouring",
      name: "Body Contouring",
    },
    {
      id: "hair-restoration",
      name: "Hair Restoration",
    },
    {
      id: "injectable-treatments",
      name: "Injectable Treatments",
    },
    {
      id: "wellness-therapy",
      name: "Wellness & Therapy",
    },
    {
      id: "specialized-procedures",
      name: "Specialized Procedures",
    },
    {
      id: "teeth-whitening",
      name: "Teeth Whitening",
    },
  ]

  return (
    <footer className="bg-background border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <ScrollAnimation>
            <div className="space-y-4">
              <Link href="/" className="flex items-center space-x-3">
                <div className="relative w-10 h-10">
                  <Image src="/images/logo2.jpg" alt="MySkin Aesthetic Clinics" fill className="object-contain" />
                </div>
                <div className="flex flex-col pt-2">
                  <span className="text-xs text-muted-foreground">AESTHETIC CLINICS</span>
                  <span className="text-[9px] text-gray-600">Restoring Confidence</span>
                </div>
              </Link>
              <p className="text-muted-foreground text-sm">
                Your trusted partner for professional aesthetic treatments and premium skincare products.
              </p>
              <div className="flex space-x-4">
                <Facebook
                  className="w-5 h-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors"
                  onClick={() => window.open("https://www.facebook.com/share/1AmteFdAcn/?mibextid=wwXIfr", "_blank")}
                />
                <Instagram
                  className="w-5 h-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors"
                  onClick={() => window.open("https://www.instagram.com/restoresknn_?igsh=Mmg1aHc2YWVyeWxt", "_blank")}
                />

                <TikTokIcon
                  className="w-5 h-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors"
                  onClick={() => window.open("https://www.tiktok.com/@myskin.clinics?_t=ZS-8yRAFMC2hqU&_r=1", "_blank")}
                />
              </div>
            </div>
          </ScrollAnimation>

          {/* Quick Links */}
          <ScrollAnimation delay={100}>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/treatments" className="text-muted-foreground hover:text-primary transition-colors">
                    Treatments
                  </Link>
                </li>
                <li>
                  <Link href="/products" className="text-muted-foreground hover:text-primary transition-colors">
                    Products
                  </Link>
                </li>
                <li>
                  <Link href="/booking" className="text-muted-foreground hover:text-primary transition-colors">
                    Book Appointment
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="text-muted-foreground hover:text-primary transition-colors">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>
          </ScrollAnimation>

          {/* Services - Updated to show all treatment categories */}
          <ScrollAnimation delay={200}>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Treatment Categories</h3>
              <ul className="space-y-2">
                {treatmentCategories.map((category) => (
                  <li key={category.id}>
                    <Link
                      href={`/treatments?category=${category.id}`}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </ScrollAnimation>

          {/* Contact Info */}
          <ScrollAnimation delay={300}>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Contact Info</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-primary" />
                  <span className="text-muted-foreground">+2348038905589</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-primary" />
                  <span className="text-muted-foreground">info@myskinaestheticsclinic.com</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-primary" />
                  <span className="text-muted-foreground">32 Ogbatuluenyi drive federal housing estate 33 Onitsha</span>
                </div>
              </div>
            </div>
          </ScrollAnimation>
        </div>

        <ScrollAnimation delay={400}>
          <div className="border-t border-border mt-8 pt-8 text-center">
            <p className="text-muted-foreground text-sm">
              © 2025 MySkinAesthetic Clinics. All rights reserved. | Privacy Policy | Terms of Service
            </p>
          </div>
        </ScrollAnimation>
      </div>
    </footer>
  )
}

export default Footer
