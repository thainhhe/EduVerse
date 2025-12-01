import React, { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Search, Loader2 } from "lucide-react";
import categoryService from "@/services/categoryService";
import Swal from "sweetalert2";

const CategoryManagement = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [currentCategory, setCurrentCategory] = useState(null);
    const [formData, setFormData] = useState({ name: "", description: "" });
    const [submitting, setSubmitting] = useState(false);

    // Pagination & Selection
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [selectedCategories, setSelectedCategories] = useState([]);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const data = await categoryService.getAll();
            setCategories(data);
        } catch (error) {
            console.error("Failed to fetch categories:", error);
            Swal.fire({
                icon: "error",
                title: "Error!",
                text: "Failed to load categories.",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (currentCategory) {
                await categoryService.update(currentCategory.id, formData);
                Swal.fire({
                    icon: "success",
                    title: "Updated!",
                    text: "Category updated successfully.",
                });
            } else {
                await categoryService.create(formData);
                Swal.fire({
                    icon: "success",
                    title: "Created!",
                    text: "Category created successfully.",
                });
            }
            setIsDialogOpen(false);
            fetchCategories();
            resetForm();
            setSelectedCategories([]);
        } catch (error) {
            console.error("Failed to save category:", error);
            Swal.fire({
                icon: "error",
                title: "Error!",
                text: "Failed to save category.",
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!currentCategory) return;
        try {
            await categoryService.remove(currentCategory.id);
            Swal.fire({
                icon: "success",
                title: "Deleted!",
                text: "Category deleted successfully.",
            });
            setIsAlertOpen(false);
            fetchCategories();
            setSelectedCategories([]);
        } catch (error) {
            console.error("Failed to delete category:", error);
            Swal.fire({
                icon: "error",
                title: "Error!",
                text: "Failed to delete category.",
            });
        }
    };

    const openCreateDialog = () => {
        resetForm();
        setIsDialogOpen(true);
    };

    const openEditDialog = (category) => {
        setCurrentCategory(category);
        setFormData({ name: category.name, description: category.description });
        setIsDialogOpen(true);
    };

    const openDeleteAlert = (category) => {
        setCurrentCategory(category);
        setIsAlertOpen(true);
    };

    const resetForm = () => {
        setCurrentCategory(null);
        setFormData({ name: "", description: "" });
    };

    // Filter & Pagination Logic
    const filteredCategories = categories.filter((cat) =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentCategories = filteredCategories.slice(startIndex, startIndex + itemsPerPage);

    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedCategories(currentCategories.map((c) => c.id));
        } else {
            setSelectedCategories([]);
        }
    };

    const handleSelectOne = (id, checked) => {
        if (checked) {
            setSelectedCategories((prev) => [...prev, id]);
        } else {
            setSelectedCategories((prev) => prev.filter((itemId) => itemId !== id));
        }
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Filter Bar */}
            <div className="max-w-full mx-auto shadow-sm border-none">
                <div className="pb-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-2 bg-gray-500 text-black">
                        <div className="flex flex-col items-center sm:flex-row gap-2">
                            <div className="text-md flex items-center p-1.5 bg-white rounded-sm">
                                Categories List {selectedCategories.length} selected
                            </div>
                            <Button
                                onClick={openCreateDialog}
                                className="bg-white text-black hover:bg-gray-100 flex items-center"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                New Category
                            </Button>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-2.5 top-3 h-4 w-4 text-gray-500" />
                            <Input
                                placeholder="Search categories..."
                                className="pl-8 w-full sm:w-[250px] bg-white"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white">
                    <div className="overflow-y-auto">
                        <Table>
                            <TableHeader className="bg-gray-300">
                                <TableRow>
                                    <TableHead className="w-[50px]">
                                        <Checkbox
                                            checked={
                                                currentCategories.length > 0 &&
                                                currentCategories.every((c) =>
                                                    selectedCategories.includes(c.id)
                                                )
                                            }
                                            onCheckedChange={handleSelectAll}
                                            aria-label="Select all"
                                            className="!rounded"
                                        />
                                    </TableHead>
                                    <TableHead className="w-[250px]">Name</TableHead>
                                    <TableHead>Description</TableHead>
                                    {selectedCategories.length > 0 && (
                                        <TableHead className="text-right">Actions</TableHead>
                                    )}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={selectedCategories.length > 0 ? 4 : 3}
                                            className="h-24 text-center"
                                        >
                                            <div className="flex justify-center items-center">
                                                <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : currentCategories.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={selectedCategories.length > 0 ? 4 : 3}
                                            className="h-24 text-center text-muted-foreground"
                                        >
                                            No categories found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    currentCategories.map((category) => (
                                        <TableRow
                                            key={category.id}
                                            className={`hover:bg-gray-200 transition-colors cursor-pointer ${
                                                selectedCategories.includes(category.id) ? "bg-gray-200" : ""
                                            }`}
                                            onClick={() =>
                                                handleSelectOne(
                                                    category.id,
                                                    !selectedCategories.includes(category.id)
                                                )
                                            }
                                        >
                                            <TableCell onClick={(e) => e.stopPropagation()}>
                                                <Checkbox
                                                    checked={selectedCategories.includes(category.id)}
                                                    onCheckedChange={(checked) =>
                                                        handleSelectOne(category.id, checked)
                                                    }
                                                    aria-label={`Select ${category.name}`}
                                                    className="!rounded data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500"
                                                />
                                            </TableCell>
                                            <TableCell className="font-medium">{category.name}</TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {category.description}
                                            </TableCell>
                                            {selectedCategories.length > 0 && (
                                                <TableCell
                                                    className="text-right"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    {selectedCategories.includes(category.id) && (
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                                onClick={() => openEditDialog(category)}
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                onClick={() => openDeleteAlert(category)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    )}
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 px-2 pb-2">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">Rows per page:</span>
                            <select
                                value={itemsPerPage}
                                onChange={(e) => {
                                    setItemsPerPage(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                                className="w-[70px] border-none text-sm"
                            >
                                <option value="5">5</option>
                                <option value="10">10</option>
                                <option value="20">20</option>
                                <option value="50">50</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">
                                Page {currentPage} of {totalPages || 1}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="text-sm flex items-center gap-2"
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="text-sm flex items-center gap-2"
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{currentCategory ? "Edit Category" : "Create Category"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="e.g., Web Development"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Describe the category..."
                                required
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={submitting}
                                className="bg-indigo-600 hover:bg-indigo-700"
                            >
                                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {currentCategory ? "Save Changes" : "Create"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Alert */}
            <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the category "
                            {currentCategory?.name}".
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default CategoryManagement;
