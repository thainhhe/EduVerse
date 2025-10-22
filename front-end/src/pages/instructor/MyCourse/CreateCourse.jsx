import React, { useEffect, useState } from 'react'
import Basics from './Basics'
import SideBar from '../SideBar/SideBar'
import { ArrowLeft, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLocation, useNavigate } from 'react-router-dom'

const CreateCourse = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const courseId = location.state?.id || null;
    console.log("courseId", courseId)
    const [courseData, setCourseData] = useState(null)
    const [loading, setLoading] = useState(false)

    // Check xem là đang update hay tạo mới
    const isUpdateMode = !!courseId

    // useEffect(() => {
    //     if (isUpdateMode) {
    //         fetchCourseData()
    //     }
    // }, [courseId])

    // const fetchCourseData = async () => {
    //     try {
    //         setLoading(true)
    //         const res = await get(`/courses/${courseId}`)
    //         setCourseData(res.data)
    //     } catch (err) {
    //         console.error("Failed to fetch course:", err)
    //     } finally {
    //         setLoading(false)
    //     }
    // }

    return (

        <div>
            <header className="">
                <div className="flex items-center">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <div className="text-sm text-muted-foreground">My Courses</div>
                    </div>


                </div>
            </header>
            <main className="mt-5">
                <Basics />
            </main>

        </div>
    )

}

export default CreateCourse