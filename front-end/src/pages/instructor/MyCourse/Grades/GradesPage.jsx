
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Pencil, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import AddNewGradeCategory from "./AddNewGradeCategory"


const GradesPage = () => {
    const [categories, setCategories] = useState([
        { id: "1", name: "Assignments", weight: 40 },
        { id: "2", name: "Participation", weight: 20 },
        { id: "3", name: "Final Project", weight: 40 },
    ])

    const [gradeScale] = useState([
        { id: "1", letter: "A", range: "90% - 100%" },
        { id: "2", letter: "B", range: "80% - 89%" },
        { id: "3", letter: "C", range: "70% - 79%" },
        { id: "4", letter: "D", range: "60% - 69%" },
        { id: "5", letter: "F", range: "Below 60%" },
    ])
    const [openDialog, setOpenDialog] = useState(false)
    const [dialogMode, setDialogMode] = useState("add")
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedGrade, setSelectedGrade] = useState(null);


    const handleAddCategory = () => {
        setDialogMode("add")
        setSelectedCategory(null)
        setOpenDialog(true)
    }
    const handleEditCategory = (category) => {
        setDialogMode("edit")
        setSelectedCategory(category)
        setOpenDialog(true)
    }
    const handleAddGrade = () => {
        setDialogMode("add")
        setSelectedGrade(null)
        setOpenDialog(true)
    }
    const handleEditGrade = (grade) => {
        setDialogMode("edit")
        setSelectedGrade(grade)
        setOpenDialog(true)
    }
    const handleSubmitCategory = (data) => {
        if (dialogMode === "add") {
            console.log("Adding new category:", data)
        } else {
            console.log("Updating category:", data)
        }
    }
    const handleSubmitGrade = (data) => {
        if (dialogMode === "add") {
            console.log("Adding new grade:", data)
        } else {
            console.log("Updating grade:", data)
        }
    }
    return (
        <Card className="bg-white p-6">
            {/* Header */}
            <div className="mb-6 border-l-4 border-blue-600 pl-4">
                <h1 className="text-lg font-bold text-gray-900">Grades</h1>
            </div>

            {/* Grading Method and Total Points */}
            <div className="mb-6 grid gap-6 md:grid-cols-2">
                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Grading Method</label>
                    <Select defaultValue="points-based">
                        <SelectTrigger className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="points-based">Points-Based</SelectItem>
                            <SelectItem value="percentage">Percentage</SelectItem>
                            <SelectItem value="weighted">Weighted</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Total Course Points</label>
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-semibold text-gray-900">70</span>
                        <span className="text-sm text-gray-500">Auto-calculated based on assignments, quizzes</span>
                    </div>
                </div>
            </div>

            {/* Grade Distribution and Late Penalty */}
            <div className="">
                <h2 className="mb-3 text-sm font-semibold text-gray-900 ">Grade Distribution</h2>
                <div className="mb-6 grid gap-6 md:grid-cols-2">
                    <div>
                        <div className="text-sm text-gray-700 pb-2">Minimum Passing Grade</div>
                        <Input
                            type="text"
                            value="60%"
                            readOnly
                            className="sm:w-20 lg:w-103 text-sm font-medium text-gray-900"
                        />
                    </div>

                    <div>
                        <div className=" text-sm text-gray-700 pb-2" >Late Submission Penalty</div>
                        <Input
                            type="text"
                            value="-10 %"
                            readOnly
                            className="sm:w-32 lg:w-103 text-sm font-medium text-gray-900"
                        />
                    </div>
                </div>

            </div>


            {/* Grading Scale */}
            <div className="mt-6">
                <h2 className="mb-3 text-sm font-semibold text-gray-900">Grade Distribution</h2>
                <div className="rounded border border-gray-200 overflow-hidden shadow-sm bg-white">
                    <Table className="w-full">
                        <TableHeader className="bg-gray-50">
                            <TableRow>
                                <TableHead className="text-gray-600 font-semibold text-sm">Letter Grade</TableHead>
                                <TableHead className="text-gray-600 font-semibold text-sm">Percentage Range</TableHead>
                                <TableHead className="w-[60px]"></TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {gradeScale.map((grade) => (
                                <TableRow
                                    key={grade.id}
                                    className="hover:bg-gray-50 transition-colors duration-150"
                                >
                                    <TableCell className="py-3 text-sm font-medium text-gray-800">
                                        {grade.letter}
                                    </TableCell>
                                    <TableCell className="py-3 text-sm text-gray-700">
                                        {grade.range}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 hover:bg-gray-100"
                                            onClick={() => handleEditGrade(grade)}
                                        >
                                            <Pencil className="h-4 w-4 text-gray-500" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <button
                    onClick={handleAddGrade}
                    className="mt-3 flex items-center text-sm text-indigo-600 font-medium hover:underline"

                >
                    + Add New Grade
                </button>
                <AddNewGradeCategory
                    open={openDialog}
                    onOpenChange={setOpenDialog}
                    mode={dialogMode}
                    initialData={selectedCategory}
                    onSubmit={handleSubmitCategory}

                />
            </div>


            {/* Navigation Buttons */}
            <div className="mt-8 flex items-center justify-between mx-5 my-2">
                <Button variant="ghost" className="gap-2 bg-gray-100">
                    <ChevronRight className="h-4 w-4 rotate-180" />
                    Back
                </Button>
                <Button variant="ghost" className="gap-2 text-indigo-600 bg-gray-100">
                    Next
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </Card>
    )
}
export default GradesPage