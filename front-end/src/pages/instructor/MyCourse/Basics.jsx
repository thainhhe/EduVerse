import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { categoryService } from "@/services/categoryService";
import { useAuth } from "@/hooks/useAuth";
import api from "@/services/api";

const Basics = ({ courseId = null, isUpdate = false, courseData = null }) => {
  const navigate = useNavigate();
  const { user } = useAuth() || {};
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const [categories, setCategories] = useState([]);

  // Controlled fields
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("");
  const [language, setLanguage] = useState("");
  const [timezone, setTimezone] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const list = await categoryService.getAll();
        setCategories(list); // list already normalized by service
      } catch (err) {
        console.error("Failed to load categories:", err);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!courseData) return;
    // populate controlled fields from courseData
    setTitle(courseData.title ?? "");
    setDescription(courseData.description ?? "");
    setBio(courseData.instructor_bio ?? courseData.bio ?? "");
    setStartDate(
      courseData.startDate
        ? new Date(courseData.startDate).toISOString().slice(0, 10)
        : ""
    );
    setEndDate(
      courseData.endDate
        ? new Date(courseData.endDate).toISOString().slice(0, 10)
        : ""
    );
    // map backend fields to selects if they exist
    setCategory(courseData.category?._id ?? courseData.category ?? "");
    setLevel(courseData.level ?? "");
    setLanguage(courseData.language ?? "");
    setTimezone(courseData.timezone ?? "");
    // NOTE: file/thumbnail remains client-side until upload implemented
  }, [courseData]);

  const handleBrowse = () => {
    document.getElementById("fileInput")?.click();
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) setFile(selectedFile);
  };

  const handleCancel = () => {
    setFile(null);
    const input = document.getElementById("fileInput");
    if (input) input.value = "";
  };

  const handleUpload = () => {
    if (!file) {
      alert("Please select a file first.");
      return;
    }
    console.log("Uploading (placeholder):", file);
  };

  const handleNext = async () => {
    // Build payload according to backend Course schema.
    const payload = {
      title: title.trim(),
      description: description.trim(),
      main_instructor: user?._id || user?.id || null,
      category: category || undefined,
      level: level || undefined,
      language: language || undefined,
      timezone: timezone || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      instructor_bio: bio,
    };

    if (!payload.main_instructor) {
      alert(
        "Cannot create/update course: missing authenticated instructor id."
      );
      return;
    }

    try {
      setSaving(true);

      // Prepare FormData so backend upload middleware (upload.single('thumbnail')) works
      const formData = new FormData();
      Object.entries(payload).forEach(([k, v]) => {
        if (v !== undefined && v !== null) formData.append(k, v);
      });
      if (file) {
        formData.append("thumbnail", file);
      }

      let res;
      if (isUpdate && courseId) {
        // let axios set Content-Type (with boundary) automatically
        res = await api.put(`/courses/update/${courseId}`, formData);
        const data = res?.data ?? res;
        const id = data?._id || courseId;
        navigate("/create-course/modules", { state: { id } });
      } else {
        // let axios set Content-Type (with boundary) automatically
        res = await api.post("/courses/create", formData);
        const data = res?.data ?? res;
        const id = data?._id || data?.id;
        navigate("/create-course/modules", { state: { id } });
      }
    } catch (err) {
      // Log server validation error body
      console.error("Failed to save course:", err);
      console.error("server response:", err.response?.data);
      alert("Save failed. Check console for details.");
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
              <div className="font-semibold text-gray-700">Upload video</div>

              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 hover:border-indigo-500 transition-colors bg-white shadow-sm relative">
                <input
                  id="fileInput"
                  type="file"
                  accept="video/mp4,video/avi,video/mov"
                  className="hidden"
                  onChange={handleFileChange}
                />

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
                      <p className="text-lg font-semibold text-gray-700 mb-1">
                        Drop video here
                      </p>
                      <p className="text-sm text-gray-500 mb-2">
                        Supported format: MP4, AVI, MOV...
                      </p>
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
                      <p className="text-lg font-semibold text-gray-700 mb-2">
                        Selected file:
                      </p>
                      <p className="text-sm text-indigo-600 font-medium">
                        {file.name}
                      </p>
                    </>
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
            </div>

            <div>
              <Label htmlFor="level" className="mb-2">
                Course Level
              </Label>
              <Select value={level} onValueChange={(v) => setLevel(v)}>
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
              <Label htmlFor="language" className="mb-2">
                Language
              </Label>
              <Select value={language} onValueChange={(v) => setLanguage(v)}>
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
                <Label htmlFor="timezone" className="mb-2">
                  Timezone
                </Label>
                <Select value={timezone} onValueChange={(v) => setTimezone(v)}>
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
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <Label htmlFor="startDate" className="mb-2">
                    Start Date
                  </Label>
                  <div className="relative">
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="pr-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="endDate" className="mb-2">
                    End Date
                  </Label>
                  <div className="relative">
                    <Input
                      id="endDate"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="pr-10"
                    />
                  </div>
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
