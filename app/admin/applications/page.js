"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Search,
  Briefcase,
  Mail,
  Phone,
  Calendar,
  Download,
  Plus,
  Eye,
  Loader2,
  Clock,
  Edit,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import AdminNavigation from "@/components/admin-navigation"

const AdminApplicationsPage = () => {
  const [applications, setApplications] = useState([])
  const [jobListings, setJobListings] = useState([])
  const [filteredApplications, setFilteredApplications] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [positionFilter, setPositionFilter] = useState("all")
  const [selectedApplication, setSelectedApplication] = useState(null)
  const [newJobOpening, setNewJobOpening] = useState({
    title: "",
    type: "",
    location: "",
    requirements: "",
    is_active: true,
  })
  const [editingJob, setEditingJob] = useState(null)
  const [isNewJobModalOpen, setIsNewJobModalOpen] = useState(false)
  const [isEditJobModalOpen, setIsEditJobModalOpen] = useState(false)
  const [isSubmittingNewJob, setIsSubmittingNewJob] = useState(false)
  const [isUpdatingJob, setIsUpdatingJob] = useState(false)
  const [isDeletingJob, setIsDeletingJob] = useState(false)
  const { toast } = useToast()

  const fetchApplications = useCallback(async () => {
    try {
      const response = await fetch("/api/job-applications")
      if (!response.ok) {
        throw new Error("Failed to fetch applications")
      }
      const data = await response.json()
      setApplications(data.applications || [])
      setFilteredApplications(data.applications || [])
    } catch (error) {
      console.error("Error fetching applications:", error)
      toast({
        title: "Error",
        description: "Failed to load job applications.",
        variant: "destructive",
      })
    }
  }, [toast])

  const fetchJobListings = useCallback(async () => {
    try {
      const response = await fetch("/api/job-listings?includeInactive=true")
      if (!response.ok) {
        throw new Error("Failed to fetch job listings")
      }
      const data = await response.json()
      setJobListings(data.jobListings || [])
    } catch (error) {
      console.error("Error fetching job listings:", error)
      toast({
        title: "Error",
        description: "Failed to load job listings.",
        variant: "destructive",
      })
    }
  }, [toast])

  useEffect(() => {
    fetchApplications()
    fetchJobListings()
  }, [fetchApplications, fetchJobListings])

  useEffect(() => {
    let tempApplications = applications

    if (searchTerm) {
      tempApplications = tempApplications.filter(
        (app) =>
          app.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.phone.includes(searchTerm),
      )
    }

    if (statusFilter !== "all") {
      tempApplications = tempApplications.filter((app) => app.status === statusFilter)
    }

    if (positionFilter !== "all") {
      tempApplications = tempApplications.filter((app) => app.position === positionFilter)
    }

    setFilteredApplications(tempApplications)
  }, [searchTerm, statusFilter, positionFilter, applications])

  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await fetch(`/api/job-applications/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error("Failed to update application status")
      }

      setApplications((prev) => prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app)))
      toast({
        title: "Status Updated",
        description: `Application status changed to ${newStatus}.`,
      })
    } catch (error) {
      console.error("Error updating status:", error)
      toast({
        title: "Error",
        description: "Failed to update application status.",
        variant: "destructive",
      })
    }
  }

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "pending":
        return "outline"
      case "reviewed":
        return "secondary"
      case "shortlisted":
        return "default"
      case "rejected":
        return "destructive"
      default:
        return "outline"
    }
  }

  const handleNewJobOpeningChange = (e) => {
    const { name, value, type, checked } = e.target
    setNewJobOpening((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleEditJobChange = (e) => {
    const { name, value, type, checked } = e.target
    setEditingJob((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleCreateNewJobOpening = async (e) => {
    e.preventDefault()
    setIsSubmittingNewJob(true)
    try {
      const payload = {
        ...newJobOpening,
        requirements: newJobOpening.requirements
          .split(",")
          .map((req) => req.trim())
          .filter(Boolean),
      }

      const response = await fetch("/api/job-listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create job opening")
      }

      toast({
        title: "Success",
        description: "New job opening created successfully!",
      })
      setNewJobOpening({
        title: "",
        type: "",
        location: "",
        requirements: "",
        is_active: true,
      })
      setIsNewJobModalOpen(false)
      fetchJobListings() // Refresh job listings
    } catch (error) {
      console.error("Error creating job opening:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to create job opening.",
        variant: "destructive",
      })
    } finally {
      setIsSubmittingNewJob(false)
    }
  }

  const handleEditJob = (job) => {
    setEditingJob({
      ...job,
      requirements: Array.isArray(job.requirements) ? job.requirements.join(", ") : job.requirements,
    })
    setIsEditJobModalOpen(true)
  }

  const handleUpdateJobOpening = async (e) => {
    e.preventDefault()
    setIsUpdatingJob(true)
    try {
      const payload = {
        ...editingJob,
        requirements: editingJob.requirements
          .split(",")
          .map((req) => req.trim())
          .filter(Boolean),
      }

      const response = await fetch("/api/job-listings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update job opening")
      }

      toast({
        title: "Success",
        description: "Job opening updated successfully!",
      })
      setIsEditJobModalOpen(false)
      setEditingJob(null)
      fetchJobListings() // Refresh job listings
    } catch (error) {
      console.error("Error updating job opening:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update job opening.",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingJob(false)
    }
  }

  const handleDeleteJob = async (jobId) => {
    setIsDeletingJob(true)
    try {
      const response = await fetch(`/api/job-listings?id=${jobId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete job opening")
      }

      toast({
        title: "Success",
        description: "Job opening deleted successfully!",
      })
      fetchJobListings() // Refresh job listings
    } catch (error) {
      console.error("Error deleting job opening:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete job opening.",
        variant: "destructive",
      })
    } finally {
      setIsDeletingJob(false)
    }
  }

  return (
    <>
     <AdminNavigation />
     <div className="pt-16 min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <Link href="/admin/dashboard">
          <Button variant="outline" className="md:mt-[50px] mt-[30px] mb-8 flex items-center gap-2 bg-card text-foreground">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Button>
        </Link>

        <h1 className="text-3xl sm:text-4xl text-center font-bold text-foreground mb-2">Job Applications</h1>
        <p className="text-muted-foreground text-center mb-8">Manage and review job applications</p>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Applications</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{applications.length}</div>
              <p className="text-xs text-muted-foreground">
                <Link href="#" className="text-primary hover:underline">
                  View all applications
                </Link>
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Review</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {applications.filter((app) => app.status === "pending").length}
              </div>
              <p className="text-xs text-muted-foreground text-yellow-600">Pending Review</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Shortlisted</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {applications.filter((app) => app.status === "shortlisted").length}
              </div>
              <p className="text-xs text-muted-foreground text-green-600">Shortlisted</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Rejected</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {applications.filter((app) => app.status === "rejected").length}
              </div>
              <p className="text-xs text-muted-foreground text-red-600">Rejected</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="bg-card p-4 sm:p-6 rounded-lg shadow-sm mb-8 border border-border">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or phone"
                className="pl-9 w-full bg-background text-foreground border-border"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px] bg-background text-foreground border-border">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent className="bg-card text-foreground border-border">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending Review</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="shortlisted">Shortlisted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={positionFilter} onValueChange={setPositionFilter}>
              <SelectTrigger className="w-full sm:w-[180px] bg-background text-foreground border-border">
                <SelectValue placeholder="All Positions" />
              </SelectTrigger>
              <SelectContent className="bg-card text-foreground border-border">
                <SelectItem value="all">All Positions</SelectItem>
                {jobListings.map((listing) => (
                  <SelectItem key={listing.id} value={listing.title}>
                    {listing.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Dialog open={isNewJobModalOpen} onOpenChange={setIsNewJobModalOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto bg-primary border hover:bg-primary/90 text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" /> Add New Job Opening
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-card text-foreground border-border">
              <DialogHeader>
                <DialogTitle>Add New Job Opening</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateNewJobOpening} className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Job Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={newJobOpening.title}
                    onChange={handleNewJobOpeningChange}
                    required
                    className="bg-background text-foreground border-border"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">Employment Type</Label>
                  <Input
                    id="type"
                    name="type"
                    value={newJobOpening.type}
                    onChange={handleNewJobOpeningChange}
                    placeholder="e.g., Full-time, Part-time, Contract"
                    className="bg-background text-foreground border-border"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    name="location"
                    value={newJobOpening.location}
                    onChange={handleNewJobOpeningChange}
                    placeholder="e.g., Abuja, Remote"
                    className="bg-background text-foreground border-border"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="requirements">Requirements (comma-separated)</Label>
                  <Textarea
                    id="requirements"
                    name="requirements"
                    value={newJobOpening.requirements}
                    onChange={handleNewJobOpeningChange}
                    placeholder="e.g., Bachelor's degree, 2+ years experience, Strong communication skills"
                    className="bg-background text-foreground border-border"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_active"
                    name="is_active"
                    checked={newJobOpening.is_active}
                    onCheckedChange={(checked) =>
                      handleNewJobOpeningChange({
                        target: { name: "is_active", type: "checkbox", checked },
                      })
                    }
                  />
                  <Label htmlFor="is_active">Active (Show on About Us page)</Label>
                </div>
                <Button
                  type="submit"
                  disabled={isSubmittingNewJob}
                  className="bg-background border hover:bg-primary/90 text-primary-foreground"
                >
                  {isSubmittingNewJob ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
                    </>
                  ) : (
                    "Create Job Opening"
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Job Listings Management */}
        <div className="bg-card p-4 sm:p-6 rounded-lg shadow-sm mb-8 border border-border">
          <h2 className="text-xl font-semibold text-foreground mb-4">Manage Job Openings</h2>
          <div className="space-y-4">
            {jobListings.length === 0 ? (
              <p className="text-muted-foreground">No job openings available.</p>
            ) : (
              jobListings.map((job) => (
                <div key={job.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-foreground">{job.title}</h3>
                      <Badge variant={job.is_active ? "default" : "secondary"}>
                        {job.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {job.type} • {job.location} • Created {new Date(job.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditJob(job)}
                      className="bg-background text-foreground border-border"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-background text-destructive border-border hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-card text-foreground border-border">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Job Opening</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{job.title}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-background text-foreground border-border">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteJob(job.id)}
                            disabled={isDeletingJob}
                            className="bg-primary/90 text-destructive-foreground hover:bg-primary"
                          >
                            {isDeletingJob ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...
                              </>
                            ) : (
                              "Delete"
                            )}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Edit Job Modal */}
        <Dialog open={isEditJobModalOpen} onOpenChange={setIsEditJobModalOpen}>
          <DialogContent className="sm:max-w-[425px] bg-card text-foreground border-border">
            <DialogHeader>
              <DialogTitle>Edit Job Opening</DialogTitle>
            </DialogHeader>
            {editingJob && (
              <form onSubmit={handleUpdateJobOpening} className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-title">Job Title</Label>
                  <Input
                    id="edit-title"
                    name="title"
                    value={editingJob.title}
                    onChange={handleEditJobChange}
                    required
                    className="bg-background text-foreground border-border"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-type">Employment Type</Label>
                  <Input
                    id="edit-type"
                    name="type"
                    value={editingJob.type}
                    onChange={handleEditJobChange}
                    placeholder="e.g., Full-time, Part-time, Contract"
                    className="bg-background text-foreground border-border"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-location">Location</Label>
                  <Input
                    id="edit-location"
                    name="location"
                    value={editingJob.location}
                    onChange={handleEditJobChange}
                    placeholder="e.g., Abuja, Remote"
                    className="bg-background text-foreground border-border"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-requirements">Requirements (comma-separated)</Label>
                  <Textarea
                    id="edit-requirements"
                    name="requirements"
                    value={editingJob.requirements}
                    onChange={handleEditJobChange}
                    placeholder="e.g., Bachelor's degree, 2+ years experience, Strong communication skills"
                    className="bg-background text-foreground border-border"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-is_active"
                    name="is_active"
                    checked={editingJob.is_active}
                    onCheckedChange={(checked) =>
                      handleEditJobChange({
                        target: { name: "is_active", type: "checkbox", checked },
                      })
                    }
                  />
                  <Label htmlFor="edit-is_active">Active (Show on About Us page)</Label>
                </div>
                <Button
                  type="submit"
                  disabled={isUpdatingJob}
                  className="bg-primary border hover:bg-card text-primary-foreground"
                >
                  {isUpdatingJob ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...
                    </>
                  ) : (
                    "Update Job Opening"
                  )}
                </Button>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* Applications List */}
        <div className="grid grid-cols-1 gap-6">
          {filteredApplications.length === 0 ? (
            <p className="text-center text-muted-foreground">No applications found matching your criteria.</p>
          ) : (
            filteredApplications.map((app) => (
              <Card key={app.id} className="bg-card border-border shadow-sm">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2 sm:mb-0">
                      <h2 className="text-xl font-semibold text-foreground">{app.full_name}</h2>
                      <Badge variant={getStatusBadgeVariant(app.status)} className="w-fit">
                        {app.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(app.created_at).toLocaleString()}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4 text-muted-foreground text-sm">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4" /> {app.position}
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" /> <span className="break-all">{app.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" /> {app.phone}
                    </div>
                    {app.location && (
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4" /> {app.location}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 mt-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="flex-1 sm:flex-none bg-background text-foreground border-border"
                        >
                          <Eye className="w-4 h-4 mr-2" /> Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[600px] bg-card text-foreground border-border">
                        <DialogHeader>
                          <DialogTitle>{app.full_name}'s Application</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4 text-muted-foreground">
                          <div>
                            <h3 className="font-semibold text-foreground">Position Applied For:</h3>
                            <p>{app.position}</p>
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">Email:</h3>
                            <p>{app.email}</p>
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">Phone:</h3>
                            <p>{app.phone}</p>
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">Cover Letter:</h3>
                            <p className="whitespace-pre-wrap">{app.cover_letter}</p>
                          </div>
                          {app.cv_url && (
                            <div>
                              <h3 className="font-semibold text-foreground">CV:</h3>
                              <a
                                href={app.cv_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline flex items-center gap-1"
                              >
                                <Download className="w-4 h-4" /> Download CV
                              </a>
                            </div>
                          )}
                          <div>
                            <h3 className="font-semibold text-foreground">Status:</h3>
                            <Badge variant={getStatusBadgeVariant(app.status)}>{app.status}</Badge>
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">Applied On:</h3>
                            <p>{new Date(app.created_at).toLocaleString()}</p>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {app.cv_url && (
                      <a href={app.cv_url} target="_blank" rel="noopener noreferrer" className="flex-1 sm:flex-none">
                        <Button variant="outline" className="w-full bg-background text-foreground border-border">
                          <Download className="w-4 h-4 mr-2" /> Download CV
                        </Button>
                      </a>
                    )}

                    <Select value={app.status} onValueChange={(newStatus) => handleStatusChange(app.id, newStatus)}>
                      <SelectTrigger className="flex-1 sm:flex-none w-full sm:w-[140px] bg-background text-foreground border-border">
                        <SelectValue placeholder="Update Status" />
                      </SelectTrigger>
                      <SelectContent className="bg-card text-foreground border-border">
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="reviewed">Reviewed</SelectItem>
                        <SelectItem value="shortlisted">Shortlisted</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
    </>

  )
}

export default AdminApplicationsPage
