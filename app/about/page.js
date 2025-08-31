"use client"

import Link from "next/link"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, MapPin, Clock, Send, Loader2, Star, Award, Users, Heart, CheckCircle, Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import ScrollAnimation from "@/components/scroll-animation"

const AboutPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    position: "",
    position_type: "",
    location: "",
    cover_letter: "",
    cv_url: "",
    cv: null,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [jobListings, setJobListings] = useState([])
  const [loadingListings, setLoadingListings] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchJobListings()
  }, [])

  const fetchJobListings = async () => {
    try {
      const response = await fetch("/api/job-listings")
      if (!response.ok) {
        throw new Error("Failed to fetch job listings")
      }
      const data = await response.json()
      setJobListings(data.jobListings || [])
    } catch (error) {
      console.error("Error fetching job listings:", error)
      toast({
        title: "Error",
        description: "Failed to load job openings.",
        variant: "destructive",
      })
    } finally {
      setLoadingListings(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCvUpload = (url) => {
    setFormData((prev) => ({ ...prev, cv_url: url }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file && file.type === "application/pdf") {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        alert("File size must be less than 5MB")
        return
      }
      setFormData((prev) => ({
        ...prev,
        cv: file,
      }))
    } else {
      alert("Please upload a PDF file only")
    }
  }
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Basic validation
    if (
      !formData.full_name ||
      !formData.email ||
      !formData.phone ||
      !formData.position ||
      !formData.cover_letter ||
      !formData.cv
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields, including CV upload.",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    const dataToSend = new FormData()
    dataToSend.append("full_name", formData.full_name)
    dataToSend.append("email", formData.email)
    dataToSend.append("phone", formData.phone)
    dataToSend.append("position", formData.position)
    dataToSend.append("position_type", formData.position_type)
    dataToSend.append("location", formData.location)
    dataToSend.append("cover_letter", formData.cover_letter)
    if (formData.cv) {
      dataToSend.append("cv", formData.cv) // Append the actual File object
    }

    try {
      const response = await fetch("/api/job-applications", {
        method: "POST",
        // No Content-Type header needed here, browser sets it automatically for FormData
        body: dataToSend, // Send the FormData object directly
      })

      if (response.ok) {
        toast({
          title: "Application Submitted",
          description: "Your job application has been successfully submitted!",
        })
        setIsModalOpen(false)
        setFormData({
          full_name: "",
          email: "",
          phone: "",
          position: "",
          position_type: "",
          location: "",
          cover_letter: "",
          cv_url: "",
          cv: null, // Reset the file as well
        })
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to submit application")
      }
    } catch (error) {
      console.error("Error submitting application:", error)
      toast({
        title: "Submission Failed",
        description: `There was an error submitting your application: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="pt-16 min-h-screen bg-background">
      {/* Hero Section */}
      <section
        className="relative md:h-[50vh] h-[60vh] flex items-center justify-center text-center bg-cover bg-center"
        style={{ height:'500px', backgroundImage: 'url("/images/aesthetics5.jpg")' }}
      >
        <div className="absolute inset-0 bg-black/60 opacity-50" />
        <div className="relative z-10 text-white p-4">
          <ScrollAnimation>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">About MySkin Aesthetic Clinics</h1>
            <p className="text-lg md:text-xl max-w-2xl mx-auto">
              Your trusted partner in aesthetic excellence and skin health.
            </p>
          </ScrollAnimation>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <ScrollAnimation>
            <div className="relative h-64 md:h-96 rounded-lg overflow-hidden shadow-lg">
              <Image
                src="/images/skinabout.jpg"
                alt="Doctor consulting patient"
                fill
                className="object-cover"
              />
            </div>
          </ScrollAnimation>
          <ScrollAnimation delay={200}>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Our Story & Mission</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                MySkin Aesthetic Clinics was founded with a singular vision: to provide unparalleled aesthetic and
                dermatological care that empowers individuals to look and feel their best. We believe in a holistic
                approach to beauty, combining cutting-edge technology with personalized treatment plans.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Our mission is to deliver safe, effective, and innovative solutions for all skin concerns, ensuring
                every client achieves their desired results in a comfortable and professional environment. We are
                committed to continuous learning and adopting the latest advancements in aesthetic medicine.
              </p>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section
        className="relative py-12 md:py-24 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: 'url("/images/aesthetics5.jpg")' }}
      >
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/70" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollAnimation>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-12">Why Choose MySkin?</h2>
          </ScrollAnimation>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ScrollAnimation delay={100}>
              <Card className="bg-background backdrop-blur-sm h-full p-6 shadow-lg rounded-lg text-center border border-white/20  transition-all duration-300">
                <Briefcase className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-3">Expert Team</h3>
                <p className="text-muted-foreground">
                  Our board-certified dermatologists and experienced aestheticians are leaders in their field.
                </p>
              </Card>
            </ScrollAnimation>
            <ScrollAnimation delay={200}>
              <Card className="bg-background backdrop-blur-sm h-full p-6 shadow-lg rounded-lg text-center border border-white/20  transition-all duration-300">
                <MapPin className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-3">Advanced Technology</h3>
                <p className="text-muted-foreground">
                  We utilize state-of-the-art equipment and techniques for optimal results.
                </p>
              </Card>
            </ScrollAnimation>
            <ScrollAnimation delay={300}>
              <Card className="bg-background backdrop-blur-sm h-full p-6 shadow-lg rounded-lg text-center border border-white/20  transition-all duration-300">
                <Clock className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-3">Personalized Care</h3>
                <p className="text-muted-foreground">
                  Every treatment plan is tailored to your unique needs and goals.
                </p>
              </Card>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollAnimation>
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Meet Our Expert Team</h2>
              <p className="text-xl text-muted-foreground">
                Our certified professionals are dedicated to helping you achieve your aesthetic goals
              </p>
            </div>
          </ScrollAnimation>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Mrs Chisom Geraldine",
                role: "DIrector",
                image: "/images/director2.jpg",
                bio: "Geraldine is a Pharmacist with over 9 years of experience and an MSc in Clinical Pharmacy. She is a certified Advanced Aesthetics Specialist and Licensed Medical Aesthetics Practitioner with expertise in facials, body treatments, injectables, and laser therapies. Passionate and detail-oriented, she believes everyone deserves confidence in their own skin.",
              },
              {
                name: "Maria Rodriguez",
                role: "Senior Aesthetic Specialist",
                image: "/images/director.jpg",
                bio: "Maria specializes in advanced facial treatments and has helped thousands of clients achieve radiant, healthy skin through personalized care.",
              },
              {
                name: "Jennifer Chen",
                role: "Aesthetic Therapist",
                image: "/images/director.jpg",
                bio: "Jennifer brings expertise in the latest aesthetic technologies and is passionate about helping clients feel confident in their own skin.",
              },
            ].map((member, index) => (
              <ScrollAnimation key={index} delay={index * 100}>
                <Card className="overflow-hidden h-full hover:shadow-lg transition-all duration-300 bg-card border-border">
                  <div className="relative h-[350px] md:h-96">
                    <Image src={member.image || "/placeholder.svg"}  alt={member.name} fill className="object-cover" />
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-foreground mb-1">{member.name}</h3>
                    <p className="text-primary font-medium mb-3">{member.role}</p>
                    <p className="text-muted-foreground text-sm">{member.bio}</p>
                  </CardContent>
                </Card>
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </section>

      {/* Current Opportunities Section */}
      <section className="py-16 md:py-24 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollAnimation>
            <div className="text-center mb-16">
              <Briefcase className="w-16 h-16 text-primary mx-auto mb-6" />
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Join Our Team</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Be part of a dynamic team that's transforming lives through innovative aesthetic treatments
              </p>
            </div>
          </ScrollAnimation>

          {/* Why Join Us */}
          <div className="mb-16">
            <ScrollAnimation delay={100}>
              <h3 className="text-2xl font-bold text-foreground text-center mb-12">Why Work With MySkin?</h3>
            </ScrollAnimation>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: <Star className="w-8 h-8 text-primary" />,
                  title: "Professional Growth",
                  description: "Continuous training and development opportunities in the latest aesthetic technologies",
                },
                {
                  icon: <Users className="w-8 h-8 text-primary" />,
                  title: "Supportive Environment",
                  description: "Work alongside experienced professionals in a collaborative and encouraging atmosphere",
                },
                {
                  icon: <Award className="w-8 h-8 text-primary" />,
                  title: "Competitive Benefits",
                  description: "Attractive compensation packages, health benefits, and performance incentives",
                },
                {
                  icon: <Heart className="w-8 h-8 text-primary" />,
                  title: "Make a Difference",
                  description:
                    "Help clients boost their confidence and transform their lives through aesthetic treatments",
                },
                {
                  icon: <CheckCircle className="w-8 h-8 text-primary" />,
                  title: "Work-Life Balance",
                  description: "Flexible scheduling and a healthy work environment that values your well-being",
                },
                {
                  icon: <Briefcase className="w-8 h-8 text-primary" />,
                  title: "Career Advancement",
                  description: "Clear pathways for promotion and leadership opportunities within our growing company",
                },
              ].map((benefit, index) => (
                <ScrollAnimation key={index} delay={index * 100}>
                  <Card className="p-6 bg-background border-border h-full hover:shadow-lg transition-all duration-300">
                    <CardContent className="text-center space-y-4">
                      <div className="flex justify-center">{benefit.icon}</div>
                      <h4 className="text-lg font-semibold text-foreground">{benefit.title}</h4>
                      <p className="text-muted-foreground text-sm">{benefit.description}</p>
                    </CardContent>
                  </Card>
                </ScrollAnimation>
              ))}
            </div>
          </div>

          <ScrollAnimation>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8 text-center">Current Opportunities</h2>
          </ScrollAnimation>
          {loadingListings ? (
            <div className="text-center text-muted-foreground">Loading job openings...</div>
          ) : jobListings.length === 0 ? (
            <div className="text-center text-muted-foreground">
              No job openings available at this time. Please check back later!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {jobListings.map((position, index) => (
                <ScrollAnimation key={position.id} delay={index * 100}>
                  <Card className="bg-background p-6 shadow-lg rounded-lg border border-border flex flex-col h-full">
                    <CardHeader className="p-0 mb-4">
                      <CardTitle className="text-2xl font-bold text-foreground">{position.title}</CardTitle>
                      <p className="text-sm text-muted-foreground pt-1">
                        <span className="bg-primary/10 px-3 py-1 rounded"> {position.type}</span>

                        <span className="pl-2"> {position.location} </span>
                      </p>
                    </CardHeader>
                    <CardContent className="p-0 flex-grow">
                      <h3 className="text-lg font-semibold text-foreground mb-2">Requirements:</h3>
                      <ul className="list-none  text-muted-foreground text-sm mb-4 space-y-1">
                        {position.requirements && position.requirements.length > 0 ? (
                          position.requirements.map((req, i) => (
                            <li key={i}>
                              <div className="flex gap-2">
                                <CheckCircle className="w-4 h-4" /> {req}
                              </div>
                            </li>
                          ))
                        ) : (
                          <li>No specific requirements listed.</li>
                        )}
                      </ul>
                    </CardContent>
                    <Dialog
                      open={isModalOpen && formData.position === position.title}
                      onOpenChange={(open) => {
                        setIsModalOpen(open)
                        if (!open) {
                          setFormData({
                            full_name: "",
                            email: "",
                            phone: "",
                            position: "",
                            position_type: "",
                            location: "",
                            cover_letter: "",
                            cv_url: "",
                            cv: null,
                          })
                        }
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          className="w-full border bg-card hover:bg-primary/90 text-primary-foreground mt-auto"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              position: position.title,
                              position_type: position.type,
                              location: position.location,
                            }))
                          }
                        >
                          Apply Now
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-card text-foreground border-border">
                        <DialogHeader>
                          <DialogTitle className="text-2xl font-bold">Apply for {formData.position}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="grid gap-6 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                              <Label htmlFor="full_name">Full Name *</Label>
                              <Input
                                id="full_name"
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleInputChange}
                                required
                                className="bg-background text-foreground border-border"
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="email">Email *</Label>
                              <Input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                                className="bg-background text-foreground border-border"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                              <Label htmlFor="phone">Phone Number *</Label>
                              <Input
                                id="phone"
                                name="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={handleInputChange}
                                required
                                className="bg-background text-foreground border-border"
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="position">Position Applying For *</Label>
                              <Select
                                name="position"
                                value={formData.position}
                                onValueChange={(value) => handleSelectChange("position", value)}
                                required
                              >
                                <SelectTrigger className="w-full bg-background text-foreground border-border">
                                  <SelectValue placeholder="Select a position" />
                                </SelectTrigger>
                                <SelectContent className="bg-card text-foreground border-border">
                                  {jobListings
                                    .filter((listing) => listing.is_active)
                                    .map((listing) => (
                                      <SelectItem key={listing.id} value={listing.title}>
                                        {listing.title}
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="cover_letter">Cover Letter *</Label>
                            <Textarea
                              id="cover_letter"
                              name="cover_letter"
                              value={formData.cover_letter}
                              onChange={handleInputChange}
                              required
                              rows={5}
                              className="bg-background text-foreground border-border"
                            />
                          </div>

                          <div>
                            <Label htmlFor="cv" className="text-sm font-medium text-foreground">
                              Upload CV/Resume * (PDF only)
                            </Label>
                            <div className="mt-1">
                              <div className="flex items-center justify-center w-full">
                                <label
                                  htmlFor="cv"
                                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-border border-dashed rounded-lg cursor-pointer bg-card hover:bg-accent/50 transition-colors"
                                >
                                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                                    <p className="mb-2 text-sm text-muted-foreground">
                                      <span className="font-semibold">Click to upload</span> your CV
                                    </p>
                                    <p className="text-xs text-muted-foreground">PDF files only (MAX. 5MB)</p>
                                    {formData.cv && (
                                      <p className="text-xs text-primary mt-2 font-medium">
                                        Selected: {formData.cv.name}
                                      </p>
                                    )}
                                  </div>
                                  <input
                                    id="cv"
                                    name="cv"
                                    type="file"
                                    className="hidden"
                                    accept=".pdf"
                                    onChange={handleFileChange}
                                    required
                                  />
                                </label>
                              </div>
                            </div>
                          </div>
                          <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-background border hover:bg-primary/90 text-primary-foreground"
                          >
                            {isSubmitting ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                              </>
                            ) : (
                              <>
                                <Send className="mr-2 h-4 w-4" /> Submit Application
                              </>
                            )}
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </Card>
                </ScrollAnimation>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 md:py-24 bg-primary text-primary-foreground text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollAnimation>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Skin?</h2>
            <p className="text-lg md:text-xl mb-8 opacity-90">
              Book a consultation with our experts today and embark on your journey to radiant, healthy skin.
            </p>
            <Button className="border bg-card" variant="secondary" size="lg" asChild>
              <Link href="/booking">Schedule Consultation</Link>
            </Button>
          </ScrollAnimation>
        </div>
      </section>
    </div>
  )
}

export default AboutPage
