import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import categoryService from "@/services/categoryService";
import { useAuth } from "@/hooks/useAuth";
import api from "@/services/api";
import { createCourse } from "@/services/courseService";
import { useCourseDraft } from "@/context/CourseDraftContext";

const Basics = ({ courseId = null, isUpdate = false, courseData = null }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth() || {};
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const [categories, setCategories] = useState([]);

  // Controlled fields
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [bio, setBio] = useState("");

  // NEW: duration state
  const [durationValue, setDurationValue] = useState("");
  const [durationUnit, setDurationUnit] = useState("day"); // "day" | "month" | "year"

  // Thumbnail states
  const [existingThumbnailUrl, setExistingThumbnailUrl] = useState(null); // url from backend
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [removeThumbnail, setRemoveThumbnail] = useState(false);

  const { draft, update: updateDraft, clear: clearDraft } = useCourseDraft();

  // inline validation errors
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const list = await categoryService.getAll();
        setCategories(list);
      } catch (err) {
        console.error("Failed to load categories:", err);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  // populate from courseData when editing existing course
  useEffect(() => {
    if (!courseData) return;
    setTitle(courseData.title ?? "");
    setDescription(courseData.description ?? "");
    // setBio(courseData.instructor_bio ?? courseData.bio ?? "");
    setCategory(courseData.category?._id ?? courseData.category ?? "");
    setPrice(courseData.price ?? "");
    setNewCategory("");
    setExistingThumbnailUrl(
      courseData.thumbnail ?? courseData.image ?? courseData.imageUrl ?? null
    );
    setThumbnailPreview(null);
    setRemoveThumbnail(false);

    // NEW: populate duration from courseData if present
    if (courseData.duration) {
      setDurationValue(courseData.duration.value ?? "");
      setDurationUnit(courseData.duration.unit ?? "day");
    } else {
      setDurationValue("");
      setDurationUnit("day");
    }
  }, [courseData]);

  // If there's draft in context and no courseData, apply it
  useEffect(() => {
    if (courseData) return;
    if (!draft) return;
    setTitle((v) => (v ? v : draft.title ?? ""));
    setDescription((v) => (v ? v : draft.description ?? ""));
    // setBio((v) => (v ? v : draft.bio ?? ""));
    setCategory((v) => (v ? v : draft.category ?? ""));
    setPrice((v) => (v ? v : draft.price ?? ""));
    setExistingThumbnailUrl((v) => (v ? v : draft.thumbnailUrl ?? null));
    setRemoveThumbnail(!!draft.removeThumbnail);
    // NEW: restore duration from draft if present
    setDurationValue((v) => (v ? v : draft.durationValue ?? ""));
    setDurationUnit((v) => (v ? v : draft.durationUnit ?? "day"));
    // note: draft.hasNewFile cannot restore File object; user must re-select if needed
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft, courseData]);

  // sync local state -> draft context (persisted by provider)
  useEffect(() => {
    try {
      updateDraft({
        title,
        description,
        // bio,
        category,
        price,
        thumbnailUrl: existingThumbnailUrl,
        hasNewFile: !!file,
        removeThumbnail,
        updatedAt: Date.now(),
        // NEW: duration saved in draft
        durationValue,
        durationUnit,
      });
    } catch (e) {
      console.warn("Failed to update draft:", e);
    }
  }, [
    title,
    description,
    // bio,
    category,
    price,
    existingThumbnailUrl,
    file,
    removeThumbnail,
    durationValue,
    durationUnit,
    updateDraft,
  ]);

  useEffect(() => {
    return () => {
      if (thumbnailPreview) {
        URL.revokeObjectURL(thumbnailPreview);
      }
    };
  }, [thumbnailPreview]);

  const handleBrowse = () => {
    document.getElementById("fileInput")?.click();
  };

  const handleFileChange = (e) => {
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
    if (file) {
      if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
      setFile(null);
      setThumbnailPreview(null);
    } else {
      const input = document.getElementById("fileInput");
      if (input) input.value = "";
    }
  };

  const handleRemoveThumbnail = () => {
    if (thumbnailPreview) {
      URL.revokeObjectURL(thumbnailPreview);
      setThumbnailPreview(null);
      setFile(null);
    }
    setExistingThumbnailUrl(null);
    setRemoveThumbnail(true);
    const input = document.getElementById("fileInput");
    if (input) input.value = "";
  };

  const handleUpload = () => {
    handleBrowse();
  };

  const handleNext = async () => {
    // clear previous errors
    setErrors({});

    const nextErrors = {};
    if (!title.trim()) nextErrors.title = "Course title is required.";
    if (!newCategory && !category)
      nextErrors.category = "Please select or enter a category.";

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      // focus first invalid input (optional)
      const firstKey = Object.keys(nextErrors)[0];
      if (firstKey === "title") document.getElementById("title")?.focus();
      if (firstKey === "category") document.getElementById("category")?.focus();
      return;
    }

    try {
      setSaving(true);
      setErrors({});

      let categoryId = category;
      if (newCategory && newCategory.trim()) {
        try {
          const catPayload = {
            name: newCategory.trim(),
            description: newCategory.trim(),
          };
          const created = await categoryService.create(catPayload);
          categoryId = created?.id ?? created?._id ?? created;
        } catch (catErr) {
          console.error("Failed to create category:", catErr);
          const srv = catErr?.response?.data;
          const msg =
            Array.isArray(srv?.message) && srv.message.length
              ? srv.message.join("; ")
              : srv?.message || "See console for details";
          alert("Failed to create category: " + msg);
          setSaving(false);
          return;
        }
      }

      const payload = {
        title: title.trim(),
        description: description.trim(),
        main_instructor: user?._id || user?.id || null,
        category: categoryId,
        price: price !== "" ? Number(price) : undefined,
        // NEW: include duration if provided
        ...(durationValue !== ""
          ? { duration: { value: Number(durationValue), unit: durationUnit } }
          : {}),
        // instructor_bio: bio,
        ...(removeThumbnail ? { removeThumbnail: true } : {}),
      };
      console.log("Saving course with payload:", payload, { file });

      if (!payload.main_instructor) {
        alert(
          "Cannot create/update course: missing authenticated instructor id."
        );
        setSaving(false);
        return;
      }

      let res;
      if (file) {
        const formData = new FormData();
        Object.entries(payload).forEach(([k, v]) => {
          if (v !== undefined && v !== null) formData.append(k, v);
        });
        formData.append("thumbnail", file);

        if (isUpdate && courseId) {
          res = await api.put(`/courses/update/${courseId}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        } else {
          res = await api.post("/courses/create", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        }
      } else {
        if (isUpdate && courseId) {
          res = await api.put(`/courses/update/${courseId}`, payload);
        } else {
          res = await api.post("/courses/create", payload);
        }
      }

      const data = res?.data ?? res;
      const id = data?._id ?? data?.id ?? courseId;

      // ensure courseId persisted so other pages (Modules) and subsequent mount restore draft
      if (id) {
        sessionStorage.setItem("currentCourseId", id);
        sessionStorage.setItem(
          "currentCourseData",
          JSON.stringify({
            ...data,
            lastUpdated: data.updatedAt
              ? new Date(data.updatedAt).toLocaleDateString()
              : data.updatedAt || "—",
          })
        );
      }

      // clear draft on successful save
      clearDraft();
      navigate("/create-course/modules", { state: { id } });
    } catch (err) {
      console.error("Failed to save course:", err);
      console.error("server response:", err.response?.data);
      const server = err?.response?.data;
      if (server?.errors && Array.isArray(server.errors)) {
        console.table(server.errors);
        alert(
          "Save failed: " +
            (server.message || "Validation error. Check console.")
        );
      } else {
        alert("Save failed. Check console for details.");
      }
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
            <div className="space-y-3">
              <div className="font-semibold text-gray-700">
                Upload thumbnail
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-xl p-2 hover:border-indigo-500 transition-colors bg-white shadow-sm relative">
                <input
                  id="fileInput"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={handleFileChange}
                />

                <div className="flex flex-col items-center justify-center text-gray-500 min-h-[250px] overflow-hidden rounded-lg">
                  {thumbnailPreview || existingThumbnailUrl ? (
                    <img
                      src={thumbnailPreview || existingThumbnailUrl}
                      alt="thumbnail preview"
                      className="object-cover w-full h-[250px]"
                    />
                  ) : (
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
                          d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7M7 7l5 5 5-5"
                        />
                      </svg>

                      <p className="text-lg font-semibold text-gray-700 mb-1">
                        Drop image here
                      </p>
                      <p className="text-sm text-gray-500 mb-2">
                        Supported format: JPG, PNG, WEBP...
                      </p>
                      <p className="text-sm font-medium text-gray-400">OR</p>
                      <Button
                        type="button"
                        variant="outline"
                        className="mt-2 text-indigo-600 border-indigo-500 hover:bg-indigo-50"
                        onClick={handleBrowse}
                      >
                        Browse images
                      </Button>
                    </div>
                  )}
                </div>

                <div className="absolute bottom-4 right-4 flex gap-3">
                  <Button
                    variant="outline"
                    className="border-gray-300 text-gray-600 hover:bg-gray-100"
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>

                  {thumbnailPreview || existingThumbnailUrl ? (
                    <Button
                      variant="ghost"
                      className="text-red-600 border-red-200"
                      onClick={handleRemoveThumbnail}
                    >
                      Remove
                    </Button>
                  ) : null}

                  <Button
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    onClick={handleUpload}
                  >
                    Select
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mt-5">
            <div>
              <Label htmlFor="title" className="mb-2">
                Course Title
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              {errors.title && (
                <p className="text-sm text-red-600 mt-1">{errors.title}</p>
              )}
            </div>

            <div>
              <Label htmlFor="category" className="mb-2">
                Category
              </Label>
              <Select value={category} onValueChange={(v) => setCategory(v)}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.length === 0 ? (
                    <SelectItem value="__no_categories" disabled>
                      No categories
                    </SelectItem>
                  ) : (
                    categories.map((c) =>
                      c.id ? (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ) : null
                    )
                  )}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-red-600 mt-1">{errors.category}</p>
              )}

              <div className="mt-2">
                <Label htmlFor="newCategory" className="mb-2 text-sm">
                  Or enter new category
                </Label>
                <Input
                  id="newCategory"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Enter new category name"
                />
                {/* show same category error near newCategory when applicable */}
                {errors.category && !category && (
                  <p className="text-sm text-red-600 mt-1">{errors.category}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  If you enter a new category, it will be used instead of the
                  selected one.
                </p>
              </div>
            </div>

            {/* PRICE + DURATION ROW */}
            <div className="col-span-2 grid grid-cols-2 gap-6">
              <div>
                <Label htmlFor="price" className="mb-2">
                  Price (VNĐ)
                </Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>

              {/* NEW: Duration input */}
              <div>
                <Label htmlFor="durationValue" className="mb-2">
                  Duration
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="durationValue"
                    type="number"
                    min="0"
                    value={durationValue}
                    onChange={(e) => setDurationValue(e.target.value)}
                    placeholder="e.g. 30"
                  />
                  <Select
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

            <div className="">
              <Label htmlFor="description" className="mb-2">
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="description here..."
                className="min-h-[100px] resize-none"
              />
            </div>

            <div className="">
              <Label htmlFor="bio" className="mb-2">
                Instructor Bio
              </Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Instructor bio..."
                className="min-h-[100px] resize-none"
              />
            </div>
          </div>

          <div className="space-y-3 mt-5">
            {[
              "Allow students attach files to discussions",
              "Allow students create discussions topics",
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

          <div className="flex justify-end pt-4 border-t mt-5">
            <Button
              variant="outline"
              className="px-6 text-indigo-500"
              onClick={handleNext}
              disabled={saving}
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
