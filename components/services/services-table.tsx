"use client"

import { useState } from "react"
import { Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface Service {
  id: string
  name: string
  category: string
  duration: string
  price: number
  branches: string[]
}

const services: Service[] = [
  {
    id: "1",
    name: "Executive Haircut & Styling",
    category: "Premium Grooming",
    duration: "45 min",
    price: 65.0,
    branches: ["Downtown Studio", "Westside Mall"],
  },
  {
    id: "2",
    name: "Deep Tissue Massage Therapy",
    category: "Premium Grooming",
    duration: "60 min",
    price: 95.0,
    branches: ["Harbor Spa", "Downtown Studio"],
  },
  {
    id: "3",
    name: "Advanced HydraFacial Treatment",
    category: "Premium Grooming",
    duration: "75 min",
    price: 120.0,
    branches: ["Harbor Spa"],
  },
  {
    id: "4",
    name: "Beard Grooming & Hot Towel",
    category: "Premium Grooming",
    duration: "30 min",
    price: 35.0,
    branches: ["Downtown Studio", "Westside Mall", "North Creek"],
  },
  {
    id: "5",
    name: "Classic Manicure",
    category: "Premium Grooming",
    duration: "40 min",
    price: 45.0,
    branches: ["Westside Mall"],
  },
]

interface ServicesTableProps {
  searchQuery: string
  selectedCategory: string
}

export function ServicesTable({ searchQuery, selectedCategory }: ServicesTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const filteredServices = services.filter((service) => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || service.category.toLowerCase().includes(selectedCategory)
    return matchesSearch && matchesCategory
  })

  const totalResults = 24
  const startResult = (currentPage - 1) * rowsPerPage + 1
  const endResult = Math.min(currentPage * rowsPerPage, totalResults)
  const totalPages = Math.ceil(totalResults / rowsPerPage)

  return (
    <div className="bg-background border border-border rounded-lg overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="font-semibold text-muted-foreground uppercase text-xs tracking-wider">
                Service Name
              </TableHead>
              <TableHead className="font-semibold text-muted-foreground uppercase text-xs tracking-wider text-center">
                Duration
              </TableHead>
              <TableHead className="font-semibold text-muted-foreground uppercase text-xs tracking-wider text-center">
                Price
              </TableHead>
              <TableHead className="font-semibold text-muted-foreground uppercase text-xs tracking-wider">
                Assigned Branches
              </TableHead>
              <TableHead className="font-semibold text-muted-foreground uppercase text-xs tracking-wider text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredServices.map((service) => (
              <TableRow key={service.id} className="hover:bg-muted/20 transition-colors">
                <TableCell>
                  <div>
                    <p className="font-medium text-foreground">{service.name}</p>
                    <p className="text-sm text-muted-foreground">Category: {service.category}</p>
                  </div>
                </TableCell>
                <TableCell className="text-center text-muted-foreground">
                  {service.duration}
                </TableCell>
                <TableCell className="text-center font-medium text-foreground">
                  ${service.price.toFixed(2)}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1.5">
                    {service.branches.slice(0, 3).map((branch, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-muted text-muted-foreground font-normal text-xs"
                      >
                        {branch}
                      </Badge>
                    ))}
                    {service.branches.length > 3 && (
                      <Badge
                        variant="secondary"
                        className="bg-muted text-muted-foreground font-normal text-xs"
                      >
                        +{service.branches.length - 3} more
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit service</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete service</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden divide-y divide-border">
        {filteredServices.map((service) => (
          <div key={service.id} className="p-4">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <p className="font-medium text-foreground">{service.name}</p>
                <p className="text-sm text-muted-foreground">Category: {service.category}</p>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm mb-3">
              <span className="text-muted-foreground">{service.duration}</span>
              <span className="font-medium text-foreground">${service.price.toFixed(2)}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {service.branches.slice(0, 2).map((branch, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="bg-muted text-muted-foreground font-normal text-xs"
                >
                  {branch}
                </Badge>
              ))}
              {service.branches.length > 2 && (
                <Badge
                  variant="secondary"
                  className="bg-muted text-muted-foreground font-normal text-xs"
                >
                  +{service.branches.length - 2} more
                </Badge>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-4 border-t border-border">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-medium text-foreground">{startResult} to {endResult}</span> of{" "}
          <span className="font-medium text-foreground">{totalResults}</span> results
        </p>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Rows per page:</span>
            <Select value={rowsPerPage.toString()} onValueChange={(val) => setRowsPerPage(Number(val))}>
              <SelectTrigger className="w-16 h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous page</span>
            </Button>
            
            {[1, 2, 3].map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="icon"
                className={`h-8 w-8 ${
                  currentPage === page 
                    ? "bg-primary text-primary-foreground" 
                    : ""
                }`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next page</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
