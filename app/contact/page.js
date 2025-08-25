"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, Phone, Mail, Clock, Send, Globe } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import ScrollAnimation from "@/components/scroll-animation"

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const whatsappMessage = `Hello! I have a message from your website:

*Name:* ${formData.name}
*Email:* ${formData.email}
*Phone:* ${formData.phone || "Not provided"}
*Subject:* ${formData.subject || "General Inquiry"}

*Message:*
${formData.message}

Please get back to me. Thank you!`

      const encodedMessage = encodeURIComponent(whatsappMessage)
      const whatsappNumber = "+2348038905589"
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`

      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      })

      toast({
        title: "Message Sent",
        description: "Redirecting you to WhatsApp to send your message.",
      })

      setTimeout(() => {
        window.open(whatsappUrl, "_blank")
      }, 1500)
    } catch (error) {
      console.error("Contact form error:", error)
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pt-16 min-h-screen bg-background">
      {/* Header */}
      {/* <section className="bg-card py-16 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollAnimation>
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">Contact Us</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Get in touch with our team. We're here to answer your questions and help you on your aesthetic journey.
            </p>
          </ScrollAnimation>
        </div>
      </section> */}

      {/* Header */}
      <section
        className="relative py-16 lg:h-[60vh] md:h-[50vh] h-[50vh] flex items-center justify-center text-center bg-cover bg-center bg-no-repeat overflow-hidden"
        style={{
          backgroundImage: `url('/images/contact2.jpg')`,
          backgroundPosition: "center center",
          backgroundSize: "cover",
        }}
      >
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollAnimation>
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">Contact Us</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Get in touch with our team. We're here to answer your questions and help you on your aesthetic journey.
            </p>
          </ScrollAnimation>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <ScrollAnimation>
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-2xl text-foreground">Send us a Message</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="text-foreground">
                        Full Name *
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="Enter your full name"
                        className="bg-card border-border"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-foreground">
                        Email Address *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="your@email.com"
                        className="bg-card border-border"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone" className="text-foreground">
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="+234 123 456 7890"
                        className="bg-card border-border"
                      />
                    </div>

                    <div>
                      <Label htmlFor="subject" className="text-foreground">
                        Subject
                      </Label>
                      <Input
                        id="subject"
                        type="text"
                        value={formData.subject}
                        onChange={(e) => handleInputChange("subject", e.target.value)}
                        placeholder="What's this about?"
                        className="bg-card border-border"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="message" className="text-foreground">
                      Message *
                    </Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleInputChange("message", e.target.value)}
                      placeholder="Tell us how we can help you..."
                      rows={6}
                      className="bg-card border-border"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-background border hover:bg-primary/90 text-primary-foreground"
                    disabled={loading}
                  >
                    <Send className="w-5 h-5 mr-2" />
                    {loading ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </ScrollAnimation>

          {/* Contact Information */}
          <div className="space-y-6">
            <ScrollAnimation delay={100}>
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-xl text-foreground">Get in Touch</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <MapPin className="w-6 h-6 text-primary mt-1" />
                    <div>
                      <h4 className="font-semibold text-foreground">Address</h4>
                      <p className="text-muted-foreground">
                        132 Ogbatuluenyi 
                        <br />
                        drive federal housing 
                        <br />
                        estate 33 Onitsha, Anambra
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <Phone className="w-6 h-6 text-primary mt-1" />
                    <div>
                      <h4 className="font-semibold text-foreground">Phone</h4>
                      <p className="text-muted-foreground">08038905589</p>
                      <p className="text-muted-foreground text-sm">WhatsApp available</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <Mail className="w-6 h-6 text-primary mt-1" />
                    <div>
                      <h4 className="font-semibold text-foreground">Email</h4>
                      <p className="text-muted-foreground">info@myskinaesthetics.com</p>
                      <p className="text-muted-foreground">support@myskinaesthetics.com</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <Clock className="w-6 h-6 text-primary mt-1" />
                    <div>
                      <h4 className="font-semibold text-foreground">Business Hours</h4>
                      <div className="text-muted-foreground space-y-1">
                        <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                        <p>Saturday: 10:00 AM - 4:00 PM</p>
                        <p>Sunday: Closed</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </ScrollAnimation>

            <ScrollAnimation delay={200}>
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-xl text-foreground">Follow Us</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Stay connected with us on social media for beauty tips, treatment updates, and special offers.
                  </p>
                  <div className="flex space-x-4">
                    <Button variant="outline" size="sm" className="bg-transparent text-primary">
                      Facebook
                    </Button>
                    <Button variant="outline" size="sm" className="bg-transparent text-primary">
                      Instagram
                    </Button>
                    <Button variant="outline" size="sm" className="bg-transparent text-primary">
                      Twitter
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </ScrollAnimation>

            <ScrollAnimation delay={300}>
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-xl text-foreground">Emergency Contact</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-2">For urgent concerns or reactions:</p>
                  <p className="font-semibold text-primary">+2348038905589</p>
                  <p className="text-muted-foreground text-sm">Available 24/7 for emergencies</p>
                </CardContent>
              </Card>
            </ScrollAnimation>
          </div>
        </div>

        {/* Other Businesses Section */}
        <div className="mt-16">
          <ScrollAnimation>
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Other Businesses</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Explore our other business ventures in beauty and wellness
              </p>
            </div>
          </ScrollAnimation>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* BTI - Beauty Therapy Institute */}
            <ScrollAnimation delay={100}>
              <Card className="bg-card border-border h-full">
                <CardHeader>
                  <CardTitle className="text-2xl text-foreground">Beauty Therapy Institute (BTI)</CardTitle>
                  <p className="text-muted-foreground">Professional Beauty Training & Education</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <Phone className="w-6 h-6 text-primary mt-1" />
                    <div>
                      <h4 className="font-semibold text-foreground">Phone</h4>
                      <p className="text-muted-foreground">09068398096</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <Mail className="w-6 h-6 text-primary mt-1" />
                    <div>
                      <h4 className="font-semibold text-foreground">Email</h4>
                      <p className="text-muted-foreground">Onitsha@beautytherapyinstitute.co.za</p>
                    </div>
                  </div>

                   <div className="flex items-start gap-4">
                      <Globe className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-foreground">Website</p>
                        <a
                          href="http://www.beautytherapyinstitute.co.za"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          www.beautytherapyinstitute.co.za
                        </a>
                      </div>
                    </div>

                  <div>
                    <h4 className="font-semibold text-foreground mb-3">Follow BTI</h4>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-card text-primary"
                        onClick={() => window.open("https://www.instagram.com/btionitsha?igsh=MTJvdDN3ZnR0Yjh2YQ==", "_blank")}
                      >
                        Instagram
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-transparent text-primary"
                        onClick={() => window.open("https://facebook.com/btionitsha", "_blank")}
                      >
                        Facebook
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-transparent text-primary"
                        onClick={() => window.open("https://www.tiktok.com/@bti_onitsha?_t=ZS-8yRAKsDrdnb&_r=1", "_blank")}
                      >
                        TikTok
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </ScrollAnimation>

            {/* Aesthetics Pharmacy */}
            <ScrollAnimation delay={200}>
              <Card className="bg-card border-border h-full">
                <CardHeader>
                  <CardTitle className="text-2xl text-foreground">Aesthetics Pharmacy</CardTitle>
                  <p className="text-muted-foreground">Premium Skincare & Beauty Products</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <Phone className="w-6 h-6 text-primary mt-1" />
                    <div>
                      <h4 className="font-semibold text-foreground">Phone</h4>
                      <p className="text-muted-foreground">08038905589</p>
                      <p className="text-muted-foreground">09161939064</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <Mail className="w-6 h-6 text-primary mt-1" />
                    <div>
                      <h4 className="font-semibold text-foreground">Email</h4>
                      <p className="text-muted-foreground">Info@aestheticspharmacy.ng</p>
                    </div>
                  </div>

                   <div className="flex items-start gap-4">
                      <Globe className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-foreground">Website</p>
                        <a
                          href="https://aestheticspharmacy.ng/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          aestheticspharmacy.ng
                        </a>
                      </div>
                    </div>

                  <div>
                    <h4 className="font-semibold text-foreground mb-3">Follow Aesthetics Pharmacy</h4>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-transparent text-primary"
                        onClick={() => window.open("https://www.instagram.com/aesthetics.pharmacy?igsh=dzR0N2FuZGI3azly", "_blank")}
                      >
                        Instagram
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-transparent text-primary"
                        onClick={() => window.open("https://www.facebook.com/share/1G4mKECnfX/?mibextid=wwXIfr", "_blank")}
                      >
                        Facebook
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-transparent text-primary"
                        onClick={() => window.open("https://www.tiktok.com/@aesthetics.pharmacy?_t=ZS-8yRA8BhuKXg&_r=1", "_blank")}
                      >
                        TikTok
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </ScrollAnimation>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContactPage
