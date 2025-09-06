"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, User, Phone, Mail, MessageSquare } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import ScrollAnimation from "@/components/scroll-animation"

const BookingPage = () => {
  const [treatments, setTreatments] = useState([])
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    treatmentType: "",
    preferredDate: "",
    preferredTime: "",
    notes: "",
  })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchTreatments()
  }, [])

  const fetchTreatments = async () => {
    const { data, error } = await supabase.from("treatments").select("*").eq("is_active", true).order("name")

    if (!error && data) {
      setTreatments(data)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.treatmentType ||
      !formData.preferredDate ||
      !formData.preferredTime
    ) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      // Map form data to database column names
      const bookingData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        treatment_type: formData.treatmentType, // Map to treatment_type
        preferred_date: formData.preferredDate, // Map to preferred_date
        preferred_time: formData.preferredTime, // Map to preferred_time
        notes: formData.notes,
      }

      // Save booking to database
      const { error } = await supabase.from("bookings").insert([bookingData])

      if (error) throw error

      // Create WhatsApp message
      const selectedTreatment = treatments.find((t) => t.id === formData.treatmentType)
      const whatsappMessage = `Hello! I would like to book an appointment:

Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone}
Treatment: ${selectedTreatment?.name || formData.treatmentType}
Preferred Date: ${formData.preferredDate}
Preferred Time: ${formData.preferredTime}${
        formData.notes
          ? `
Notes: ${formData.notes}`
          : ""
      }

Please confirm my appointment. Thank you!`

      const whatsappNumber = "2348038905589"
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        treatmentType: "",
        preferredDate: "",
        preferredTime: "",
        notes: "",
      })

      toast({
        title: "Booking Submitted",
        description: "Redirecting you to WhatsApp to confirm your appointment.",
      })

      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)

      if (isIOS || isSafari) {
        // For iOS devices, use window.location.href instead of window.open
        window.location.href = whatsappUrl
      } else {
        // For Android and other devices, use window.open
        window.open(whatsappUrl, "_blank")
      }
    } catch (error) {
      console.error("Booking error:", error)
      toast({
        title: "Booking Error",
        description: "Failed to submit booking. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pt-16 min-h-screen bg-background">
      {/* Header */}
      <section className="bg-card py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollAnimation>
            <h1 className="text-4xl lg:text-5xl font-bold text-primary mb-4">Book Your Appointment</h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Schedule your consultation with our expert aestheticians and take the first step towards healthier skin
            </p>
          </ScrollAnimation>
        </div>
      </section>

      <div className="max-w-[59rem] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 md:gap-28 gap-14">
          {/* Booking Form */}

          <ScrollAnimation>
            <Card className="lg:w-[120%] w-[100%]">
              <CardHeader>
                <CardTitle className="text-2xl text-primary">Appointment Details</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-card">
                      <Label htmlFor="name" className="flex items-center gap-2 text-primary pb-2">
                        <User className="w-4 h-4" />
                        Full Name *
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        className="bg-card"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="Enter your full name"
                        required
                      />
                    </div>

                    <div className="bg-card">
                      <Label htmlFor="email" className="flex items-center gap-2 text-primary pb-2">
                        <Mail className="w-4 h-4" />
                        Email Address *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        className="bg-card focus:none"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phone" className="flex items-center gap-2 text-primary pb-2">
                      <Phone className="w-4 h-4" />
                      Phone Number *
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      className="bg-card"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="+234 123 456 7890"
                      required
                    />
                  </div>

                  <div className="bg-card">
                    <Label htmlFor="treatment" className="flex items-center gap-2 text-primary pb-2">
                      <MessageSquare className="w-4 h-4" />
                      Treatment Type *
                    </Label>
                    <Select
                      className="bg-card"
                      value={formData.treatmentType}
                      onValueChange={(value) => handleInputChange("treatmentType", value)}
                    >
                      <SelectTrigger className="bg-card text-primary">
                        <SelectValue placeholder="Select a treatment" />
                      </SelectTrigger>
                      <SelectContent className="bg-background">
                        {treatments.map((treatment) => (
                          <SelectItem key={treatment.id} value={treatment.id}>
                            {treatment.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="date" className="flex items-center gap-2 text-primary pb-2">
                        <Calendar className="w-4 h-4" />
                        Preferred Date *
                      </Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.preferredDate}
                        className="bg-card text-primary"
                        onChange={(e) => handleInputChange("preferredDate", e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="time" className="flex items-center gap-2 text-primary pb-2">
                        <Clock className="w-4 h-4" />
                        Preferred Time *
                      </Label>
                      <Select
                        value={formData.preferredTime}
                        onValueChange={(value) => handleInputChange("preferredTime", value)}
                      >
                        <SelectTrigger className="bg-card text-primary">
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent className="bg-background">
                          <SelectItem value="09:00">9:00 AM</SelectItem>
                          <SelectItem value="10:00">10:00 AM</SelectItem>
                          <SelectItem value="11:00">11:00 AM</SelectItem>
                          <SelectItem value="12:00">12:00 PM</SelectItem>
                          <SelectItem value="13:00">1:00 PM</SelectItem>
                          <SelectItem value="14:00">2:00 PM</SelectItem>
                          <SelectItem value="15:00">3:00 PM</SelectItem>
                          <SelectItem value="16:00">4:00 PM</SelectItem>
                          <SelectItem value="17:00">5:00 PM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="notes">Additional Notes / Concerns</Label>
                    <Textarea
                      id="notes"
                      className="bg-card pt-2"
                      value={formData.notes}
                      onChange={(e) => handleInputChange("notes", e.target.value)}
                      placeholder="Any specific concerns or questions about your skin..."
                      rows={4}
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full text-background bg-white hover:bg-primary/90 hover:text-white border"
                    disabled={loading}
                  >
                    {loading ? "Submitting..." : "Book Appointment via WhatsApp"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </ScrollAnimation>

          {/* Information Panel */}
          <ScrollAnimation>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-primary">What to Expect</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-rose-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-rose-600 text-sm font-semibold">1</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary">Consultation</h4>
                      <p className="text-primary/70 text-sm">
                        We'll assess your skin and discuss your concerns and goals.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-rose-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-rose-600 text-sm font-semibold">2</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary">Treatment Plan</h4>
                      <p className="text-primary/70 text-sm">
                        We'll create a personalized treatment plan just for you.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-rose-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-rose-600 text-sm font-semibold">3</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary">Professional Treatment</h4>
                      <p className="text-primary/70 text-sm">
                        Enjoy your relaxing treatment with our expert aestheticians.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-primary">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-primary" />
                    <span className="text-primary/70">+2348038905589</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-primary" />
                    <span className="text-primary/70">myskinaestheticsclinic@gmail.com</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <MessageSquare className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-primary-foreground">WhatsApp: +2348038905589</p>
                      <p className="text-primary text-sm">Available 9 AM - 6 PM, Mon-Sat</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-primary">Booking Policy</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-primary/95">
                  <p>• Please arrive 15 minutes before your appointment</p>
                  <p>• 24-hour cancellation notice required</p>
                  <p>• Consultation fee may apply for first-time clients</p>
                  <p>• We'll confirm your appointment via WhatsApp</p>
                </CardContent>
              </Card>
            </div>
          </ScrollAnimation>
        </div>
      </div>
    </div>
  )
}

export default BookingPage
