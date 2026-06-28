"use client"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function BusinessesPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl border border-border/40 p-12 text-center space-y-6">
        <div className="w-16 h-16 bg-[#E5555E]/10 text-[#E5555E] rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-4xl font-extrabold text-foreground tracking-tight">For Businesses</h1>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-lg mx-auto">
          We&apos;re actively working on this page. Our team is crafting something special for you. Please check back later!
        </p>
        <div className="pt-8">
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-[#E5555E] text-white text-sm font-bold rounded-xl hover:bg-[#d64c54] transition-colors shadow-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
