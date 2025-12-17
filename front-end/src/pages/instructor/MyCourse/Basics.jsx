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
import { Loader2 } from "lucide-react";

const Basics = ({ courseId = null, isUpdate = false, courseData = null }) => {
    const navigate = useNavigate();
    const { user } = useAuth() || {};
    const { draft, updateDraft, clearDraft, isMainInstructor, permissions } = useCourse();

    const navItems = [
        { name: "Modules", path: "modules", key: "manage_course" },
        { name: "Room Meeting", path: "room-meeting", key: "manage_roomeeting" },
        { name: "Forums", path: "forums", key: "manage_forum" },
        { name: "Learner", path: "learners", key: "view_course_students" },
        { name: "Announcements", path: "announcements", key: "announcements" },
        { name: "Permissions", path: "permissions", key: "permissions" },
    ];
    const visibleNavItems = isMainInstructor
        ? navItems
        : navItems.filter((item) => permissions.includes(item.key));

    const isNew = !courseId;
    const isEditable = isNew || (!!isMainInstructor && courseData?.status === "draft");

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

    const [durationValue, setDurationValue] = useState("");
    const [durationUnit, setDurationUnit] = useState("day"); // "day" | "month" | "year"
    const [errors, setErrors] = useState({});

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
        setDurationValue(courseData.duration.value ?? "");
        setDurationUnit(courseData.duration.unit ?? "day");
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
        setDurationValue((v) => (v ? v : draft.durationValue ?? ""));
        setDurationUnit((v) => (v ? v : draft.durationUnit ?? "day"));
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
                duration: {
                    unit: durationUnit,
                    value: durationValue,
                },
            });
        } catch { }
    }, [
        title,
        description,
        category,
        price,
        existingThumbnailUrl,
        file,
        removeThumbnail,
        updateDraft,
        durationUnit,
        durationValue,
    ]);

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
            navigate(`/create-course/${visibleNavItems[0].path}`, { state: { id: courseId } });
            return;
        }

        const newErrors = {};

        // Title validation
        const trimmedTitle = title.trim();
        if (!trimmedTitle) newErrors.title = "Title is required";
        else if (trimmedTitle.length < 3) newErrors.title = "Title must be at least 3 characters";
        else if (trimmedTitle.length > 200) newErrors.title = "Title must be at most 200 characters";

        // Category validation
        if (!newCategory && !category) newErrors.category = "Category is required";

        // Price validation
        if (price === "" || Number(price) < 0) newErrors.price = "Price must be at least 0";
        else if (Number(price) > 999999999) newErrors.price = "Price is too large. Max is 999.999.999";

        // Description validation
        const trimmedDescription = description.trim();
        if (!trimmedDescription) newErrors.description = "Description is required";
        else if (trimmedDescription.length < 10)
            newErrors.description = "Description must be at least 10 characters";
        else if (trimmedDescription.length > 5000)
            newErrors.description = "Description must be at most 5000 characters";

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) return;
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
                ...(durationValue !== ""
                    ? { duration: { value: Number(durationValue), unit: durationUnit } }
                    : {}),
                ...(removeThumbnail ? { thumbnail: "" } : {}),
            };

            let res;
            if (file) {
                const formData = new FormData();
                Object.entries(payload).forEach(([k, v]) => {
                    if (k === "duration" && typeof v === "object") {
                        formData.append(k, JSON.stringify(v));
                    } else {
                        formData.append(k, v);
                    }
                });
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
                        <div className="border-2 border-dashed border-gray-300 rounded-xl bg-white shadow-sm relative">
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
                                        className="object-cover w-full h-[250px] rounded-xl"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center min-h-[250px]">
                                        <p className="text-lg font-semibold text-gray-700 mb-1">
                                            Drop image here
                                        </p>
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
                            <Label htmlFor="title" className={`mb-2 `}>
                                Course Title <span className="text-red-500">*</span>
                            </Label>

                            <Input
                                id="title"
                                disabled={!isEditable}
                                value={title}
                                onChange={(e) => isEditable && setTitle(e.target.value)}
                                className={errors.title ? "border-red-600 ring-red-600" : ""}
                            />

                            {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
                        </div>

                        <div>
                            <Label htmlFor="price" className={`mb-2`}>
                                Price (VND) <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="price"
                                type="number"
                                disabled={!isEditable}
                                value={price}
                                min={1}
                                max={9999999999}
                                onChange={(e) => isEditable && setPrice(e.target.value)}
                                className={errors.price ? "border-red-600 ring-red-600" : ""}
                            />
                            {errors.price && <p className="text-red-600 text-sm mt-1">{errors.price}</p>}
                        </div>

                        <div>
                            <Label className={`mb-2`}>
                                Category <span className="text-red-500">*</span>
                            </Label>

                            <Select
                                disabled={!isEditable}
                                value={category}
                                onValueChange={(v) => {
                                    if (!isEditable) return;
                                    setCategory(v);
                                    setNewCategory("");
                                    setErrors((prev) => ({ ...prev, category: null }));
                                }}
                            >
                                <SelectTrigger
                                    className={errors.category ? "border-red-600 ring-red-600" : ""}
                                >
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

                            <p className="text-red-600 text-sm mt-1">{errors.category}</p>
                        </div>

                        <div>
                            <Label htmlFor="duration" className={`mb-2 `}>
                                Duration
                            </Label>
                            <div className="flex gap-2">
                                <Input
                                    disabled={!isEditable}
                                    id="duration"
                                    type="number"
                                    min="0"
                                    value={durationValue}
                                    onChange={(e) => setDurationValue(e.target.value)}
                                    placeholder="e.g. 30"
                                />
                                <Select
                                    disabled={!isEditable}
                                    value={durationUnit}
                                    onValueChange={(v) => setDurationUnit(v)}
                                >
                                    <SelectTrigger id="durationUnit" className="w-36">
                                        <SelectValue placeholder="Unit" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="day">Day(s)</SelectItem>
                                        <SelectItem value="month">Month(s)</SelectItem>
                                        <SelectItem value="year">Year(s)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4">
                        <Label htmlFor="description" className="mb-2">
                            Description <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                            id="description"
                            disabled={!isEditable}
                            value={description}
                            onChange={(e) => isEditable && setDescription(e.target.value)}
                            className={
                                errors.description
                                    ? "border-red-600 ring-red-600 focus:border-red-600 focus:ring-red-600"
                                    : "h-28"
                            }
                        />
                        {errors.description && (
                            <p className="text-red-600 text-sm mt-1">{errors.description}</p>
                        )}
                    </div>

                    <div className="flex justify-end pt-4 border-t mt-5">
                        <Button
                            variant="outline"
                            className="bg-white border border-indigo-600 text-black hover:bg-indigo-600 hover:text-white transition-colors duration-200"
                            onClick={handleNext}
                            disabled={saving}
                        >
                            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Next →"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Basics;
