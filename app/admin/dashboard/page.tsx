"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import api from "@/lib/api"
import { toast } from "sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Check, X, MessageSquare, Building2, Phone } from "lucide-react"

interface Business {
  _id: string
  businessName: string
  businessType: string
  status: string
  createdAt: string
  userId?: {
    name: string
    surname: string
    phoneNumber: string
    email?: string
  }
}

export default function SuperAdminDashboard() {
  const router = useRouter()
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [messageModalOpen, setMessageModalOpen] = useState(false)
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null)
  const [messageTitle, setMessageTitle] = useState("")
  const [messageContent, setMessageContent] = useState("")
  const [isSending, setIsSending] = useState(false)

  const fetchBusinesses = async () => {
    try {
      setIsLoading(true)
      const res = await api.get('/partners/admin/all')
      setBusinesses(res.data)
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        toast.error("Unauthorized")
        router.push("/")
      } else {
        toast.error("Failed to fetch businesses")
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBusinesses()
  }, [])

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await api.put(`/partners/${id}/status`, { status: newStatus })
      toast.success(`Business marked as ${newStatus}`)
      setBusinesses(prev => prev.map(b => b._id === id ? { ...b, status: newStatus } : b))
    } catch (err) {
      toast.error("Failed to update status")
    }
  }

  const handleSendMessage = async () => {
    if (!selectedPartnerId || !messageTitle || !messageContent) {
      toast.error("Please fill in all fields")
      return
    }

    try {
      setIsSending(true)
      await api.post('/notifications/admin/send', {
        partnerId: selectedPartnerId,
        title: messageTitle,
        message: messageContent
      })
      toast.success("Message sent successfully")
      setMessageModalOpen(false)
      setMessageTitle("")
      setMessageContent("")
    } catch (err) {
      toast.error("Failed to send message")
    } finally {
      setIsSending(false)
    }
  }

  const openMessageModal = (partnerId: string) => {
    setSelectedPartnerId(partnerId)
    setMessageModalOpen(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-emerald-500 hover:bg-emerald-600">Active</Badge>
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200">Pending</Badge>
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Businesses Directory</h2>
          <p className="text-slate-500 mt-1">Manage and moderate all registered partners on the platform.</p>
        </div>
        <Button onClick={fetchBusinesses} variant="outline" className="bg-white">
          Refresh List
        </Button>
      </div>

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-semibold text-slate-900">Business Details</TableHead>
              <TableHead className="font-semibold text-slate-900">Owner Info</TableHead>
              <TableHead className="font-semibold text-slate-900">Joined</TableHead>
              <TableHead className="font-semibold text-slate-900">Status</TableHead>
              <TableHead className="text-right font-semibold text-slate-900">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  Loading businesses...
                </TableCell>
              </TableRow>
            ) : businesses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  No businesses found.
                </TableCell>
              </TableRow>
            ) : (
              businesses.map((business) => (
                <TableRow key={business._id} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{business.businessName}</p>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mt-0.5">{business.businessType}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {business.userId ? (
                      <div className="text-sm">
                        <p className="font-medium">{business.userId.name} {business.userId.surname}</p>
                        <div className="flex items-center text-muted-foreground mt-1 text-xs gap-1">
                          <Phone className="h-3 w-3" />
                          {business.userId.phoneNumber}
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs italic text-muted-foreground">Orphaned</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {new Date(business.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(business.status)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        title="Send Message"
                        onClick={() => openMessageModal(business._id)}
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                      
                      {business.status !== 'active' && (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                          title="Accept"
                          onClick={() => handleUpdateStatus(business._id, 'active')}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {business.status !== 'rejected' && (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 p-0 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                          title="Reject"
                          onClick={() => handleUpdateStatus(business._id, 'rejected')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Message Modal */}
      <Dialog open={messageModalOpen} onOpenChange={setMessageModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send Message to Partner</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="e.g. Account Verification Request"
                value={messageTitle}
                onChange={(e) => setMessageTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <textarea
                id="message"
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Type your message here..."
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMessageModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSendMessage} disabled={isSending}>
              {isSending ? "Sending..." : "Send Message"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
