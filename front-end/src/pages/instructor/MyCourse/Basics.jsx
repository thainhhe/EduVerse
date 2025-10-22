import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Dialog } from '@radix-ui/react-dialog'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const Basics = () => {
    const [date, setDate] = useState(new Date());

    const navigate = useNavigate();
    const [file, setFile] = useState("")

    // Mở hộp chọn file
    const handleBrowse = () => {
        document.getElementById("fileInput")?.click()
    }

    // Lấy file người dùng chọn
    const handleFileChange = (e) => {
        const selectedFile = e.target.files?.[0]
        if (selectedFile) setFile(selectedFile)
    }

    // Hủy file đã chọn
    const handleCancel = () => {
        setFile(null)
        const input = document.getElementById("fileInput")
        if (input) input.value = ""
    }

    const handleUpload = () => {
        if (!file) {
            alert("Please select a file first.")
            return
        }
        console.log("Uploading:", file)

    }
    return (
        <div>
            <Card>
                <CardHeader className="border-b pb-4">
                    <CardTitle className="text-xl font-semibold flex items-center gap-2">
                        <span className="w-1.5 h-6 rounded bg-indigo-500" />
                        Basics
                    </CardTitle>
                </CardHeader>
                <CardContent className="mt-10">
                    <div className="space-y-3">


                        <div className="space-y-3">
                            {/* Label */}
                            <div className="font-semibold text-gray-700">
                                Upload video
                            </div>

                            <div
                                className="border-2 border-dashed border-gray-300 rounded-xl p-8 
      hover:border-indigo-500 transition-colors bg-white shadow-sm relative"
                            >
                                <input
                                    id="fileInput"
                                    type="file"
                                    accept="video/mp4,video/avi,video/mov"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />

                                {/* Upload area */}
                                <div className="flex flex-col items-center justify-center text-gray-500 min-h-[250px]">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-10 w-10 mb-2 text-indigo-500"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                        />
                                    </svg>

                                    {!file ? (
                                        <>
                                            <p className="text-lg font-semibold text-gray-700 mb-1">Drop video here</p>
                                            <p className="text-sm text-gray-500 mb-2">Supported format: MP4, AVI, MOV...</p>
                                            <p className="text-sm font-medium text-gray-400">OR</p>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="mt-2 text-indigo-600 border-indigo-500 hover:bg-indigo-50"
                                                onClick={handleBrowse}
                                            >
                                                Browse files
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <p className="text-lg font-semibold text-gray-700 mb-2">Selected file:</p>
                                            <p className="text-sm text-indigo-600 font-medium">{file.name}</p>
                                        </>
                                    )}
                                </div>

                                {/* Action buttons — fixed bottom right */}
                                <div className="absolute bottom-4 right-4 flex gap-3">
                                    <Button
                                        variant="outline"
                                        className="border-gray-300 text-gray-600 hover:bg-gray-100"
                                        onClick={handleCancel}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                        onClick={handleUpload}
                                    >
                                        Upload
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>


                    {/* Form Fields */}
                    <div className="grid grid-cols-2 gap-6 mt-5">
                        <div>
                            <Label htmlFor="title" className="mb-2">Course Title</Label>
                            <Input id="title" defaultValue="Node JS" />
                        </div>

                        <div>
                            <Label htmlFor="category" className="mb-2">Category</Label>
                            <Select defaultValue="software">
                                <SelectTrigger id="category">
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="software">Software Engineer</SelectItem>
                                    <SelectItem value="design">Design</SelectItem>
                                    <SelectItem value="business">Business</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="level" className="mb-2">Course Level</Label>
                            <Select defaultValue="beginner">
                                <SelectTrigger id="level">
                                    <SelectValue placeholder="Select level" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="beginner">Beginner</SelectItem>
                                    <SelectItem value="intermediate">Intermediate</SelectItem>
                                    <SelectItem value="advanced">Advanced</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="language" className="mb-2">Language</Label>
                            <Select defaultValue="english">
                                <SelectTrigger id="language">
                                    <SelectValue placeholder="Select language" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="english">English</SelectItem>
                                    <SelectItem value="vietnamese">Vietnamese</SelectItem>
                                    <SelectItem value="spanish">Spanish</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>



                        <div className="col-span-2 grid grid-cols-2 gap-6">
                            <div>
                                <Label htmlFor="timezone" className="mb-2">Timezone</Label>
                                <Select defaultValue="utc7">
                                    <SelectTrigger id="timezone">
                                        <SelectValue placeholder="Select timezone" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="utc7">UTC +07:00</SelectItem>
                                        <SelectItem value="utc0">UTC +00:00</SelectItem>
                                        <SelectItem value="utc8">UTC +08:00</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className='grid grid-cols-2 gap-5'>
                                <div>
                                    <Label htmlFor="startDate" className="mb-2">Start Date</Label>
                                    <div className="relative">
                                        <Input
                                            id="startDate"
                                            type="date"
                                            defaultValue="2024-10-25"
                                            className="pr-10"
                                        />



                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="endDate" className="mb-2">End Date</Label>
                                    <div className="relative">
                                        <Input
                                            id="endDate"
                                            type="date"
                                            defaultValue="2024-12-15"
                                            className="pr-10"
                                        />
                                    </div>
                                </div>
                            </div>

                        </div>

                        <div className="">
                            <Label htmlFor="description" className="mb-2">Description</Label>
                            <Textarea
                                id="description"
                                placeholder="description here..."
                                className="min-h-[100px] resize-none"
                            />
                        </div>

                        <div className="">
                            <Label htmlFor="bio" className="mb-2">Instructor Bio</Label>
                            <Textarea
                                id="bio"
                                placeholder="Instructor bio..."
                                className="min-h-[100px] resize-none"
                            />
                        </div>
                    </div>

                    {/* Checkboxes */}
                    <div className="space-y-3 mt-5">
                        {[
                            "Allow personalized learning paths for students based on the student's assessments",
                            "All assignments must be submitted by the end date for a certificate",
                            "Allow students attach files to discussions",
                            "Allow students create discussions topics",
                            "Allow students edit or delete their own discussion replies",
                            "Allow students organize their own groups",
                            "Hide totals in students grades summary",
                        ].map((text, i) => (
                            <div key={i} className="flex items-start gap-3">
                                <Checkbox id={`check-${i}`} />
                                <label
                                    htmlFor={`check-${i}`}
                                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    {text}
                                </label>
                            </div>
                        ))}
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-end pt-4 border-t mt-5">
                        <Button
                            variant="outline"
                            className="px-6 text-indigo-500"
                            onClick={() => navigate("/create-course/modules")}
                        >
                            Next →
                        </Button>
                    </div>

                </CardContent>
            </Card>
        </div>
    )
}


export default Basics
