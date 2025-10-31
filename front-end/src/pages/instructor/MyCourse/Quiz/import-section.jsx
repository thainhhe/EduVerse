

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, FileUp } from "lucide-react"


export function ImportSection({ onImportQuestions }) {
    const [isDragging, setIsDragging] = useState(false)

    const handleDragOver = (e) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = () => {
        setIsDragging(false)
    }

    const handleDrop = (e) => {
        e.preventDefault()
        setIsDragging(false)
        handleFiles(e.dataTransfer.files)
    }

    const handleFileInput = (e) => {
        if (e.target.files) {
            handleFiles(e.target.files)
        }
    }

    const handleFiles = (files) => {
        const file = files[0]
        if (
            file &&
            (file.type === "application/vnd.ms-excel" ||
                file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
        ) {
            // In a real app, you would parse the Excel file here
            alert(
                "Excel file selected: " +
                file.name +
                "\n\nIn a production app, this would parse the Excel file and import questions.",
            )
        } else {
            alert("Please upload a valid Excel file (.xls or .xlsx)")
        }
    }

    return (
        <Card className="sticky top-6 h-fit">
            <CardHeader>
                <CardTitle>Import Questions</CardTitle>
                <CardDescription>Upload an Excel file to import multiple questions at once.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Drag and Drop Area */}
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`rounded-lg border-2 border-dashed p-8 text-center transition-colors ${isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 bg-muted/50"
                            }`}
                    >
                        <Upload className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                        <p className="text-sm font-medium text-foreground">Drag & drop your Excel file here, or</p>
                        <p className="text-xs text-muted-foreground">Supported formats: .xls, .xlsx</p>
                    </div>

                    {/* Browse Button */}
                    <div>
                        <label htmlFor="file-input">
                            <Button asChild variant="outline" className="w-full cursor-pointer bg-transparent">
                                <span>
                                    <FileUp className="mr-2 h-4 w-4" />
                                    Browse Files
                                </span>
                            </Button>
                        </label>
                        <input id="file-input" type="file" accept=".xls,.xlsx" onChange={handleFileInput} className="hidden" />
                    </div>

                    {/* Info Text */}
                    <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
                        <p className="font-medium mb-1">Excel Format Requirements:</p>
                        <ul className="list-inside list-disc space-y-1">
                            <li>Column A: Question Text</li>
                            <li>Column B: Question Type</li>
                            <li>Column C: Difficulty</li>
                            <li>Column D-G: Answer Options</li>
                            <li>Column H: Correct Answer</li>
                        </ul>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
