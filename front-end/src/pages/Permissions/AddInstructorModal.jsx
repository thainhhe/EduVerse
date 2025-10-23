"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"


const permissionOptions = [
  { id: "visible", label: "Visible" },
  { id: "cautions", label: "Cautions" },
  { id: "qa", label: "Q&A" },
  { id: "reviews", label: "Reviews" },
  { id: "manageCourse", label: "Manage Course" },
  { id: "performance", label: "Performance" },
  { id: "assignments", label: "Assignments" },
]

export function AddInstructorModal({ open, onOpenChange, onSubmit }) {
  const [email, setEmail] = useState("")
  const [permissions, setPermissions] = useState(
    permissionOptions.reduce((acc, opt) => ({ ...acc, [opt.id]: false }), {}),
  )

  const handleSubmit = () => {
    if (email.trim()) {
      onSubmit(email, permissions)
      setEmail("")
      setPermissions(permissionOptions.reduce((acc, opt) => ({ ...acc, [opt.id]: false }), {}))
      console.log("permision", permissions)
      onOpenChange(false)
    }
  }

  const togglePermission = (permissionId) => {
    setPermissions((prev) => ({
      ...prev,
      [permissionId]: !prev[permissionId],
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">Add New Instructor</DialogTitle>
          <p className="text-sm text-gray-600 mt-1">Enter the instructor's email and assign permissions.</p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <Input
              type="email"
              placeholder="instructor@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Permissions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Permissions</label>
            <div className="space-y-3">
              {permissionOptions.map((option) => (
                <div key={option.id} className="flex items-center">
                  <Checkbox
                    id={option.id}
                    checked={permissions[option.id] || false}
                    onCheckedChange={() => togglePermission(option.id)}
                    // className="rounded"
                    className=" data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                  />
                  <label htmlFor={option.id} className="ml-3 text-sm text-gray-700 cursor-pointer">
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="px-6 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">
            Send Invitation
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
