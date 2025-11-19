import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import categoryService from "@/services/categoryService";
import { useAuth } from "@/hooks/useAuth";
import api from "@/services/api";
import { useCourse } from "@/context/CourseProvider";

const Basics = ({ courseId = null, isUpdate = false, courseData = null }) => {
    const navigate = useNavigate();
    const { user } = useAuth() || {};
    const { draft, updateDraft, clearDraft, isMainInstructor } = useCourse();

    const isEditable = !!isMainInstructor;

    const [file, setFile] = useState(null);
    const [saving, setSaving] = useState(false);
    const [categories, setCategories] = useState([]);

    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("");
    const [newCategory, setNewCategory] = useState("");
    const [price, setPrice] = useState("");
    const [description, setDescription] = useState("");

    const [existingThumbnailUrl, setExistingThumbnailUrl] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState(null);
    const [removeThumbnail, setRemoveThumbnail] = useState(false);

    // Load categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const list = await categoryService.getAll();
                setCategories(list);
            } catch {
                setCategories([]);
            }
        };
        fetchCategories();
    }, []);

    // Load courseData if update
    useEffect(() => {
        if (!courseData) return;
        setTitle(courseData.title ?? "");
        setDescription(courseData.description ?? "");
        setCategory(courseData.category?._id ?? courseData.category ?? "");
        setPrice(courseData.price ?? "");
        setExistingThumbnailUrl(courseData.thumbnail ?? courseData.image ?? courseData.imageUrl ?? null);
        setRemoveThumbnail(false);
    }, [courseData]);

    // Load draft
    useEffect(() => {
        if (courseData) return;
        if (!draft) return;
        setTitle((v) => v || draft.title || "");
        setDescription((v) => v || draft.description || "");
        setCategory((v) => v || draft.category || "");
        setPrice((v) => v || draft.price || "");
        setExistingThumbnailUrl((v) => v || draft.thumbnailUrl || null);
        setRemoveThumbnail(!!draft.removeThumbnail);
    }, [draft, courseData]);

    // Persist draft
    useEffect(() => {
        try {
            updateDraft({
                title,
                description,
                category,
                price,
                thumbnailUrl: existingThumbnailUrl,
                hasNewFile: !!file,
                removeThumbnail,
                updatedAt: Date.now(),
            });
        } catch {}
    }, [title, description, category, price, existingThumbnailUrl, file, removeThumbnail, updateDraft]);

    useEffect(() => {
        return () => {
            if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
        };
    }, [thumbnailPreview]);

    const handleBrowse = () => {
        if (!isEditable) return;
        document.getElementById("fileInput")?.click();
    };

    const handleFileChange = (e) => {
        if (!isEditable) return;
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
            const previewUrl = URL.createObjectURL(selectedFile);
            setFile(selectedFile);
            setThumbnailPreview(previewUrl);
            setRemoveThumbnail(false);
        }
    };

    const handleCancel = () => {
        if (!isEditable) return;
        if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
        setFile(null);
        setThumbnailPreview(null);
    };

    const handleRemoveThumbnail = () => {
        if (!isEditable) return;
        if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
        setThumbnailPreview(null);
        setFile(null);
        setExistingThumbnailUrl(null);
        setRemoveThumbnail(true);
    };

    const handleNext = async () => {
        if (!isEditable) {
            navigate("/create-course/modules", { state: { id: courseId } });
            return;
        }

        if (!title.trim()) return alert("Title is required.");
        if (!newCategory && !category) return alert("Please select or enter a category.");

        try {
            setSaving(true);

            let categoryId = category;
            if (newCategory && newCategory.trim()) {
                const created = await categoryService.create({
                    name: newCategory.trim(),
                    description: newCategory.trim(),
                });
                categoryId = created?._id ?? created.id;
            }

            const payload = {
                title: title.trim(),
                description: description.trim(),
                main_instructor: user?._id,
                category: categoryId,
                price: price !== "" ? Number(price) : undefined,
                ...(removeThumbnail ? { removeThumbnail: true } : {}),
            };

            let res;
            if (file) {
                const formData = new FormData();
                Object.entries(payload).forEach(([k, v]) => formData.append(k, v));
                formData.append("thumbnail", file);
                res = isUpdate
                    ? await api.put(`/courses/update/${courseId}`, formData)
                    : await api.post("/courses/create", formData);
            } else {
                res = isUpdate
                    ? await api.put(`/courses/update/${courseId}`, payload)
                    : await api.post("/courses/create", payload);
            }

            const data = res.data;
            const id = data?._id ?? data.id ?? courseId;

            sessionStorage.setItem("currentCourseId", id);
            sessionStorage.setItem(
                "currentCourseData",
                JSON.stringify({
                    ...data,
                    lastUpdated: data.updatedAt ? new Date(data.updatedAt).toLocaleDateString() : "—",
                })
            );

            clearDraft();
            navigate("/create-course/modules", { state: { id } });
        } catch (err) {
            alert("Save failed. Check console.");
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

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
                        <div className="font-semibold text-gray-700">Upload thumbnail</div>
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-2 bg-white shadow-sm relative">
                            <input
                                id="fileInput"
                                type="file"
                                disabled={!isEditable}
                                accept="image/png,image/jpeg,image/webp"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                            <div className="flex flex-col items-center justify-center text-gray-500 min-h-[250px]">
                                {thumbnailPreview || existingThumbnailUrl ? (
                                    <img
                                        src={thumbnailPreview || existingThumbnailUrl}
                                        alt="thumbnail"
                                        className="object-cover w-full h-[250px]"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center min-h-[250px]">
                                        <p className="text-lg font-semibold text-gray-700 mb-1">Drop image here</p>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            disabled={!isEditable}
                                            onClick={handleBrowse}
                                        >
                                            Browse images
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <div className="absolute bottom-4 right-4 flex gap-3">
                                <Button variant="outline" disabled={!isEditable} onClick={handleCancel}>
                                    Cancel
                                </Button>
                                {(thumbnailPreview || existingThumbnailUrl) && (
                                    <Button
                                        variant="ghost"
                                        disabled={!isEditable}
                                        onClick={handleRemoveThumbnail}
                                        className="text-red-600"
                                    >
                                        Remove
                                    </Button>
                                )}
                                <Button
                                    disabled={!isEditable}
                                    className="bg-indigo-600 text-white"
                                    onClick={handleBrowse}
                                >
                                    Select
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-5">
                        <div>
                            <Label htmlFor="title" className="mb-2">
                                Course Title
                            </Label>
                            <Input
                                id="title"
                                disabled={!isEditable}
                                value={title}
                                onChange={(e) => isEditable && setTitle(e.target.value)}
                            />
                        </div>

                        <div>
                            <Label htmlFor="price" className="mb-2">
                                Price (VND)
                            </Label>
                            <Input
                                id="price"
                                type="number"
                                disabled={!isEditable}
                                value={price}
                                onChange={(e) => isEditable && setPrice(e.target.value)}
                            />
                        </div>

                        <div>
                            <Label className="mb-2">Category</Label>
                            <Select
                                disabled={!isEditable}
                                value={category}
                                onValueChange={(v) => isEditable && setCategory(v)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((c) => (
                                        <SelectItem key={c.id} value={c.id}>
                                            {c.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <div className="mt-2">
                                <Label htmlFor="newCategory" className="text-sm mb-2">
                                    Or enter new category
                                </Label>
                                <Input
                                    id="newCategory"
                                    disabled={!isEditable}
                                    value={newCategory}
                                    onChange={(e) => isEditable && setNewCategory(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="description" className="mb-2">
                                Description
                            </Label>
                            <Textarea
                                id="description"
                                disabled={!isEditable}
                                value={description}
                                onChange={(e) => isEditable && setDescription(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t mt-5">
                        <Button
                            variant="outline"
                            className="bg-white border border-indigo-600 text-black hover:bg-indigo-600 hover:text-white transition-colors duration-200"
                            onClick={handleNext}
                        >
                            Next →
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Basics;
